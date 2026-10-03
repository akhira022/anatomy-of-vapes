"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SCROLL_HIDE_PX = 48;
const TARGET_ID = "body-impact";

export function LandingScrollHint() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    const syncScroll = () => {
      setVisible(window.scrollY < SCROLL_HIDE_PX);
    };
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, []);

  useEffect(() => {
    const body = document.body;
    const syncPromo = () => {
      setPromoOpen(body.classList.contains("promo-dialog-open"));
    };
    syncPromo();
    const observer = new MutationObserver(syncPromo);
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const scrollToContent = useCallback(() => {
    const target = document.getElementById(TARGET_ID);
    if (!target) return;
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reduceMotion]);

  const show = visible && !promoOpen;

  return (
    <div
      id="landing-scroll-hint"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center",
        "bg-gradient-to-t from-background via-background/80 to-transparent",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10 pr-16 sm:pr-4",
        "transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!show}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        onClick={scrollToContent}
        className={cn(
          "pointer-events-auto inline-flex min-h-11 flex-col items-center justify-center gap-0.5",
          "rounded-lg px-4 py-1.5 text-textSecondary outline-none",
          "transition-colors hover:text-textPrimary",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          !show && "pointer-events-none"
        )}
        aria-label="เลื่อนดูเนื้อหาด้านล่าง"
      >
        <span className="text-xs font-medium tracking-wide sm:text-sm">
          เลื่อนดูเนื้อหาด้านล่าง
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-5",
            !reduceMotion && show && "animate-scroll-hint-bounce"
          )}
          strokeWidth={1.75}
        />
      </button>
    </div>
  );
}
