"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatHistoryMessage,
  ChatRequestBody,
  ChatStreamEvent,
  ChatUiMessage,
} from "@/types/chat";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return "server";
  const key = "aov-chat-session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = createId();
  sessionStorage.setItem(key, id);
  return id;
}

async function* readNdjsonStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        yield JSON.parse(trimmed) as ChatStreamEvent;
      } catch {
        // skip malformed lines
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    try {
      yield JSON.parse(trailing) as ChatStreamEvent;
    } catch {
      // ignore
    }
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const history = useMemo<ChatHistoryMessage[]>(
    () =>
      messages
        .filter((m) => !m.pending && !m.error && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessage: ChatUiMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
      };

      const pendingId = createId();
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: pendingId,
          role: "assistant",
          content: "",
          pending: true,
          streaming: true,
        },
      ]);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: trimmed,
            history: history.slice(-6),
            sessionId: getSessionId(),
            stream: true,
          } satisfies ChatRequestBody),
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        // If server returned a non-stream JSON error body somehow, surface it.
        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("ndjson") && !contentType.includes("stream")) {
          const data = (await response.json()) as {
            answer?: string;
            refused?: boolean;
            mode?: "ai" | "rag";
            citations?: ChatUiMessage["citations"];
            hotspotId?: string;
          };
          setMessages((prev) =>
            prev.map((message) =>
              message.id === pendingId
                ? {
                    id: pendingId,
                    role: "assistant",
                    content:
                      data.answer?.trim() ||
                      "ขออภัย ไม่ได้รับคำตอบ ลองใหม่อีกครั้งนะ",
                    citations: data.citations,
                    hotspotId: data.hotspotId,
                    refused: data.refused,
                    mode: data.mode,
                    pending: false,
                    streaming: false,
                    error: !response.ok && response.status !== 429,
                  }
                : message
            )
          );
          if (!response.ok && response.status !== 429) {
            setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
          }
          return;
        }

        let receivedDelta = false;

        for await (const event of readNdjsonStream(response.body)) {
          if (controller.signal.aborted) break;

          if (event.type === "delta") {
            receivedDelta = true;
            setMessages((prev) =>
              prev.map((message) =>
                message.id === pendingId
                  ? {
                      ...message,
                      content: `${message.content}${event.text}`,
                      pending: false,
                      streaming: true,
                      error: false,
                    }
                  : message
              )
            );
          } else if (event.type === "meta") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === pendingId
                  ? {
                      ...message,
                      citations: event.citations,
                      hotspotId: event.hotspotId,
                      refused: event.refused,
                      mode: event.mode,
                      pending: false,
                    }
                  : message
              )
            );
          } else if (event.type === "error") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === pendingId
                  ? {
                      id: pendingId,
                      role: "assistant",
                      content: event.message,
                      error: true,
                      pending: false,
                      streaming: false,
                    }
                  : message
              )
            );
            setError(event.message);
          } else if (event.type === "done") {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === pendingId
                  ? {
                      ...message,
                      pending: false,
                      streaming: false,
                      content:
                        message.content ||
                        (receivedDelta
                          ? message.content
                          : "ขออภัย ไม่ได้รับคำตอบ ลองใหม่อีกครั้งนะ"),
                    }
                  : message
              )
            );
          }
        }

        if (!response.ok && response.status !== 429) {
          setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? {
                  id: pendingId,
                  role: "assistant",
                  content:
                    "เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่นะ",
                  error: true,
                  pending: false,
                  streaming: false,
                }
              : message
          )
        );
        setError("เชื่อมต่อไม่สำเร็จ");
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        setLoading(false);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? { ...message, pending: false, streaming: false }
              : message
          )
        );
      }
    },
    [history, loading]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
  };
}
