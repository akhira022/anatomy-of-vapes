"use client";

import { cn } from "@/lib/utils";
import type { QuizOption } from "@/types";

interface OptionListProps {
  options: QuizOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OptionList({ options, selectedId, onSelect }: OptionListProps) {
  return (
    <ul className="space-y-3">
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-normal",
                selected
                  ? "border-primary bg-primary/10 shadow-glowRed"
                  : "border-border bg-card hover:border-primary/50 hover:bg-surface2"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-border text-textSecondary"
                )}
              >
                {option.label}
              </span>
              <span className="text-sm leading-relaxed text-textPrimary sm:text-base">
                {option.text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
