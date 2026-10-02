"use client";

import { VaporMark } from "@/components/feedback/VaporMark";
import { VaporLabel } from "@/components/feedback/VaporLabel";
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
        "flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-[2px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-28 rounded-full bg-primary/22 blur-3xl"
        />
        <VaporMark size="lg" decorative />
      </div>
      <VaporLabel className="text-base">{label}</VaporLabel>
    </div>
  );
}
