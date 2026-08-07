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
        "flex w-full items-start justify-start gap-6 text-xs sm:gap-8 sm:text-sm",
        className
      )}
    >
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step.id} className="flex flex-col items-start gap-1.5">
            <span
              className={cn(
                "size-2.5 rounded-full transition-all duration-normal sm:size-3",
                active && "scale-110 bg-primary",
                done && !active && "bg-primary/55",
                !done && !active && "border border-border bg-transparent"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "font-medium",
                active
                  ? "text-textPrimary"
                  : done
                    ? "text-textSecondary"
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
