"use client";

import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";

interface ModelLoadingOverlayProps {
  className?: string;
  label?: string;
}

export function ModelLoadingOverlay({
  className,
  label = "กำลังโหลดโมเดล 3 มิติ…",
}: ModelLoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 bg-surface/85 backdrop-blur-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="lg" label={label} />
      <p className="text-sm text-textSecondary">{label}</p>
    </div>
  );
}
