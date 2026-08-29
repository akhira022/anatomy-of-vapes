import { NextResponse } from "next/server";
import { buildCitations } from "@/lib/chat/citations";
import { generateGeminiAnswer, isGeminiConfigured } from "@/lib/chat/gemini";
import { buildLocalAnswer } from "@/lib/chat/local-answer";
import { guardChatInput } from "@/lib/chat/guard";
import { isLowQualityAnswer, postprocessAnswer } from "@/lib/chat/postprocess";
import { buildUserPrompt, trimHistory } from "@/lib/chat/prompt";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import {
  formatRetrievedContext,
  pickPrimaryHotspotId,
  retrieveKnowledge,
} from "@/lib/chat/retrieve";
import {
  chunkTextForStream,
  encodeNdjsonLine,
  streamGeminiAnswer,
} from "@/lib/chat/stream";
import type {
  ChatRequestBody,
  ChatResponseBody,
  ChatStreamEvent,
} from "@/types/chat";

export const runtime = "nodejs";

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function streamNdjson(events: AsyncIterable<ChatStreamEvent>) {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(encodeNdjsonLine(event));
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "ระบบผู้ช่วยชั่วคราวไม่พร้อม";
        controller.enqueue(
          encodeNdjsonLine({
            type: "error",
            message:
              "ขออภัย ระบบผู้ช่วยชั่วคราวไม่พร้อม ลองใหม่อีกครั้งหรือสำรวจโมเดล 3D ในแอปนะ",
          } satisfies ChatStreamEvent)
        );
        console.error("[chat stream]", message);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

async function* buildAnswerStream(params: {
  message: string;
  history: ReturnType<typeof trimHistory>;
  refuseAnswer?: string;
  refused?: boolean;
}): AsyncGenerator<ChatStreamEvent> {
  const { message, history, refuseAnswer, refused } = params;

  if (refuseAnswer) {
    for await (const text of chunkTextForStream(refuseAnswer)) {
      yield { type: "delta", text };
    }
    yield {
      type: "meta",
      citations: [],
      category: "ทั่วไป",
      mode: "rag",
      ...(refused ? { refused: true } : {}),
    };
    yield { type: "done" };
    return;
  }

  const chunks = retrieveKnowledge(message, { topK: 5 });
  const context = formatRetrievedContext(chunks);
  const citations = buildCitations(chunks);
  const hotspotId = pickPrimaryHotspotId(chunks);
  const category = chunks[0]?.category ?? "ทั่วไป";
  const userPrompt = buildUserPrompt(message, context);
  const chunkIds = chunks.map((chunk) => chunk.id);

  let mode: "ai" | "rag" = "rag";
  let streamed = false;

  if (isGeminiConfigured()) {
    try {
      let full = "";
      for await (const { text } of streamGeminiAnswer(userPrompt, history)) {
        full += text;
      }
      full = postprocessAnswer(full);
      if (full && !isLowQualityAnswer(full)) {
        streamed = true;
        mode = "ai";
        for await (const text of chunkTextForStream(full)) {
          yield { type: "delta", text };
        }
      }
    } catch (error) {
      console.warn("[chat] Gemini stream unavailable, using local RAG:", error);
      streamed = false;
    }
  }

  if (!streamed) {
    const local = postprocessAnswer(buildLocalAnswer(chunks));
    for await (const text of chunkTextForStream(local)) {
      yield { type: "delta", text };
    }
    mode = "rag";
  }

  yield {
    type: "meta",
    citations,
    hotspotId,
    category,
    mode,
    chunkIds,
  };
  yield { type: "done" };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim() ?? "";
    const history = trimHistory(body.history);
    const sessionId = body.sessionId?.trim() || undefined;
    const wantStream = body.stream === true;

    const guard = guardChatInput(message, history.length);
    if (!guard.allowed) {
      const answer = guard.response ?? "ไม่สามารถตอบคำถามนี้ได้";
      if (wantStream) {
        return streamNdjson(
          buildAnswerStream({
            message,
            history,
            refuseAnswer: answer,
            refused: guard.refused,
          })
        );
      }
      const response: ChatResponseBody = {
        answer,
        citations: [],
        category: "ทั่วไป",
        refused: guard.refused,
      };
      return NextResponse.json(response);
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(sessionId, ip);
    if (!rate.allowed) {
      const answer = `ถามบ่อยเกินไป ลองใหม่อีกครั้งใน ${rate.retryAfterSec ?? 60} วินาทีนะ`;
      if (wantStream) {
        return new Response(
          new ReadableStream({
            start(controller) {
              const events: ChatStreamEvent[] = [
                { type: "delta", text: answer },
                {
                  type: "meta",
                  citations: [],
                  category: "ทั่วไป",
                  mode: "rag",
                  refused: true,
                },
                { type: "done" },
              ];
              for (const event of events) {
                controller.enqueue(encodeNdjsonLine(event));
              }
              controller.close();
            },
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/x-ndjson; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
            },
          }
        );
      }
      return NextResponse.json(
        {
          answer,
          citations: [],
          category: "ทั่วไป",
          refused: true,
        } satisfies ChatResponseBody,
        { status: 429 }
      );
    }

    if (wantStream) {
      return streamNdjson(buildAnswerStream({ message, history }));
    }

    const chunks = retrieveKnowledge(message, { topK: 5 });
    const context = formatRetrievedContext(chunks);
    const citations = buildCitations(chunks);
    const hotspotId = pickPrimaryHotspotId(chunks);
    const category = chunks[0]?.category ?? "ทั่วไป";
    const userPrompt = buildUserPrompt(message, context);

    let answer = postprocessAnswer(buildLocalAnswer(chunks));
    let mode: "ai" | "rag" = "rag";

    if (isGeminiConfigured()) {
      try {
        const result = await generateGeminiAnswer(userPrompt, history);
        const aiAnswer = postprocessAnswer(result.answer);
        if (!isLowQualityAnswer(aiAnswer)) {
          answer = aiAnswer;
          mode = "ai";
        }
      } catch (error) {
        console.warn("[chat] Gemini providers unavailable, using local RAG:", error);
      }
    }

    const response: ChatResponseBody = {
      answer,
      citations,
      hotspotId,
      category,
      chunkIds: chunks.map((chunk) => chunk.id),
      mode,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[chat]", error);
    return NextResponse.json(
      {
        answer:
          "ขออภัย ระบบผู้ช่วยชั่วคราวไม่พร้อม ลองใหม่อีกครั้งหรือสำรวจโมเดล 3D ในแอปนะ",
        citations: [],
        category: "ทั่วไป",
      } satisfies ChatResponseBody,
      { status: 500 }
    );
  }
}
