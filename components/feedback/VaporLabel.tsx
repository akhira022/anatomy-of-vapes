"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(
      new Intl.Segmenter("th", { granularity: "grapheme" }).segment(text),
      (part) => part.segment
    );
  }
  return Array.from(text);
}

interface VaporLabelProps {
  children: string;
  className?: string;
}

export function VaporLabel({ children, className }: VaporLabelProps) {
  const parts = useMemo(() => graphemes(children), [children]);

  return (
    <span
      aria-label={children}
      className={cn(
        "inline-block text-center font-semibold tracking-wide text-textPrimary",
        className
      )}
    >
      {parts.map((ch, index) => (
        <span
          key={`${ch}-${index}`}
          aria-hidden="true"
          className="inline-block animate-vapor-letter"
          style={{ animationDelay: `${(index % 8) * 0.11}s` }}
        >
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </span>
  );
}
