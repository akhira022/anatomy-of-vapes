"use client";

import type { BodyOrgan } from "@/data/body-impact";
import { cn } from "@/lib/utils";

export interface OrganProgressItem {
  organ: BodyOrgan;
  shortTitle: string;
}

interface OrganProgressDotsProps {
  items: OrganProgressItem[];
  activeOrgan: BodyOrgan;
  onSelect: (organ: BodyOrgan) => void;
  className?: string;
}

export function OrganProgressDots({
  items,
  activeOrgan,
  onSelect,
  className,
}: OrganProgressDotsProps) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.organ === activeOrgan)
  );
  const active = items[activeIndex] ?? items[0];
  const total = items.length;
  const position = String(activeIndex + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-card backdrop-blur-sm",
        className
      )}
    >
      <p
        className="font-heading text-sm font-semibold tracking-tight text-textPrimary sm:text-base"
        aria-live="polite"
      >
        <span>{active?.shortTitle ?? "—"}</span>
        <span className="mx-2 text-textSecondary" aria-hidden="true">
          ·
        </span>
        <span className="tabular-nums text-textSecondary">
          {position} / {totalLabel}
        </span>
      </p>

      <div
        role="tablist"
        aria-label="เลือกอวัยวะ"
        className="flex items-center gap-1"
      >
        {items.map((item, index) => {
          const selected = item.organ === activeOrgan;
          return (
            <button
              key={item.organ}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${item.shortTitle} ${String(index + 1).padStart(2, "0")} จาก ${totalLabel}`}
              onClick={() => onSelect(item.organ)}
              className={cn(
                "flex size-11 items-center justify-center rounded-full outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "rounded-full transition-[width,height,background-color,box-shadow] duration-normal",
                  selected
                    ? "size-3 bg-primary shadow-glow-red"
                    : "size-2.5 bg-border hover:bg-textSecondary"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
