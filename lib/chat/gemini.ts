import type { ChatHistoryMessage } from "@/types/chat";
import { generateDirectGeminiAnswer } from "@/lib/chat/providers/direct-gemini";
import {
  generateOpenRouterAnswer,
  isOpenRouterConfigured,
} from "@/lib/chat/providers/openrouter-gemini";

export type GeminiProvider = "google" | "openrouter";

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim()) || isOpenRouterConfigured();
}

export function getActiveGeminiProviders(): GeminiProvider[] {
  const providers: GeminiProvider[] = [];
  if (process.env.GEMINI_API_KEY?.trim()) providers.push("google");
  if (isOpenRouterConfigured()) providers.push("openrouter");
  return providers;
}

export async function generateGeminiAnswer(
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): Promise<{ answer: string; provider: GeminiProvider }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const errors: string[] = [];

  if (apiKey) {
    try {
      const answer = await generateDirectGeminiAnswer(apiKey, userPrompt, history);
      return { answer, provider: "google" };
    } catch (error) {
      errors.push(
        `Google: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (isOpenRouterConfigured()) {
    try {
      const answer = await generateOpenRouterAnswer(userPrompt, history);
      return { answer, provider: "openrouter" };
    } catch (error) {
      errors.push(
        `OpenRouter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (!apiKey && !isOpenRouterConfigured()) {
    throw new Error("GEMINI_API_KEY or OPENROUTER_API_KEY is not configured");
  }

  throw new Error(errors.join(" | ") || "Gemini providers unavailable");
}

/** @deprecated ใช้ buildLocalAnswer แทน */
export function buildFallbackAnswer(topContent: string): string {
  const lines = topContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  return lines.join(" ");
}
