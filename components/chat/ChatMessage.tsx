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
      >
        {message.pending ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {message.content}
          </span>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}

        {!isUser && !message.pending && message.citations?.length ? (
          <ChatCitationList citations={message.citations} />
        ) : null}

        {!isUser && !message.pending && message.mode === "rag" ? (
          <p className="mt-2 text-[0.65rem] text-muted-foreground">
            สรุปจากฐานความรู้ในระบบ
          </p>
        ) : null}

        {!isUser && !message.pending && message.hotspotId ? (
          <ChatHotspotLink hotspotId={message.hotspotId} />
        ) : null}
      </div>
    </div>
  );
}
