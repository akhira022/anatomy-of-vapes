import { NextResponse } from "next/server";
import { buildCitations } from "@/lib/chat/citations";
import { generateGeminiAnswer, isGeminiConfigured } from "@/lib/chat/gemini";
import { buildLocalAnswer } from "@/lib/chat/local-answer";
import { guardChatInput } from "@/lib/chat/guard";
import { buildUserPrompt, trimHistory } from "@/lib/chat/prompt";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import {
  formatRetrievedContext,
  pickPrimaryHotspotId,
  retrieveKnowledge,
} from "@/lib/chat/retrieve";
import type { ChatRequestBody, ChatResponseBody } from "@/types/chat";

export const runtime = "nodejs";

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim() ?? "";
    const history = trimHistory(body.history);
    const sessionId = body.sessionId?.trim() || undefined;

    const guard = guardChatInput(message, history.length);
    if (!guard.allowed) {
      const response: ChatResponseBody = {
        answer: guard.response ?? "ไม่สามารถตอบคำถามนี้ได้",
        citations: [],
        category: "ทั่วไป",
        refused: guard.refused,
      };
      return NextResponse.json(response);
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(sessionId, ip);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          answer: `ถามบ่อยเกินไป ลองใหม่อีกครั้งใน ${rate.retryAfterSec ?? 60} วินาทีนะ`,
          citations: [],
          category: "ทั่วไป",
          refused: true,
        } satisfies ChatResponseBody,
        { status: 429 }
      );
    }

    const chunks = retrieveKnowledge(message, { topK: 5 });
    const context = formatRetrievedContext(chunks);
    const citations = buildCitations(chunks);
    const hotspotId = pickPrimaryHotspotId(chunks);
    const category = chunks[0]?.category ?? "ทั่วไป";
    const userPrompt = buildUserPrompt(message, context);

    let answer = buildLocalAnswer(chunks);
    let mode: "ai" | "rag" = "rag";

    if (isGeminiConfigured()) {
      try {
        const result = await generateGeminiAnswer(userPrompt, history);
        answer = result.answer;
        mode = "ai";
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
