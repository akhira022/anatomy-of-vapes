"use client";

import { useCallback, useEffect, useRef } from "react";
import { Brain, HeartPulse, Scale, Wind, type LucideIcon } from "lucide-react";
import type { BodyImpactEntry } from "@/data/body-impact";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "impact-brain": Brain,
  "impact-lungs": Wind,
  "impact-heart": HeartPulse,
  "impact-vs-cigarette": Scale,
};

interface ImpactCarouselProps {
  items: BodyImpactEntry[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
}

export function ImpactCarousel({
  items,
  activeIndex,
  onActiveChange,
}: ImpactCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Programmatic scrolls (card click) must not be overridden when they settle.
  const programmaticRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: number | undefined;
    const settle = () => {
      if (programmaticRef.current) {
        programmaticRef.current = false;
        return;
      }
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let best = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const distance = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center);
        if (distance < best) {
          best = distance;
          closest = i;
        }
      });
      onActiveChange(closest);
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [onActiveChange]);

  const select = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const card = cardRefs.current[index];
      if (track && card) {
        const target =
          card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
        const max = track.scrollWidth - track.clientWidth;
        programmaticRef.current =
          Math.abs(Math.min(Math.max(target, 0), max) - track.scrollLeft) > 1;
      }
      onActiveChange(index);
      cardRefs.current[index]?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [onActiveChange]
  );

  return (
    <div>
      <div
        ref={trackRef}
        role="tablist"
        aria-label="ผลกระทบต่อร่างกาย"
        className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => {
          const Icon = icons[item.id] ?? Brain;
          const active = index === activeIndex;
          return (
            <button
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="impact-detail"
              onClick={() => select(index)}
              className={cn(
                "group relative flex w-[78%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-normal sm:w-[46%] lg:w-[23.5%]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary shadow-glow-red"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "relative flex h-32 items-start justify-between p-5 transition-colors",
                  active ? "bg-primary/15" : "bg-surface-2"
                )}
              >
                <span className="font-heading text-5xl font-bold leading-none tracking-tight text-textPrimary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-14 transition-transform duration-normal group-hover:scale-105",
                    active ? "text-primary" : "text-textSecondary"
                  )}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 border-t border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-textPrimary">
                  {item.title}
                </h3>
                <span className="w-fit rounded-full bg-textPrimary px-3 py-1 text-xs font-semibold text-background">
                  {item.badge}
                </span>
                <span
                  className={cn(
                    "mt-auto text-sm font-medium",
                    active ? "text-primary" : "text-textSecondary"
                  )}
                >
                  {active ? "กำลังดูอยู่ด้านล่าง ↓" : "ดูรายละเอียด →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`ไปการ์ดที่ ${index + 1}`}
              onClick={() => select(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-normal",
                index === activeIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-border hover:bg-textSecondary"
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-textSecondary" aria-live="polite">
          {activeIndex + 1} / {items.length}
        </span>
      </div>
    </div>
  );
}
