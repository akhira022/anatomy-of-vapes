"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { useAppRouter } from "@/hooks/useAppRouter";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useRequirePhase";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { useQuizStore } from "@/store/useQuizStore";
import { HeroTypingLine } from "@/components/HeroTypingLine";

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

/** Soft chemical-structure accents around the hero red glow. */
function HeroMoleculeField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      {/* Benzene ring — upper left of glow */}
      <div
        className="absolute top-[12%] left-[8%] w-[4.5rem] rotate-[-18deg] text-white/15 sm:left-[14%] sm:w-[5.5rem] light:text-gray-600/45"
      >
        <div
          className="animate-molecule-float-slow"
          style={{ animationDelay: "0.4s" }}
        >
          <svg viewBox="0 0 80 80" fill="none" className="size-full">
            <polygon
              points="40,8 68,24 68,56 40,72 12,56 12,24"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <circle cx="40" cy="40" r="10" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="8" r="2.25" fill="currentColor" />
            <circle cx="68" cy="24" r="2.25" fill="currentColor" />
            <circle cx="68" cy="56" r="2.25" fill="currentColor" />
            <circle cx="40" cy="72" r="2.25" fill="currentColor" />
            <circle cx="12" cy="56" r="2.25" fill="currentColor" />
            <circle cx="12" cy="24" r="2.25" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Linked atoms — right of glow */}
      <div
        className="absolute top-[22%] right-[6%] w-[5.5rem] rotate-[22deg] text-white/12 sm:right-[12%] sm:w-[6.5rem] light:text-gray-600/40"
      >
        <div
          className="animate-molecule-float"
          style={{ animationDelay: "1.6s" }}
        >
          <svg viewBox="0 0 100 70" fill="none" className="size-full">
            <line x1="14" y1="36" x2="36" y2="18" stroke="currentColor" strokeWidth="1.25" />
            <line x1="36" y1="18" x2="58" y2="36" stroke="currentColor" strokeWidth="1.25" />
            <line x1="58" y1="36" x2="80" y2="16" stroke="currentColor" strokeWidth="1.25" />
            <line x1="58" y1="36" x2="86" y2="52" stroke="currentColor" strokeWidth="1.25" />
            <line x1="36" y1="18" x2="28" y2="52" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="14" cy="36" r="4" fill="currentColor" />
            <circle cx="36" cy="18" r="5" fill="currentColor" />
            <circle cx="58" cy="36" r="4.5" fill="currentColor" />
            <circle cx="80" cy="16" r="3.5" fill="currentColor" />
            <circle cx="86" cy="52" r="3.5" fill="currentColor" />
            <circle cx="28" cy="52" r="3.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Hexagon lattice fragment — mid left */}
      <div
        className="absolute top-[40%] left-[2%] w-[3.75rem] rotate-[8deg] text-white/10 sm:left-[6%] sm:w-[4.5rem] light:text-gray-600/38"
      >
        <div
          className="animate-molecule-float-slower"
          style={{ animationDelay: "2.8s" }}
        >
          <svg viewBox="0 0 100 86" fill="none" className="size-full">
            <polygon
              points="28,6 50,18 50,42 28,54 6,42 6,18"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <polygon
              points="50,18 72,6 94,18 94,42 72,54 50,42"
              stroke="currentColor"
              strokeWidth="1.15"
            />
            <polygon
              points="28,54 50,42 72,54 72,78 50,90 28,78"
              stroke="currentColor"
              strokeWidth="1.15"
            />
          </svg>
        </div>
      </div>

      {/* Small ring + side chain — upper right */}
      <div
        className="absolute top-[8%] right-[18%] w-[3.25rem] rotate-[-32deg] text-white/14 sm:right-[24%] sm:w-[4rem] light:text-gray-600/42"
      >
        <div
          className="animate-molecule-float"
          style={{ animationDelay: "0.9s" }}
        >
          <svg viewBox="0 0 64 72" fill="none" className="size-full">
            <polygon
              points="24,14 42,24 42,44 24,54 6,44 6,24"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <line x1="42" y1="24" x2="56" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="42" y1="44" x2="58" y2="58" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="24" cy="14" r="2" fill="currentColor" />
            <circle cx="42" cy="24" r="2" fill="currentColor" />
            <circle cx="42" cy="44" r="2" fill="currentColor" />
            <circle cx="24" cy="54" r="2" fill="currentColor" />
            <circle cx="6" cy="44" r="2" fill="currentColor" />
            <circle cx="6" cy="24" r="2" fill="currentColor" />
            <circle cx="56" cy="10" r="2.5" fill="currentColor" />
            <circle cx="58" cy="58" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Linear chain — lower right of glow */}
      <div
        className="absolute top-[48%] right-[10%] w-[5rem] rotate-[12deg] text-white/11 sm:right-[16%] sm:top-[44%] sm:w-[5.75rem] light:text-gray-600/40"
      >
        <div
          className="animate-molecule-float-slow"
          style={{ animationDelay: "3.4s" }}
        >
          <svg viewBox="0 0 110 40" fill="none" className="size-full">
            <line x1="8" y1="20" x2="102" y2="20" stroke="currentColor" strokeWidth="1.2" />
            <line x1="30" y1="20" x2="30" y2="6" stroke="currentColor" strokeWidth="1.2" />
            <line x1="54" y1="20" x2="54" y2="34" stroke="currentColor" strokeWidth="1.2" />
            <line x1="78" y1="20" x2="78" y2="8" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="20" r="3.5" fill="currentColor" />
            <circle cx="30" cy="20" r="3.5" fill="currentColor" />
            <circle cx="54" cy="20" r="3.5" fill="currentColor" />
            <circle cx="78" cy="20" r="3.5" fill="currentColor" />
            <circle cx="102" cy="20" r="3.5" fill="currentColor" />
            <circle cx="30" cy="6" r="2.5" fill="currentColor" />
            <circle cx="54" cy="34" r="2.5" fill="currentColor" />
            <circle cx="78" cy="8" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
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
  const logout = useQuizStore((s) => s.logout);
  const resetProgress = useQuizStore((s) => s.resetProgress);

  const loggedIn =
    hydrated && isLoggedIn({ nickname, consentAccepted });
  const hasLocalResult = postAnswers.length > 0;

  const handleLogout = () => {
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
      className="relative isolate flex min-h-[min(100dvh,52rem)] flex-col justify-end overflow-hidden bg-background"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <HeroVapeCanvas reducedMotion={Boolean(reduceMotion)} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-hero-vignette"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/85 to-transparent sm:h-52"
      />

      <HeroMoleculeField />

      <div className="relative z-[2] mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-[min(42vh,18rem)] pb-16 text-center sm:px-6 sm:pb-20">
        <motion.div
          className="relative z-0 isolate flex max-w-xl flex-col items-center"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Soft light-theme lift under copy — keep the model readable behind text. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-22%] inset-y-[-12%] -z-10 hidden light:block bg-[radial-gradient(ellipse_at_center,rgba(247,247,248,0.82)_0%,rgba(247,247,248,0.45)_42%,transparent_72%)]"
          />

          <h1
            id="hero-brand"
            className="hero-copy-readable font-heading text-[clamp(2.25rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-textPrimary uppercase"
          >
            Anatomy of Vapes
          </h1>

          <p className="hero-copy-readable mt-5 font-heading text-xl font-semibold text-textPrimary sm:mt-6 sm:text-2xl md:text-3xl">
            ส่องไส้ในบุหรี่ไฟฟ้า
          </p>

          <HeroTypingLine />

          <motion.div
            className="mt-10 flex w-full max-w-sm flex-col items-center gap-3"
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ duration: 0.15 }}
          >
            {loggedIn ? (
              <>
                <p className="hero-copy-readable text-sm font-medium text-textPrimary">
                  สวัสดี คุณ{nickname}
                </p>
                {currentPhase === "result" ? (
                  <>
                    <Button
                      render={<Link href="/anatomy" />}
                      nativeButton={false}
                      className="h-12 min-w-[12rem] w-auto rounded-lg px-8 text-base font-semibold shadow-glowRed sm:text-lg"
                    >
                      ดูโมเดลอีกครั้ง
                    </Button>
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
                  <Button
                    render={<Link href={phaseToPath(currentPhase)} />}
                    nativeButton={false}
                    className="h-12 min-w-[12rem] w-auto rounded-lg px-8 text-base font-semibold shadow-glowRed sm:text-lg"
                  >
                    ดำเนินการต่อ
                  </Button>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2">
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
                <Button
                  render={<Link href="/register" />}
                  nativeButton={false}
                  className="h-11 w-auto rounded-lg px-5 text-base font-semibold shadow-glowRed sm:px-6 sm:text-lg"
                >
                  เริ่มเรียนรู้
                </Button>
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  variant="outline"
                  className="h-11 w-auto rounded-lg bg-background px-5 text-base light:border-border light:bg-surface sm:px-6"
                >
                  เข้าสู่ระบบ
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
