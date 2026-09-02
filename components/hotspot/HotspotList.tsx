"use client";

import { Check } from "lucide-react";
import type { HotspotContent } from "@/data/hotspots";
import { cn } from "@/lib/utils";

interface HotspotListProps {
  items: HotspotContent[];
  visitedIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
  headingId?: string;
}

export function HotspotList({
  items,
  visitedIds,
  selectedId,
  onSelect,
  className,
  headingId = "hotspot-list-heading",
}: HotspotListProps) {
  return (
    <section
      aria-labelledby={headingId}
      className={cn("space-y-3", className)}
    >
      <div>
        <h2
          id={headingId}
          className="font-heading text-base font-semibold text-textPrimary"
        >
          หรือเลือกจากรายการ
        </h2>
        <p className="mt-1 text-sm text-textSecondary">
          ถ้าแตะจุดบนโมเดลไม่เจอ กดจากรายการนี้ได้เลย
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const visited = visitedIds.includes(item.id);
          const selected = selectedId === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex min-h-11 w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-normal",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "border-primary bg-primary/10"
                    : visited
                      ? "border-success/40 bg-card"
                      : "border-border bg-card hover:border-primary/50 hover:bg-surface-2"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    visited
                      ? "border-success bg-success text-white"
                      : "border-primary bg-primary/20 text-primary"
                  )}
                  aria-hidden="true"
                >
                  {visited ? <Check className="size-3 stroke-[3]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-heading text-sm font-semibold text-textPrimary">
                      {item.label}
                    </span>
                    {item.partLabel ? (
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-textSecondary">
                        {item.partLabel}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-textSecondary">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
