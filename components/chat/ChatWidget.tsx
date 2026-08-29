"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatQuickPrompts } from "@/components/chat/ChatQuickPrompts";
import { useChat } from "@/components/chat/useChat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, MessageCircle, RotateCcw, X } from "lucide-react";

const ENABLED_PREFIXES = [
  "/",
  "/register",
  "/login",
  "/anatomy",
  "/result",
];

const HIDDEN_PREFIXES = ["/pretest", "/posttest", "/admin"];

function isChatEnabled(pathname: string) {
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  if (pathname === "/") return true;
  return ENABLED_PREFIXES.some(
    (prefix) => prefix !== "/" && pathname.startsWith(prefix)
  );
}

export function ChatWidget() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const { messages, loading, sendMessage, clearMessages } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  const enabled = isChatEnabled(pathname);

  const askedQuickPrompts = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim());

  const lastMessage = messages[messages.length - 1];
  const showFollowUpPrompts =
    !loading &&
    messages.length > 0 &&
    lastMessage?.role === "assistant" &&
    !lastMessage?.pending;

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  if (!enabled) return null;

  return (
    <>
      {open ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-[60] flex max-h-[min(78vh,640px)] flex-col",
            "rounded-t-2xl border border-border bg-card shadow-2xl",
            "sm:inset-x-auto sm:right-4 sm:bottom-20 sm:w-[min(100vw-2rem,24rem)] sm:rounded-2xl"
          )}
          role="dialog"
          aria-label="ผู้ช่วยเรียนรู้ AI"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="size-4" />
              </span>
              <div>
                <p className="font-heading text-sm font-semibold">
                  ผู้ช่วยเรียนรู้ AI
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  ถามเรื่องบุหรี่ไฟฟ้าได้เลย
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearMessages}
                  aria-label="ล้างแชท"
                >
                  <RotateCcw className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="ปิดแชท"
              >
                <X className="size-4" />
              </Button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  สวัสดี! ถามได้เรื่องส่วนประกอบ ผลเสีย กฎหมาย
                  หรือทักษะปฏิเสธเพื่อน
                </p>
                <ChatQuickPrompts
                  onSelect={sendMessage}
                  disabled={loading}
                  label="คำถามแนะนำ"
                />
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {showFollowUpPrompts ? (
                  <ChatQuickPrompts
                    onSelect={sendMessage}
                    disabled={loading}
                    exclude={askedQuickPrompts}
                    label="คำถามแนะนำ"
                  />
                ) : null}
              </>
            )}
          </div>

          <div className="border-t border-border p-3">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        size="icon-lg"
        className={cn(
          "fixed right-4 bottom-4 z-[60] size-14 rounded-full shadow-lg",
          open && "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "ปิดผู้ช่วยเรียนรู้" : "เปิดผู้ช่วยเรียนรู้"}
        aria-expanded={open}
      >
        <MessageCircle className="size-6" />
      </Button>
    </>
  );
}
