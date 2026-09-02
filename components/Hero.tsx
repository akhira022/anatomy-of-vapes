"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { useAppRouter } from "@/hooks/useAppRouter";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useRequirePhase";
import { signOutLearner } from "@/lib/learner-auth";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { useQuizStore } from "@/store/useQuizStore";
import { HeroTypingLine } from "@/components/HeroTypingLine";
import { HeroBrandCopy } from "@/components/HeroBrandCopy";
import { HeroToxinCallouts } from "@/components/HeroToxinCallouts";
import { HeroMoleculeField } from "@/components/HeroMoleculeField";

const HeroVapeCanvas = dynamic(
  () =>
    import("@/components/three/HeroVapeCanvas").then((m) => m.HeroVapeCanvas),
  {
    ssr: false,
    loading: () => (
      <ModelLoadingOverlay
        className="absolute inset-0"
        label="กำลังโหลดโมเดล…"
      />
    ),
  }
);

function PrimaryCtaMotion({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean;
}) {
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      className="inline-flex"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const router = useAppRouter();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const postAnswers = useQuizStore((s) => s.postAnswers);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const logout = useQuizStore((s) => s.logout);
  const resetProgress = useQuizStore((s) => s.resetProgress);

  const loggedIn =
    hydrated && isLoggedIn({ nickname, consentAccepted });
  const hasLocalResult = postAnswers.length > 0;
  /** Completed once (even mid-retake) — keep model review on the landing page. */
  const canReviewModel = currentPhase === "result" || resultSaved;

  const handleLogout = () => {
    void signOutLearner();
    logout();
    toast.success("ออกจากระบบแล้ว");
  };

  const handleRestart = () => {
    resetProgress();
    toast.message("เริ่มรอบใหม่ด้วยบัญชีเดิม");
    router.push("/pretest");
  };

  return (
    <section
      aria-labelledby="hero-brand"
      className="relative isolate overflow-hidden bg-background pt-14 sm:pt-16"
    >
      <div className="mx-auto grid min-h-[min(100dvh,54rem)] w-full max-w-6xl grid-cols-1 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:items-center xl:min-h-[min(100dvh,58rem)] xl:max-w-7xl">
        {/* Copy column */}
        <div className="relative z-[2] order-1 flex flex-col justify-center px-4 pb-14 pt-6 sm:order-1 sm:px-6 sm:py-16 sm:pr-3 sm:pl-5 md:py-20 md:pr-4 md:pl-6 lg:pl-8 xl:py-24 xl:pl-10">
          <div className="relative flex max-w-xl flex-col items-start text-left xl:max-w-2xl">
            <HeroBrandCopy />

            <HeroTypingLine className="mt-5 sm:mt-6" />

            <motion.div
              className="mt-8 flex w-full max-w-sm flex-col items-start gap-3 sm:mt-10"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      delay: 0.85,
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            >
              {loggedIn ? (
                <>
                  <p className="hero-copy-readable text-sm font-medium text-textPrimary">
                    สวัสดี คุณ{nickname}
                  </p>
                  {currentPhase === "result" ? (
                    <>
                      <PrimaryCtaMotion reduceMotion={Boolean(reduceMotion)}>
                        <Button
                          render={<Link href="/anatomy" />}
                          nativeButton={false}
                          className="h-12 min-w-[12rem] w-auto rounded-lg px-8 text-base font-semibold shadow-glowRed sm:text-lg"
                        >
                          ดูโมเดลอีกครั้ง
                        </Button>
                      </PrimaryCtaMotion>
                      {hasLocalResult ? (
                        <Button
                          render={<Link href="/result" />}
                          nativeButton={false}
                          variant="outline"
                          className="h-11 min-w-[12rem] w-auto rounded-lg bg-background px-8 text-base light:border-border light:bg-surface"
                        >
                          ดูผลลัพธ์
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 min-w-[12rem] w-auto rounded-lg bg-background px-8 text-base light:border-border light:bg-surface"
                          onClick={handleRestart}
                        >
                          ทำแบบทดสอบใหม่
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <PrimaryCtaMotion reduceMotion={Boolean(reduceMotion)}>
                        <Button
                          render={<Link href={phaseToPath(currentPhase)} />}
                          nativeButton={false}
                          className="h-12 min-w-[12rem] w-auto rounded-lg px-8 text-base font-semibold shadow-glowRed sm:text-lg"
                        >
                          ดำเนินการต่อ
                        </Button>
                      </PrimaryCtaMotion>
                      {canReviewModel ? (
                        <Button
                          render={<Link href="/anatomy" />}
                          nativeButton={false}
                          variant="outline"
                          className="h-11 min-w-[12rem] w-auto rounded-lg bg-background px-8 text-base light:border-border light:bg-surface"
                        >
                          ดูโมเดลอีกครั้ง
                        </Button>
                      ) : null}
                    </>
                  )}
                  <div className="flex flex-wrap items-center justify-start gap-2">
                    {hasLocalResult || currentPhase !== "result" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-auto rounded-lg bg-background px-5 text-base light:border-border light:bg-surface"
                        onClick={handleRestart}
                      >
                        เรียนใหม่
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-auto rounded-lg bg-background px-5 text-base light:border-border light:bg-surface"
                      onClick={handleLogout}
                    >
                      ออกจากระบบ
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <PrimaryCtaMotion reduceMotion={Boolean(reduceMotion)}>
                    <Button
                      render={<Link href="/register" />}
                      nativeButton={false}
                      className="h-11 w-auto rounded-lg px-5 text-base font-semibold shadow-glowRed sm:px-6 sm:text-lg"
                    >
                      เริ่มเรียนรู้
                    </Button>
                  </PrimaryCtaMotion>
                  <Button
                    render={<Link href="/login" />}
                    nativeButton={false}
                    variant="outline"
                    className="h-11 w-auto rounded-lg bg-background px-5 text-base light:border-border light:bg-surface sm:px-6"
                  >
                    เข้าสู่ระบบ
                  </Button>
                  <Button
                    render={<Link href="/guest" />}
                    nativeButton={false}
                    variant="ghost"
                    className="h-11 w-auto rounded-lg px-5 text-base sm:px-6"
                  >
                    เข้าชมไม่ต้องสมัคร
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Model column — explicit `h-` (not `min-h-`) so the canvas's
            `h-full` chain has a definite height to resolve against;
            a min-height-only ancestor makes percentage heights collapse.
            Sized close to the desktop pane's presence even on phones —
            `clamp()` keeps a sane floor on short landscape screens and a
            ceiling before the `sm` split takes over. */}
        <div
          className="relative order-2 h-[clamp(16rem,42vh,24rem)] w-full sm:order-2 sm:h-[min(100dvh,54rem)]"
          role="img"
          aria-label="โมเดลบุหรี่ไฟฟ้าพร้อมจุดพรีวิวสารพิษ: นิโคตินที่ปากดูด ฟอร์มาลดีไฮด์ที่แท้งก์ และลิเธียมที่แบตเตอรี่"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-6 left-1/2 w-[min(68%,16rem)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,57,53,0.17)_0%,transparent_70%)] sm:inset-y-8 sm:w-[min(70%,18rem)] sm:bg-[radial-gradient(ellipse_at_center,rgba(229,57,53,0.18)_0%,transparent_70%)] light:bg-[radial-gradient(ellipse_at_center,rgba(229,57,53,0.09)_0%,transparent_72%)] light:sm:bg-[radial-gradient(ellipse_at_center,rgba(229,57,53,0.1)_0%,transparent_72%)] animate-hero-glow-breathe"
          />
          <HeroVapeCanvas reducedMotion={Boolean(reduceMotion)} />
          <HeroMoleculeField />
          <HeroToxinCallouts />
        </div>
      </div>
    </section>
  );
}
