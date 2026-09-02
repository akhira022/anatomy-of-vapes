"use client";

import { useReducedMotion } from "framer-motion";
import BlurText from "@/components/BlurText";

const TITLE_LEAD = "ระบบประชาสัมพันธ์ภัยบุหรี่ไฟฟ้า";
const TITLE_ACCENT = "อัจฉริยะ";
const SUBTITLE = "ส่องไส้ในบุหรี่ไฟฟ้า";

const heroTitleClass =
  "hero-copy-readable font-heading text-[clamp(1.75rem,5.5vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-textPrimary";

const heroSubtitleClass =
  "hero-copy-readable font-heading text-lg font-semibold text-textPrimary sm:text-xl md:text-2xl";

const heroBlurFrom = { filter: "blur(12px)", opacity: 0, y: -20 };
const heroBlurTo = [
  { filter: "blur(4px)", opacity: 0.75, y: 3 },
  { filter: "blur(0px)", opacity: 1, y: 0 },
];

export function HeroBrandCopy() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <>
        <h1 id="hero-brand" className={`${heroTitleClass} text-left`}>
          {TITLE_LEAD}{" "}
          <span className="text-primary">{TITLE_ACCENT}</span>
        </h1>
        <p className={`${heroSubtitleClass} mt-4 text-left sm:mt-5`}>{SUBTITLE}</p>
      </>
    );
  }

  return (
    <>
      <h1 id="hero-brand" className={`${heroTitleClass} text-balance text-left`}>
        <span className="inline-flex max-w-full flex-wrap items-baseline justify-start gap-x-[0.22em]">
          <BlurText
            tag="span"
            text={TITLE_LEAD}
            animateBy="words"
            delay={80}
            stepDuration={0.28}
            immediate
            animationFrom={heroBlurFrom}
            animationTo={heroBlurTo}
            className="inline justify-start"
          />
          <BlurText
            tag="span"
            text={TITLE_ACCENT}
            animateBy="letters"
            delay={42}
            stepDuration={0.26}
            initialDelay={260}
            immediate
            animationFrom={heroBlurFrom}
            animationTo={heroBlurTo}
            className="inline justify-start text-primary"
          />
        </span>
      </h1>

      <BlurText
        tag="p"
        text={SUBTITLE}
        animateBy="words"
        delay={36}
        stepDuration={0.32}
        direction="bottom"
        initialDelay={520}
        immediate
        animationFrom={{ filter: "blur(10px)", opacity: 0, y: 16 }}
        animationTo={[
          { filter: "blur(3px)", opacity: 0.8, y: 4 },
          { filter: "blur(0px)", opacity: 1, y: 0 },
        ]}
        className={`${heroSubtitleClass} mt-4 justify-start text-balance sm:mt-5`}
      />
    </>
  );
}
