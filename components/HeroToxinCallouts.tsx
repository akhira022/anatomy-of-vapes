"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Side = "left" | "right";

type Callout = {
  id: string;
  toxin: string;
  part: string;
  /** Anchor on the model (% of pane). */
  ax: number;
  ay: number;
  /** Which pane edge the label hugs — keeps the box from ever
   *  overflowing the (narrower) `md` column width. */
  side: Side;
  /** Distance (%) from that edge. */
  edge: number;
  /** Label vertical position (% of pane). */
  ly: number;
  Glyph: () => ReactNode;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/** Wait for brand blur to settle before drawing toxin links. */
const REVEAL_DELAY = 0.7;
const LINE_DURATION = 0.6;
const STAGGER = 0.12;

function NicotineGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="size-full" aria-hidden="true">
      <polygon
        points="16,8 26,14 26,26 16,32 6,26 6,14"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line x1="26" y1="14" x2="34" y2="8" stroke="currentColor" strokeWidth="1.4" />
      <line x1="26" y1="26" x2="35" y2="32" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="8" r="1.8" fill="currentColor" />
      <circle cx="26" cy="14" r="1.8" fill="currentColor" />
      <circle cx="26" cy="26" r="1.8" fill="currentColor" />
      <circle cx="16" cy="32" r="1.8" fill="currentColor" />
      <circle cx="6" cy="26" r="1.8" fill="currentColor" />
      <circle cx="6" cy="14" r="1.8" fill="currentColor" />
      <circle cx="34" cy="8" r="2.2" fill="currentColor" />
      <circle cx="35" cy="32" r="2.2" fill="currentColor" />
    </svg>
  );
}

function FormaldehydeGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="size-full" aria-hidden="true">
      <line x1="8" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="30" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="22" y1="20" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="20" r="3" fill="currentColor" />
      <circle cx="22" cy="20" r="3.5" fill="currentColor" />
      <circle cx="30" cy="12" r="2.5" fill="currentColor" />
      <circle cx="30" cy="28" r="2.5" fill="currentColor" />
      <path
        d="M31.5 9.5 L33.5 7.5 M28.5 9.5 L26.5 7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LithiumGlyph() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="size-full" aria-hidden="true">
      <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <circle cx="8" cy="14" r="2.5" fill="currentColor" />
      <circle cx="32" cy="12" r="2.8" fill="currentColor" />
      <circle cx="30" cy="28" r="3" fill="currentColor" />
      <circle cx="10" cy="28" r="2.2" fill="currentColor" />
      <line x1="12" y1="15.5" x2="16" y2="18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="28" y1="14" x2="24" y2="17.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="27" y1="26" x2="23.5" y2="22.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="12.5" y1="26.5" x2="16.5" y2="22.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const CALLOUTS: Callout[] = [
  {
    id: "mouthpiece",
    toxin: "นิโคติน",
    part: "ปากดูด",
    ax: 50,
    ay: 16,
    side: "right",
    edge: 3,
    ly: 6,
    Glyph: NicotineGlyph,
  },
  {
    id: "tank",
    toxin: "ฟอร์มาลดีไฮด์",
    part: "แท้งก์/คอยล์",
    ax: 52,
    ay: 40,
    side: "left",
    edge: 3,
    ly: 34,
    Glyph: FormaldehydeGlyph,
  },
  {
    id: "battery",
    toxin: "ลิเธียม",
    part: "แบตเตอรี่",
    ax: 50,
    ay: 70,
    side: "right",
    edge: 3,
    ly: 66,
    Glyph: LithiumGlyph,
  },
];

/** Approximate leader-line endpoint near the label's icon — decorative
 *  only, so a rough estimate (not a DOM measurement) is fine. */
function labelAnchorX({ side, edge }: Pick<Callout, "side" | "edge">) {
  return side === "right" ? 100 - edge - 8 : edge + 8;
}

export function HeroToxinCallouts() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {CALLOUTS.map((callout, index) => {
          const { id, ax, ay, ly } = callout;
          return (
            <motion.line
              key={`line-${id}`}
              x1={`${ax}%`}
              y1={`${ay}%`}
              x2={`${labelAnchorX(callout)}%`}
              y2={`${ly + 4}%`}
              className="stroke-border light:stroke-gray-400/80"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      pathLength: {
                        delay: REVEAL_DELAY + index * STAGGER,
                        duration: LINE_DURATION,
                        ease: EASE_OUT,
                      },
                      opacity: {
                        delay: REVEAL_DELAY + index * STAGGER,
                        duration: 0.2,
                      },
                    }
              }
            />
          );
        })}
      </svg>

      {CALLOUTS.map(({ id, toxin, part, ax, ay, side, edge, ly, Glyph }, index) => {
        const labelDelay = REVEAL_DELAY + index * STAGGER + LINE_DURATION * 0.55;
        const fromX = side === "right" ? 10 : -10;

        return (
          <div key={id}>
            <motion.span
              className={`absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(229,57,53,0.2)] ${
                reduceMotion ? "" : "animate-pulse"
              }`}
              style={{ top: `${ay}%`, left: `${ax}%` }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      delay: labelDelay,
                      duration: 0.35,
                      ease: EASE_OUT,
                    }
              }
            />
            <motion.div
              className="absolute flex max-w-[7rem] items-center gap-1.5 sm:max-w-[9rem] sm:gap-2 lg:max-w-[10rem]"
              style={{
                top: `${ly}%`,
                [side]: `${edge}%`,
              }}
              initial={
                reduceMotion ? false : { opacity: 0, x: fromX }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      delay: labelDelay,
                      duration: 0.4,
                      ease: EASE_OUT,
                    }
              }
            >
              <span className="flex size-6 shrink-0 items-center justify-center text-primary sm:size-8 md:size-9">
                <Glyph />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate font-heading text-[0.6rem] font-semibold tracking-tight text-textPrimary sm:text-xs md:text-sm">
                  {toxin}
                </span>
                <span className="block truncate text-[0.55rem] text-textSecondary light:text-textPrimary/65 sm:text-[0.65rem] md:text-xs">
                  {part}
                </span>
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
