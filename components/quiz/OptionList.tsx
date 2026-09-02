"use client";

import { cn } from "@/lib/utils";
import type { QuizOption } from "@/types";
import { useCallback, useRef } from "react";

interface OptionListProps {
  options: QuizOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabelledBy?: string;
}

export function OptionList({
  options,
  selectedId,
  onSelect,
  ariaLabelledBy,
}: OptionListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusOption = useCallback((index: number) => {
    refs.current[index]?.focus();
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      next = (index + 1) % options.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      next = (index - 1 + options.length) % options.length;
    } else {
      return;
    }
    const option = options[next];
    if (option) onSelect(option.id);
    focusOption(next);
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledBy}
      className="space-y-3"
    >
      {options.map((option, index) => {
        const selected = selectedId === option.id;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!selectedId && index === 0) ? 0 : -1}
            onClick={() => onSelect(option.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex min-h-11 w-full items-start gap-3 rounded-lg border px-4 py-3.5 text-left transition-all duration-normal xl:min-h-14 xl:px-5 xl:py-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-primary bg-primary/10 shadow-glowRed"
                : "border-border bg-card hover:border-primary/50 hover:bg-surface-2"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold xl:size-7 xl:text-sm",
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border text-textSecondary"
              )}
              aria-hidden="true"
            >
              {option.label}
            </span>
            <span className="font-body text-sm font-medium leading-relaxed text-textPrimary sm:text-base xl:text-lg">
              {option.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
