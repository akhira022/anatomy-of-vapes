"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HINT_STORAGE_KEY = "aov-anatomy-tutorial-v3";

type TutorialStep = 0 | 1 | 2;

const STEPS: Record<
  TutorialStep,
  { title: string; body: string }
> = {
  0: {
    title: "ซูมเข้า–ออกได้",
    body: "ใช้สองนิ้วบีบ–ขยายบนจอ หรือกดปุ่ม + / − ด้านขวา",
  },
  1: {
    title: "หมุนดูรอบโมเดลได้",
    body: "ปัดนิ้วบนจอเพื่อหมุน — กดแยกชิ้นเพื่อเห็นข้างใน",
  },
  2: {
    title: "แนะนำ: เปิดเต็มจอ",
    body: "กดปุ่มเต็มจอด้านขวา เพื่อดูจุดสารพิษและข้อมูลได้ครบถ้วนขึ้น",
  },
};

interface AnatomyTutorialOverlayProps {
  open: boolean;
  onDismiss: () => void;
  /** Optional: enter fullscreen then dismiss tutorial. */
  onEnterFullscreen?: () => void;
}

/**
 * First-run gesture tutorial: zoom, rotate, then fullscreen tip.
 */
export function AnatomyTutorialOverlay({
  open,
  onDismiss,
  onEnterFullscreen,
}: AnatomyTutorialOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<TutorialStep>(0);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    if (reduceMotion) return;
    const t1 = window.setTimeout(() => setStep(1), 2800);
    const t2 = window.setTimeout(() => setStep(2), 5600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [open, reduceMotion]);

  const copy = STEPS[reduceMotion ? 2 : step];
  const isLast = reduceMotion || step === 2;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/55 px-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="anatomy-tutorial-title"
        >
          <div className="relative mb-6 flex h-36 w-36 items-center justify-center">
            {reduceMotion || step === 2 ? (
              <FullscreenDemo reduceMotion={Boolean(reduceMotion)} />
            ) : step === 0 ? (
              <PinchZoomDemo reduceMotion={false} />
            ) : (
              <RotateDemo />
            )}
          </div>

          <motion.div
            key={reduceMotion ? "static" : step}
            className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-4 text-center shadow-popup"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            {!reduceMotion ? (
              <div className="flex gap-1.5" aria-hidden="true">
                {([0, 1, 2] as const).map((i) => (
                  <span
                    key={i}
                    className={`size-1.5 rounded-full ${
                      i === step ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            ) : null}

            <p
              id="anatomy-tutorial-title"
              className="font-heading text-base font-semibold text-textPrimary"
            >
              {reduceMotion
                ? "ซูม หมุน และเปิดเต็มจอ"
                : copy.title}
            </p>
            <p className="text-sm leading-relaxed text-textSecondary">
              {reduceMotion
                ? "ใช้สองนิ้วซูม ปัดเพื่อหมุน และกดเต็มจอเพื่อดูจุดสารพิษครบถ้วน"
                : copy.body}
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              {!isLast ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-2xl"
                  onClick={() =>
                    setStep((s) => (s < 2 ? ((s + 1) as TutorialStep) : s))
                  }
                >
                  ถัดไป
                </Button>
              ) : onEnterFullscreen ? (
                <Button
                  type="button"
                  className="h-11 flex-1 rounded-2xl font-semibold shadow-glowRed"
                  onClick={() => {
                    onEnterFullscreen();
                    onDismiss();
                  }}
                >
                  เปิดเต็มจอเลย
                  <Maximize2 className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant={isLast && onEnterFullscreen ? "outline" : "default"}
                className="h-11 flex-1 rounded-2xl font-semibold"
                onClick={onDismiss}
              >
                {isLast ? "ไว้ทีหลัง" : "ข้าม"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FingerDot({
  className,
  style,
  animate,
  transition,
}: {
  className?: string;
  style?: CSSProperties;
  animate?: {
    x?: number | number[];
    y?: number | number[];
    scale?: number | number[];
  };
  transition?: object;
}) {
  return (
    <motion.span
      aria-hidden="true"
      className={`absolute size-9 rounded-full border-2 border-primary bg-primary/35 shadow-glowRed ${className ?? ""}`}
      style={style}
      animate={animate}
      transition={transition}
    />
  );
}

function PinchZoomDemo({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) {
    return (
      <div className="relative size-28" aria-hidden="true">
        <span className="absolute left-4 top-6 size-9 rounded-full border-2 border-primary bg-primary/35" />
        <span className="absolute bottom-6 right-4 size-9 rounded-full border-2 border-primary bg-primary/35" />
      </div>
    );
  }

  return (
    <div className="relative size-28" aria-hidden="true">
      <FingerDot
        style={{ left: "18%", top: "22%" }}
        animate={{ x: [0, -14, 0], y: [0, -10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <FingerDot
        style={{ right: "18%", bottom: "22%" }}
        animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute inset-6 rounded-full border border-dashed border-textSecondary/50"
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function RotateDemo() {
  return (
    <div className="relative size-28" aria-hidden="true">
      <motion.span className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-textSecondary/40" />
      <FingerDot
        style={{ left: "50%", top: "50%", marginLeft: -18, marginTop: -18 }}
        animate={{ x: [-28, 28, -28] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-textSecondary"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        ปัดซ้าย–ขวา
      </motion.span>
    </div>
  );
}

function FullscreenDemo({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className="relative flex size-28 items-center justify-center"
      aria-hidden="true"
    >
      <motion.div
        className="flex size-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/20 shadow-glowRed"
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Maximize2 className="size-8 text-primary" />
      </motion.div>
      {!reduceMotion ? (
        <motion.span
          className="absolute -right-1 top-2 size-10 rounded-xl border border-border bg-card/90"
          animate={{ scale: [1, 0.92, 1], y: [0, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </div>
  );
}
