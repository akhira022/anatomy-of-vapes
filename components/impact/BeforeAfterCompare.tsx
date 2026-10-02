"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterCompareProps {
  beforeLabel: string;
  afterLabel: string;
  beforeText: string;
  afterText: string;
  activeSide?: "before" | "after";
  onSideChange?: (side: "before" | "after") => void;
}

export function BeforeAfterCompare({
  beforeLabel,
  afterLabel,
  beforeText,
  afterText,
  activeSide,
  onSideChange,
}: BeforeAfterCompareProps) {
  return (
    <div
      className="relative grid gap-3 sm:grid-cols-2 sm:gap-4"
      role={onSideChange ? "radiogroup" : undefined}
      aria-label={onSideChange ? "สลับก่อนสูบหรือหลังสูบ" : undefined}
    >
      <Side
        label={beforeLabel}
        text={beforeText}
        tone="before"
        dimmed={activeSide === "after"}
        selected={activeSide === "before"}
        onSelect={onSideChange}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-primary sm:flex"
      >
        <ArrowRight className="size-4" />
      </span>
      <Side
        label={afterLabel}
        text={afterText}
        tone="after"
        dimmed={activeSide === "before"}
        selected={activeSide === "after"}
        onSelect={onSideChange}
      />
    </div>
  );
}

function Side({
  label,
  text,
  tone,
  dimmed,
  selected,
  onSelect,
}: {
  label: string;
  text: string;
  tone: "before" | "after";
  dimmed?: boolean;
  selected?: boolean;
  onSelect?: (side: "before" | "after") => void;
}) {
  const after = tone === "after";
  const clickable = Boolean(onSelect);
  const Tag = clickable ? "button" : "div";
  return (
    <Tag
      type={clickable ? "button" : undefined}
      role={clickable ? "radio" : undefined}
      aria-checked={clickable ? selected : undefined}
      onClick={clickable ? () => onSelect?.(tone) : undefined}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 text-left transition-[opacity,border-color,box-shadow] duration-slow sm:p-5",
        after
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-surface-2",
        dimmed ? "opacity-55" : "opacity-100",
        clickable &&
          "min-h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        clickable && selected && after && "border-primary shadow-glow-red",
        clickable && selected && !after && "border-textPrimary/30",
        clickable && !selected && "hover:opacity-100 hover:border-primary/40"
      )}
    >
      <BodyGlyph after={after} />
      <p
        className={cn(
          "relative text-xs font-semibold tracking-wide",
          after ? "text-primary" : "text-textSecondary"
        )}
      >
        {label}
      </p>
      <p className="relative mt-2 text-sm leading-relaxed text-textPrimary sm:text-base">
        {text}
      </p>
    </Tag>
  );
}

function BodyGlyph({ after }: { after: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      className={cn(
        "pointer-events-none absolute -right-3 -top-3 size-24",
        after ? "text-primary/25" : "text-textSecondary/20"
      )}
    >
      <circle cx="40" cy="20" r="10" fill="currentColor" />
      <path d="M22 70c0-16 8-30 18-30s18 14 18 30" fill="currentColor" />
      {after ? (
        <g fill="currentColor">
          <circle cx="14" cy="34" r="3" />
          <circle cx="66" cy="28" r="2.5" />
          <circle cx="62" cy="46" r="3.5" />
          <circle cx="18" cy="52" r="2" />
        </g>
      ) : null}
    </svg>
  );
}
