"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ChatHistoryMessage,
  ChatRequestBody,
  ChatResponseBody,
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

export function useChat() {
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          content: "กำลังค้นหาข้อมูล...",
          pending: true,
        },
      ]);
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: history.slice(-6),
            sessionId: getSessionId(),
          } satisfies ChatRequestBody),
        });

        const data = (await response.json()) as ChatResponseBody;

        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? {
                  id: pendingId,
                  role: "assistant",
                  content: data.answer,
                  citations: data.citations,
                  hotspotId: data.hotspotId,
                  refused: data.refused,
                  mode: data.mode,
                }
              : message
          )
        );

        if (!response.ok && response.status !== 429) {
          setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        }
      } catch {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? {
                  id: pendingId,
                  role: "assistant",
                  content:
                    "เชื่อมต่อไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่นะ",
                  error: true,
                }
              : message
          )
        );
        setError("เชื่อมต่อไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    },
    [history, loading]
  );

  const clearMessages = useCallback(() => {
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
