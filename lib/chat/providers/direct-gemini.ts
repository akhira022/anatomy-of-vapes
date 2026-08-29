import { GoogleGenAI } from "@google/genai";
import type { ChatHistoryMessage } from "@/types/chat";
import { SYSTEM_PROMPT } from "@/lib/chat/prompt";

const DIRECT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
].filter((model): model is string => Boolean(model?.trim()));

function getClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

function extractInteractionText(data: Record<string, unknown>): string | null {
  const outputs = data.outputs as Array<{ type?: string; text?: string }> | undefined;
  const text =
    outputs?.find((item) => item.type === "text")?.text ?? outputs?.[0]?.text;
  return text?.trim() || null;
}

export async function generateDirectGeminiAnswer(
  apiKey: string,
  userPrompt: string,
  history: ChatHistoryMessage[] = []
): Promise<string> {
  const ai = getClient(apiKey);
  const historyBlock = history
    .map((message) =>
      message.role === "user"
        ? `ผู้ใช้: ${message.content}`
        : `ผู้ช่วย: ${message.content}`
    )
    .join("\n");

  const combinedInput = [
    SYSTEM_PROMPT,
    historyBlock ? `\nประวัติสนทนา:\n${historyBlock}` : "",
    `\n${userPrompt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const tried = new Set<string>();

  for (const model of DIRECT_MODELS) {
    if (tried.has(model)) continue;
    tried.add(model);

    try {
      const interaction = (await ai.interactions.create({
        model,
        input: combinedInput,
      })) as Record<string, unknown>;

      const fromInteraction = extractInteractionText(interaction);
      if (fromInteraction) return fromInteraction;
    } catch {
      // try next model / generateContent
    }

    try {
      const response = await ai.models.generateContent({
        model,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.4,
          maxOutputTokens: 512,
        },
        contents: [
          ...history.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          { role: "user", parts: [{ text: userPrompt }] },
        ],
      });

      const text = response.text?.trim();
      if (text) return text;
    } catch {
      // try next model
    }
  }

  throw new Error("Direct Gemini API unavailable for all configured models");
}

export async function probeDirectGemini(apiKey: string) {
  const ai = getClient(apiKey);
  const model = DIRECT_MODELS[0] ?? "gemini-3.6-flash";

  try {
    await ai.interactions.create({
      model,
      input: "ping",
    });
    return { ok: true as const, model };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false as const, model, message };
  }
}
