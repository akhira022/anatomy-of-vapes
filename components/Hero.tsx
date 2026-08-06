"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { useAppRouter } from "@/hooks/useAppRouter";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";
import { useHydrated } from "@/hooks/useRequirePhase";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { useQuizStore } from "@/store/useQuizStore";

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

/** Lightweight hero backdrop — avoids ~16MB GLB + Three.js on phones. */
function HeroStaticBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,color-mix(in_oklab,var(--primary)_32%,transparent),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_50%)] opacity-80" />
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const lite3d = usePreferLite3D();
  const hydrated = useHydrated();
  const router = useAppRouter();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const logout = useQuizStore((s) => s.logout);
  const resetProgress = useQuizStore((s) => s.resetProgress);

  const loggedIn =
    hydrated && isLoggedIn({ nickname, consentAccepted });

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
        {lite3d ? (
          <HeroStaticBackdrop />
        ) : (
          <HeroVapeCanvas reducedMotion={Boolean(reduceMotion)} />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-hero-vignette"
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
            className="mt-10 flex w-full max-w-sm flex-col items-center gap-3"
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            transition={{ duration: 0.15 }}
          >
            {loggedIn ? (
              <>
                <p className="text-sm text-textSecondary">
                  สวัสดี คุณ{nickname}
                </p>
                {currentPhase === "result" ? (
                  <>
                    <Button
                      render={<Link href="/anatomy" />}
                      nativeButton={false}
                      className="h-14 w-full rounded-2xl px-10 text-base font-semibold shadow-glowRed sm:text-lg"
                    >
                      ดูโมเดลอีกครั้ง
                    </Button>
                    <Button
                      render={<Link href="/result" />}
                      nativeButton={false}
                      variant="outline"
                      className="h-12 w-full rounded-2xl text-base"
                    >
                      ดูผลลัพธ์
                    </Button>
                  </>
                ) : (
                  <Button
                    render={<Link href={phaseToPath(currentPhase)} />}
                    nativeButton={false}
                    className="h-14 w-full rounded-2xl px-10 text-base font-semibold shadow-glowRed sm:text-lg"
                  >
                    ดำเนินการต่อ
                  </Button>
                )}
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-2xl text-base"
                    onClick={handleRestart}
                  >
                    เรียนใหม่
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 flex-1 rounded-2xl text-base"
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
                  className="h-14 w-full rounded-2xl px-10 text-base font-semibold shadow-glowRed sm:text-lg"
                >
                  เริ่มเรียนรู้
                </Button>
                <Button
                  render={<Link href="/login" />}
                  nativeButton={false}
                  variant="outline"
                  className="h-12 w-full rounded-2xl text-base"
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
