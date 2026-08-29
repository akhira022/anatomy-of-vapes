"use client";

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
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
        "flex flex-col items-center justify-center gap-3 text-textSecondary",
        fullScreen && "min-h-full flex-1 bg-background",
        className
      )}
    >
      <LoadingSpinner size="lg" label={label} />
      <p className="text-sm font-medium text-textPrimary">{label}</p>
      {detail ? (
        <p className="max-w-xs text-center text-xs text-textSecondary">{detail}</p>
      ) : null}
    </div>
  );
}
