import type { ChatHistoryMessage } from "@/types/chat";
import { SYSTEM_PROMPT } from "@/lib/chat/prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const OPENROUTER_MODELS = [
  process.env.OPENROUTER_MODEL,
  "google/gemini-3.6-flash",
  "google/gemini-3.5-flash",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free",
]
  .filter((model): model is string => Boolean(model?.trim()))
  .filter((model, index, list) => list.indexOf(model) === index);

export function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

export async function generateOpenRouterAnswer(
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const referer =
    process.env.OPENROUTER_SITE_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "http://localhost:3001";

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user" as const, content: userPrompt },
  ];

  let lastError = "OpenRouter request failed";

  for (const model of OPENROUTER_MODELS) {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": "Anatomy of Vapes",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 768,
      }),
    });

    if (!response.ok) {
      lastError = `OpenRouter error (${response.status}, ${model}): ${await response.text()}`;
      if ([402, 403, 404, 429].includes(response.status)) continue;
      throw new Error(lastError);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    lastError = `OpenRouter returned empty response (${model})`;
  }

  throw new Error(lastError);
}

/**
 * Streams text deltas from OpenRouter chat completions (SSE).
 */
export async function* streamOpenRouterAnswer(
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): AsyncGenerator<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const referer =
    process.env.OPENROUTER_SITE_URL?.trim() ??
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    "http://localhost:3001";

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    { role: "user" as const, content: userPrompt },
  ];

  let lastError = "OpenRouter stream failed";

  for (const model of OPENROUTER_MODELS) {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": referer,
        "X-Title": "Anatomy of Vapes",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 768,
        stream: true,
      }),
    });

    if (!response.ok) {
      lastError = `OpenRouter stream error (${response.status}, ${model}): ${await response.text()}`;
      if ([402, 403, 404, 429].includes(response.status)) continue;
      throw new Error(lastError);
    }

    if (!response.body) {
      lastError = `OpenRouter stream had no body (${model})`;
      continue;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let yielded = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            yielded = true;
            yield text;
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }

    if (yielded) return;
    lastError = `OpenRouter stream empty (${model})`;
  }

  throw new Error(lastError);
}

export async function probeOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false as const, message: "OPENROUTER_API_KEY not set" };
  }

  const model = OPENROUTER_MODELS[0] ?? "google/gemma-4-26b-a4b-it:free";

  try {
    await generateOpenRouterAnswer("ตอบคำว่า สวัสดี เท่านั้น", []);
    return { ok: true as const, model };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false as const, model, message };
  }
}
