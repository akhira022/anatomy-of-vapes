"use client";

import {
  Activity,
  BatteryWarning,
  Brain,
  Flame,
  HeartPulse,
  type LucideIcon,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { HotspotEffectStep, HotspotEffectTone } from "@/data/hotspot-effects";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const STEP_MS = 1400;

const ICONS: Record<HotspotEffectStep["icon"], LucideIcon> = {
  inhale: Wind,
  addiction: Zap,
  brain: Brain,
  heart: HeartPulse,
  heat: Flame,
  cancer: Sparkles,
  lung: Activity,
  cough: Activity,
  battery: BatteryWarning,
  metal: Sparkles,
  irritation: Wind,
};

const TONE_STYLES: Record<
  HotspotEffectTone,
  { chip: string; icon: string; connector: string }
> = {
  danger: {
    chip: "border-border bg-card text-textPrimary",
    icon: "text-primary",
    connector: "bg-primary/50",
  },
  warning: {
    chip: "border-border bg-card text-textPrimary",
    icon: "text-warning",
    connector: "bg-warning/50",
  },
  info: {
    chip: "border-border bg-card text-textPrimary",
    icon: "text-info",
    connector: "bg-info/50",
  },
};

interface HotspotEffectStripProps {
  hotspotId: string;
  steps: HotspotEffectStep[];
  className?: string;
}

export function HotspotEffectStrip({
  hotspotId,
  steps,
  className,
}: HotspotEffectStripProps) {
  return (
    <HotspotEffectStripInner
      key={hotspotId}
      hotspotId={hotspotId}
      steps={steps}
      className={className}
    />
  );
}

function HotspotEffectStripInner({
  hotspotId,
  steps,
  className,
}: HotspotEffectStripProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || steps.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [reduceMotion, steps.length, hotspotId]);

  if (steps.length === 0) return null;

  return (
    <div className={cn(className)}>
      <p className="text-xs font-medium text-textSecondary">
        ผลกระทบต่อเนื่อง
      </p>

      <div
        className="mt-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="ภาพเคลื่อนไหวผลกระทบต่อสุขภาพ"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol
            key={hotspotId}
            className="flex min-w-max items-center gap-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {steps.map((step, index) => {
              const Icon = ICONS[step.icon];
              const tone = TONE_STYLES[step.tone];
              const active = activeIndex === index;
              const passed = activeIndex > index;

              return (
                <li key={step.id} className="flex items-center">
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      delay: reduceMotion ? 0 : index * 0.1,
                      duration: 0.38,
                      ease: EASE_OUT,
                    }}
                    className={cn(
                      "relative flex min-w-[6.75rem] flex-col items-center gap-1 rounded-xl border px-2.5 py-2 text-center transition-shadow duration-normal sm:min-w-[7.5rem]",
                      tone.chip,
                      active && !reduceMotion && "ring-1 ring-primary/40"
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    <motion.span
                      className={cn("inline-flex", tone.icon)}
                      animate={
                        reduceMotion
                          ? undefined
                          : active
                            ? step.icon === "addiction"
                              ? { scale: [1, 1.15, 1], rotate: [0, -6, 6, 0] }
                              : step.icon === "brain"
                                ? { y: [0, -3, 0] }
                                : step.icon === "inhale"
                                  ? { x: [0, 4, 0], opacity: [1, 0.7, 1] }
                                  : step.icon === "cough"
                                    ? { x: [-2, 2, -2, 0] }
                                    : step.icon === "battery"
                                      ? { scale: [1, 1.08, 1] }
                                      : { scale: [1, 1.06, 1] }
                            : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }
                      }
                      transition={
                        active && !reduceMotion
                          ? { duration: 0.85, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </motion.span>
                    <span className="text-xs font-semibold leading-snug">
                      {step.label}
                    </span>
                    {active && !reduceMotion ? (
                      <motion.span
                        className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-primary/70"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                        style={{ transformOrigin: "left center" }}
                      />
                    ) : passed ? (
                      <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-primary/40" />
                    ) : null}
                  </motion.div>

                  {index < steps.length - 1 ? (
                    <Connector
                      active={passed || active}
                      tone={steps[index + 1]?.tone ?? step.tone}
                      delay={reduceMotion ? 0 : index * 0.1 + 0.12}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  ) : null}
                </li>
              );
            })}
          </motion.ol>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Connector({
  active,
  tone,
  delay,
  reduceMotion,
}: {
  active: boolean;
  tone: HotspotEffectTone;
  delay: number;
  reduceMotion: boolean;
}) {
  return (
    <div
      className="relative mx-1 flex h-px w-6 shrink-0 items-center sm:w-8"
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full bg-border" />
      <motion.span
        className={cn("absolute inset-y-0 left-0 rounded-full", TONE_STYLES[tone].connector)}
        initial={{ width: "0%" }}
        animate={{ width: active ? "100%" : "0%" }}
        transition={{
          delay: reduceMotion ? 0 : delay,
          duration: reduceMotion ? 0 : 0.35,
          ease: EASE_OUT,
        }}
      />
      {!reduceMotion ? (
        <motion.span
          className="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-primary"
          animate={active ? { left: ["0%", "100%"], opacity: [0, 1, 0] } : { left: "0%", opacity: 0 }}
          transition={{
            duration: 0.9,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
            delay,
          }}
        />
      ) : null}
    </div>
  );
}
