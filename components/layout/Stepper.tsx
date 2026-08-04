"use client";

import { cn } from "@/lib/utils";

const steps = [
  { id: "pretest", label: "ก่อนเรียน" },
  { id: "anatomy", label: "สำรวจ 3D" },
  { id: "posttest", label: "หลังเรียน" },
] as const;

interface StepperProps {
  current: "pretest" | "anatomy" | "posttest" | "result";
  className?: string;
}

export function Stepper({ current, className }: StepperProps) {
  const activeIndex =
    current === "result"
      ? steps.length
      : steps.findIndex((s) => s.id === current);

  return (
    <ol
      className={cn(
        "flex w-full items-center justify-between gap-1 text-xs sm:text-sm",
        className
      )}
    >
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "h-1.5 w-full rounded-full transition-colors duration-normal",
                done || active ? "bg-primary" : "bg-border"
              )}
            />
            <span
              className={cn(
                "font-medium",
                active
                  ? "text-primary"
                  : done
                    ? "text-textPrimary"
                    : "text-textDisabled"
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
