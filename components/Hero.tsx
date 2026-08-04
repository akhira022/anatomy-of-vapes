"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

const HeroVapeCanvas = dynamic(
  () =>
    import("@/components/three/HeroVapeCanvas").then((m) => m.HeroVapeCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-hero-atmosphere"
      />
    ),
  }
);

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-brand"
      className="relative isolate flex min-h-[min(100dvh,52rem)] flex-col justify-end overflow-hidden bg-background"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <HeroVapeCanvas reducedMotion={Boolean(reduceMotion)} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_35%,transparent_20%,rgba(8,8,8,0.55)_70%,#080808_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-background via-background/90 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-[min(42vh,18rem)] pb-16 text-center sm:px-6 sm:pb-20">
        <motion.div
          className="flex max-w-xl flex-col items-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <h1
            id="hero-brand"
            className="font-heading text-[clamp(2.25rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-textPrimary uppercase"
          >
            Anatomy of Vapes
          </h1>

          <p className="mt-5 font-heading text-xl font-semibold text-textPrimary sm:mt-6 sm:text-2xl md:text-3xl">
            ส่องไส้ในบุหรี่ไฟฟ้า
          </p>

          <p className="mt-4 max-w-md text-base leading-relaxed text-textSecondary sm:text-lg">
            สำรวจส่วนประกอบและสารพิษผ่านโมเดล 3 มิติแบบอินเทอร์แอกทีฟ
          </p>

          <motion.div
            className="mt-10"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              render={<Link href="/register" />}
              nativeButton={false}
              className="h-14 rounded-2xl px-10 text-base font-semibold shadow-glowRed sm:text-lg"
            >
              เริ่มเรียนรู้
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
