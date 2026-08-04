"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function QuizProgress({ current, total, className }: QuizProgressProps) {
  const value = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm text-textSecondary">
        <span>
          ข้อที่ {current}/{total}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
