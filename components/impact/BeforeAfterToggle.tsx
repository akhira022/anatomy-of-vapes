"use client";

import { useRef } from "react";
import type { BodyState } from "@/components/impact/BodyMap";
import { cn } from "@/lib/utils";

const options: { value: BodyState; label: string }[] = [
  { value: "before", label: "ก่อนสูบ" },
  { value: "after", label: "หลังสูบ" },
];

interface BeforeAfterToggleProps {
  value: BodyState;
  onChange: (value: BodyState) => void;
  className?: string;
}

export function BeforeAfterToggle({
  value,
  onChange,
  className,
}: BeforeAfterToggleProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div
      role="radiogroup"
      aria-label="สถานะร่างกาย"
      className={cn(
        "inline-flex rounded-full border border-border bg-surface-2 p-1",
        className
      )}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (
                event.key !== "ArrowLeft" &&
                event.key !== "ArrowRight" &&
                event.key !== "ArrowUp" &&
                event.key !== "ArrowDown"
              ) {
                return;
              }
              event.preventDefault();
              const next = (index + 1) % options.length;
              onChange(options[next].value);
              refs.current[next]?.focus();
            }}
            className={cn(
              "min-h-10 rounded-full px-5 text-sm font-semibold transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base",
              checked
                ? option.value === "after"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-textPrimary"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
