import type { ChatHistoryMessage } from "@/types/chat";
import { streamDirectGeminiAnswer } from "@/lib/chat/providers/direct-gemini";
import {
  isOpenRouterConfigured,
  streamOpenRouterAnswer,
} from "@/lib/chat/providers/openrouter-gemini";
import type { GeminiProvider } from "@/lib/chat/gemini";

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
    // Small delay so the UI can paint between chunks
    await new Promise((resolve) => setTimeout(resolve, 24));
  }
}

/**
 * Streams Gemini answer deltas: Google first, then OpenRouter.
 */
export async function* streamGeminiAnswer(
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): AsyncGenerator<{ text: string; provider: GeminiProvider }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const errors: string[] = [];

  if (apiKey) {
    try {
      for await (const text of streamDirectGeminiAnswer(
        apiKey,
        userPrompt,
        history
      )) {
        yield { text, provider: "google" };
      }
      return;
    } catch (error) {
      errors.push(
        `Google: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (isOpenRouterConfigured()) {
    try {
      for await (const text of streamOpenRouterAnswer(userPrompt, history)) {
        yield { text, provider: "openrouter" };
      }
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
