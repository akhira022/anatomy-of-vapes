"use client";

import { useReducedMotion } from "framer-motion";
import type { ChatUiMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { ChatCitationList } from "@/components/chat/ChatCitation";
import { ChatHotspotLink } from "@/components/chat/ChatHotspotLink";
import { Loader2 } from "lucide-react";

interface ChatMessageProps {
  message: ChatUiMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const reduceMotion = useReducedMotion();
  const showLive = !isUser && (message.streaming || message.pending);

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground",
          message.error && "border-destructive/40 bg-destructive/5"
        )}
        aria-live={showLive ? "polite" : undefined}
        aria-atomic={showLive ? false : undefined}
      >
        {message.pending && !message.content ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            กำลังคิดคำตอบ...
          </span>
        ) : (
          <p className="whitespace-pre-wrap">
            {message.content}
            {message.streaming && !reduceMotion ? (
              <span
                className="ml-0.5 inline-block animate-pulse text-primary"
                aria-hidden="true"
              >
                ▍
              </span>
            ) : null}
          </p>
        )}

        {!isUser && !message.pending && !message.streaming && message.citations?.length ? (
          <ChatCitationList citations={message.citations} />
        ) : null}

        {!isUser && !message.pending && !message.streaming && message.mode === "rag" ? (
          <p className="mt-2 text-[0.65rem] text-muted-foreground">
            สรุปจากฐานความรู้ในระบบ
          </p>
        ) : null}

        {!isUser && !message.pending && !message.streaming && message.hotspotId ? (
          <ChatHotspotLink hotspotId={message.hotspotId} />
        ) : null}
      </div>
    </div>
  );
}
