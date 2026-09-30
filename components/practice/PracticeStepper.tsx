"use client";

import { cn } from "@/lib/utils";
import { Lightbulb, MessageCircle, RefreshCw, MousePointerClick } from "lucide-react";

const steps = [
  { id: "scenario", label: "สถานการณ์จำลอง", icon: MessageCircle },
  { id: "choose", label: "เลือกคำตอบ", icon: MousePointerClick },
  { id: "advice", label: "รับคำแนะนำ", icon: Lightbulb },
  { id: "again", label: "ฝึกอีกครั้ง", icon: RefreshCw },
] as const;

export type PracticeStepId = (typeof steps)[number]["id"];

interface PracticeStepperProps {
  current: PracticeStepId;
  className?: string;
}

export function PracticeStepper({ current, className }: PracticeStepperProps) {
  const activeIndex = steps.findIndex((s) => s.id === current);

  return (
    <ol
      aria-label="ขั้นตอนการฝึกปฏิเสธ"
      className={cn("flex flex-col gap-3", className)}
    >
      {steps.map((step, index) => {
        const Icon = step.icon;
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li
            key={step.id}
            className="flex items-center gap-3"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                active && "border-primary bg-primary/15 text-primary",
                done && !active && "border-primary/40 bg-primary/10 text-primary",
                !done && !active && "border-border bg-card text-textDisabled"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span
              className={cn(
                "text-sm font-medium",
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
