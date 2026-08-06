"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "size-5",
  md: "size-8",
  lg: "size-11",
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof sizeClass;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "กำลังโหลด",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn(
        "animate-spin text-primary",
        sizeClass[size],
        className
      )}
    />
  );
}
