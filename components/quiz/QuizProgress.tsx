"use client";

import { cn } from "@/lib/utils";

interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgress({ current, total, className }: QuizProgressProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      role="status"
      aria-label={`ข้อที่ ${current} จาก ${total}`}
    >
      <span className="text-sm text-textSecondary">
        ข้อที่ {current}/{total}
      </span>
      <ol className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const past = step < current;
          const active = step === current;
          return (
            <li key={step}>
              <span
                className={cn(
                  "block size-2 rounded-full transition-all duration-normal sm:size-2.5",
                  active && "scale-125 bg-primary",
                  past && !active && "bg-primary/55",
                  !past && !active && "border border-border bg-transparent"
                )}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
