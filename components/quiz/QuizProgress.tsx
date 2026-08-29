"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgress({ current, total, className }: QuizProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div
      className={cn("space-y-2", className)}
      role="status"
      aria-live="polite"
      aria-label={`ข้อที่ ${current} จาก ${total}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-textPrimary">
          ข้อที่ {current}/{total}
        </span>
        <span className="text-xs text-textSecondary">{percent}%</span>
      </div>
      <Progress value={percent} aria-hidden="true" />
    </div>
  );
}
