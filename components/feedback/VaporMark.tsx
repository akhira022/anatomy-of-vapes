"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-5 w-3.5",
  md: "h-9 w-7",
  lg: "h-[5.75rem] w-[4.25rem]",
} as const;

interface VaporMarkProps {
  size?: keyof typeof sizeClass;
  className?: string;
  label?: string;
  decorative?: boolean;
}

export function VaporMark({
  size = "md",
  className,
  label = "กำลังโหลด",
  decorative = false,
}: VaporMarkProps) {
  return (
    <span
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "relative inline-flex items-end justify-center overflow-visible",
        sizeClass[size],
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-[8%] bottom-[4%] top-0 rounded-[100%]"
        style={{
          background:
            "radial-gradient(ellipse at bottom, color-mix(in srgb, var(--primary) 55%, transparent) 0%, color-mix(in srgb, var(--text-primary) 28%, transparent) 46%, transparent 76%)",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[10%] left-[8%] h-[80%] w-[52%] rounded-[999px] animate-vapor-rise"
        style={
          {
            "--vapor-x": "-22%",
            background:
              "color-mix(in srgb, var(--text-primary) 58%, transparent)",
          } as CSSProperties
        }
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[8%] left-[24%] h-[88%] w-[58%] rounded-[999px] animate-vapor-rise-delay"
        style={
          {
            "--vapor-x": "6%",
            background:
              "color-mix(in srgb, var(--primary) 78%, transparent)",
          } as CSSProperties
        }
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[12%] left-[40%] h-[74%] w-[50%] rounded-[999px] animate-vapor-rise-later"
        style={
          {
            "--vapor-x": "24%",
            background:
              "color-mix(in srgb, var(--text-primary) 42%, transparent)",
          } as CSSProperties
        }
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 z-[1] h-[24%] w-[30%] -translate-x-1/2 rounded-full bg-primary animate-vapor-core"
        style={{ boxShadow: "0 0 16px rgba(229, 57, 53, 0.75)" }}
      />
    </span>
  );
}
