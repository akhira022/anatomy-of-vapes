"use client";

import { VaporMark } from "@/components/feedback/VaporMark";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label = "กำลังโหลด",
}: LoadingSpinnerProps) {
  return <VaporMark size={size} className={cn(className)} label={label} />;
}
