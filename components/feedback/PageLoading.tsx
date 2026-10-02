"use client";

import { VaporMark } from "@/components/feedback/VaporMark";
import { VaporLabel } from "@/components/feedback/VaporLabel";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  label?: string;
  detail?: string;
  className?: string;
  fullScreen?: boolean;
}

export function PageLoading({
  label = "กำลังโหลด…",
  detail,
  className,
  fullScreen = true,
}: PageLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-textSecondary",
        fullScreen && "min-h-full flex-1 bg-background",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-32 rounded-full bg-primary/22 blur-3xl"
        />
        <VaporMark size="lg" decorative />
      </div>
      <VaporLabel className="text-base sm:text-lg">{label}</VaporLabel>
      {detail ? (
        <p className="max-w-xs text-center text-xs text-textSecondary">{detail}</p>
      ) : null}
    </div>
  );
}
