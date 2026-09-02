"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const PHRASES = [
  "สำรวจส่วนประกอบและสารพิษผ่านโมเดล 3 มิติแบบอินเทอร์แอกทีฟ",
  "ไอจากบุหรี่ไฟฟ้าไม่ใช่ไอน้ำบริสุทธิ์ — มีนิโคตินและสารเคมีปนอยู่",
  "นิโคตินรบกวนพัฒนาการสมองวัยรุ่นด้านความจำและสมาธิ",
  "กลิ่นผลไม้ไม่ได้แปลว่าปลอดภัยเมื่อสูดเข้าปอด",
  "คอยล์ร้อนจัดอาจสร้างสารพิษอย่างฟอร์มาลดีไฮด์",
  "รู้เท่าทันส่วนประกอบ เลือกหลีกเลี่ยงได้ดีขึ้น",
] as const;

const TYPING_MS = 42;
const DELETING_MS = 24;
const HOLD_MS = 2200;
const GAP_MS = 380;

type HeroTypingLineProps = {
  className?: string;
};

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function HeroTypingLine({ className }: HeroTypingLineProps) {
  const reduceMotion = useReducedMotion();
  const mounted = useIsClient();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(PHRASES[0].length);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!mounted || reduceMotion) return;

    const full = PHRASES[phraseIndex];
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isDeleting && charCount === full.length) {
      timeoutId = setTimeout(() => setIsDeleting(true), HOLD_MS);
    } else if (isDeleting && charCount === 0) {
      timeoutId = setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length);
        setIsDeleting(false);
      }, GAP_MS);
    } else {
      timeoutId = setTimeout(
        () => setCharCount((n) => n + (isDeleting ? -1 : 1)),
        isDeleting ? DELETING_MS : TYPING_MS
      );
    }

    return () => clearTimeout(timeoutId);
  }, [charCount, isDeleting, phraseIndex, reduceMotion, mounted]);

  if (!mounted || reduceMotion) {
    return (
      <p
        className={`hero-copy-readable max-w-md text-left text-base leading-relaxed text-textSecondary light:text-textPrimary/85 sm:text-lg ${className ?? "mt-4"}`}
      >
        {PHRASES[0]}
      </p>
    );
  }

  const shown = PHRASES[phraseIndex].slice(0, charCount);

  return (
    <p
      className={`hero-copy-readable flex min-h-[3.25rem] max-w-md items-start justify-start text-left text-base leading-relaxed text-textSecondary light:text-textPrimary/85 sm:text-lg ${className ?? "mt-4"}`}
      aria-live="polite"
    >
      <span>
        {shown}
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] bg-primary align-baseline animate-typing-caret"
        />
      </span>
    </p>
  );
}
