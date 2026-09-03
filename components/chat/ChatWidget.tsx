"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatQuickPrompts } from "@/components/chat/ChatQuickPrompts";
import { useChat } from "@/components/chat/useChat";
import { Button } from "@/components/ui/button";
import {
  SCENE_FULLSCREEN_EVENT,
  getSceneFullscreenRoot,
} from "@/lib/scene-fullscreen";
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
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const { messages, loading, sendMessage, clearMessages } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const enabled = isChatEnabled(pathname);
  const onAnatomy = pathname.startsWith("/anatomy");
  const inSceneFullscreen =
    Boolean(portalTarget) &&
    portalTarget !== document.body &&
    portalTarget != null;

  // Native fullscreen only shows descendants of the fullscreen root.
  useEffect(() => {
    const sync = () => {
      setPortalTarget(getSceneFullscreenRoot() ?? document.body);
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    document.addEventListener(SCENE_FULLSCREEN_EVENT, sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      document.removeEventListener(SCENE_FULLSCREEN_EVENT, sync);
    };
  }, []);

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

  if (!enabled || !portalTarget) return null;

  const ui = (
    <>
      {open ? (
        <div
          ref={panelRef}
          className={cn(
            "fixed z-[120] flex flex-col border border-border bg-card shadow-2xl",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 max-h-[min(78vh,640px)] rounded-t-2xl",
            // Tablet+: floating card above the FAB
            "sm:inset-x-auto sm:max-h-[min(72vh,640px)] sm:w-[min(100vw-2rem,24rem)] sm:rounded-2xl",
            "xl:max-h-[min(78vh,680px)] xl:w-[26rem]",
            inSceneFullscreen
              ? // Fullscreen: sit above the hotspot dock, left side
                "sm:bottom-[7.5rem] sm:left-4 sm:right-auto xl:left-6"
              : onAnatomy
                ? "sm:bottom-24 sm:left-4 sm:right-auto xl:bottom-28 xl:left-6"
                : "sm:bottom-24 sm:right-4 xl:bottom-28 xl:right-6"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="ผู้ช่วยเรียนรู้ AI"
        >
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bot className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold">
                  ผู้ช่วยเรียนรู้ AI
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground">
                  ถามเรื่องบุหรี่ไฟฟ้าได้เลย
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
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
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
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

          <div className="shrink-0 border-t border-border p-3">
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      ) : null}

      <Button
        id="chat-assistant-fab"
        type="button"
        size="icon-lg"
        className={cn(
          // Below hotspot dialog (z-130). CSS hides this while the dialog is open.
          "fixed z-[90] size-14 rounded-full shadow-lg transition-opacity duration-normal",
          inSceneFullscreen
            ? // Above hotspot strip, bottom-left — clear of right-side controls
              "bottom-[max(6.5rem,calc(env(safe-area-inset-bottom)+5.5rem))] left-[max(1rem,env(safe-area-inset-left))] right-auto"
            : cn(
                "bottom-[max(1rem,env(safe-area-inset-bottom))]",
                onAnatomy
                  ? "left-4 right-auto xl:left-6 xl:bottom-6"
                  : "right-4 left-auto xl:right-6 xl:bottom-6"
              ),
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

  return createPortal(ui, portalTarget);
}
