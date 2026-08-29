"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function getFocusable(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
}

export function ChatWidget() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const { messages, loading, sendMessage, clearMessages } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const enabled = isChatEnabled(pathname);

  const askedQuickPrompts = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim());

  const lastMessage = messages[messages.length - 1];
  const showFollowUpPrompts =
    !loading &&
    messages.length > 0 &&
    lastMessage?.role === "assistant" &&
    !lastMessage?.pending &&
    !lastMessage?.streaming;

  const closeChat = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current =
      (document.activeElement as HTMLElement | null) ??
      document.getElementById("chat-assistant-fab");

    const panel = panelRef.current;
    if (panel) {
      const focusable = getFocusable(panel);
      const first = focusable[0];
      first?.focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeChat();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = getFocusable(panelRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const restore =
        previouslyFocused.current ??
        document.getElementById("chat-assistant-fab");
      restore?.focus();
    };
  }, [open, closeChat]);

  if (!enabled) return null;

  return (
    <>
      {open ? (
        <div
          ref={panelRef}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[60] flex max-h-[min(78vh,640px)] flex-col",
            "rounded-t-2xl border border-border bg-card shadow-2xl",
            "sm:inset-x-auto sm:right-4 sm:bottom-20 sm:w-[min(100vw-2rem,24rem)] sm:rounded-2xl",
            "xl:right-6 xl:bottom-24 xl:max-h-[min(82vh,720px)] xl:w-[28rem]"
          )}
          role="dialog"
          aria-modal="true"
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
                  size="icon"
                  className="size-11"
                  onClick={clearMessages}
                  aria-label="ล้างแชท"
                >
                  <RotateCcw className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={closeChat}
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
        id="chat-assistant-fab"
        type="button"
        size="icon-lg"
        className={cn(
          "fixed right-4 bottom-4 z-[60] size-14 rounded-full shadow-lg xl:right-6 xl:bottom-6",
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
