import type { ChatHistoryMessage } from "@/types/chat";
import { streamDirectGeminiAnswer } from "@/lib/chat/providers/direct-gemini";
import {
  isOpenRouterConfigured,
  streamOpenRouterAnswer,
} from "@/lib/chat/providers/openrouter-gemini";
import type { GeminiProvider } from "@/lib/chat/gemini";

const FIRST_TOKEN_MS = 8_000;
/** Shorter wait when a prior provider already failed hard (e.g. Google 403). */
const FALLBACK_FIRST_TOKEN_MS = 5_000;
const TOTAL_STREAM_MS = 28_000;

/** Split a full answer into word-group deltas for typewriter-style RAG fallback. */
export async function* chunkTextForStream(
  answer: string,
  wordsPerChunk = 8
): AsyncGenerator<string> {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const slice = words.slice(i, i + wordsPerChunk).join(" ");
    const isLast = i + wordsPerChunk >= words.length;
    yield isLast ? slice : `${slice} `;
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
}

async function* withStreamDeadlines<T>(
  source: AsyncIterable<T>,
  label: string,
  firstTokenMs = FIRST_TOKEN_MS
): AsyncGenerator<T> {
  const iterator = source[Symbol.asyncIterator]();
  const started = Date.now();
  let gotFirst = false;

  while (true) {
    const elapsed = Date.now() - started;
    const remainingTotal = TOTAL_STREAM_MS - elapsed;
    const remainingFirst = firstTokenMs - elapsed;
    const waitMs = gotFirst
      ? remainingTotal
      : Math.min(remainingFirst, remainingTotal);

    if (waitMs <= 0) {
      throw new Error(`${label} timed out waiting for tokens`);
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        iterator.next(),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`${label} timed out after ${waitMs}ms`));
          }, waitMs);
        }),
      ]);

      if (result.done) return;
      gotFirst = true;
      yield result.value;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

/**
 * Streams Gemini answer deltas: Google first, then OpenRouter.
 * Enforces first-token and total deadlines so the UI never hangs forever.
 */
export async function* streamGeminiAnswer(
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): AsyncGenerator<{ text: string; provider: GeminiProvider }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const errors: string[] = [];
  let googleHardFail = false;

  if (apiKey) {
    try {
      yield* withStreamDeadlines(
        (async function* () {
          for await (const text of streamDirectGeminiAnswer(
            apiKey,
            userPrompt,
            history
          )) {
            yield { text, provider: "google" as const };
          }
        })(),
        "Google Gemini"
      );
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Google: ${message}`);
      googleHardFail = /403|401|PERMISSION_DENIED|Forbidden|API_KEY/i.test(
        message
      );
    }
  }

  if (isOpenRouterConfigured()) {
    try {
      yield* withStreamDeadlines(
        (async function* () {
          for await (const text of streamOpenRouterAnswer(userPrompt, history)) {
            yield { text, provider: "openrouter" as const };
          }
        })(),
        "OpenRouter",
        googleHardFail ? FALLBACK_FIRST_TOKEN_MS : FIRST_TOKEN_MS
      );
      return;
    } catch (error) {
      errors.push(
        `OpenRouter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (!apiKey && !isOpenRouterConfigured()) {
    throw new Error("GEMINI_API_KEY or OPENROUTER_API_KEY is not configured");
  }

  throw new Error(errors.join(" | ") || "Gemini stream providers unavailable");
}

export function encodeNdjsonLine(event: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}
