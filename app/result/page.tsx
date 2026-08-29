"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { motion, useReducedMotion } from "framer-motion";
import { Box, Trophy, Star } from "lucide-react";
import { CompletedLearnerChoice } from "@/components/auth/CompletedLearnerChoice";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { PageLoading } from "@/components/feedback/PageLoading";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { saveQuizResult } from "@/lib/db";
import {
  getPhaseBlockMessage,
  useRequirePhase,
  useHydrated,
} from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import { toast } from "sonner";

export default function ResultPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const { ready, blockedReason } = useRequirePhase("result");
  const nickname = useQuizStore((s) => s.nickname);
  const userId = useQuizStore((s) => s.userId);
  const preScore = useQuizStore((s) => s.preScore);
  const postScore = useQuizStore((s) => s.postScore);
  const preAnswers = useQuizStore((s) => s.preAnswers);
  const postAnswers = useQuizStore((s) => s.postAnswers);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const setResultSaved = useQuizStore((s) => s.setResultSaved);
  const resetProgress = useQuizStore((s) => s.resetProgress);
  const [saving, setSaving] = useState(false);

  const hasLocalResult = postAnswers.length > 0;
  const improvement = postScore - preScore;
  const improved = improvement > 0;

  const message = useMemo(() => {
    if (postScore >= 4) return "ยอดเยี่ยม!";
    if (postScore >= 3) return "ทำได้ดี!";
    return "เริ่มต้นได้แล้ว!";
  }, [postScore]);

  useEffect(() => {
    if (!ready || !hydrated || resultSaved || !userId || !hasLocalResult) return;

    let cancelled = false;
    setSaving(true);
    (async () => {
      const result = await saveQuizResult({
        userId,
        preScore,
        postScore,
        preTotal: 5,
        postTotal: 5,
        preAnswers,
        postAnswers,
      });
      if (cancelled) return;
      setSaving(false);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setResultSaved(true);
      if (result.skipped) {
        toast.message("รอบนี้เป็นแบบฝึกซ้ำ — ไม่บันทึกลงฐานข้อมูล");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    hydrated,
    resultSaved,
    userId,
    hasLocalResult,
    preScore,
    postScore,
    preAnswers,
    postAnswers,
    setResultSaved,
  ]);

  if (!hydrated || !ready) {
    return (
      <PageLoading
        detail={getPhaseBlockMessage(blockedReason) ?? undefined}
      />
    );
  }

  if (!hasLocalResult) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <AppNavbar title="ยินดีต้อนรับกลับ" showBack backHref="/" />
        <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 text-left sm:px-6 xl:max-w-4xl">
          <CompletedLearnerChoice
            nickname={nickname || "ผู้เรียน"}
            context="result"
            onViewModel={() => {
              toast.success("เข้าโหมดทบทวนโมเดล");
              router.push("/anatomy");
            }}
            onRetake={() => {
              resetProgress();
              toast.message("เริ่มทำแบบทดสอบใหม่");
              router.push("/pretest");
            }}
          />
        </main>
      </div>
    );
  }

  const trophyClassName =
    "flex size-16 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-glowRed";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ผลลัพธ์" showBack backHref="/" />
      <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 text-left sm:px-6 xl:max-w-4xl xl:py-12">
        {reduceMotion ? (
          <div className={trophyClassName}>
            <Trophy className="size-8" />
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={trophyClassName}
          >
            <Trophy className="size-8" />
          </motion.div>
        )}

        <h1 className="mt-6 font-heading text-3xl font-bold text-textPrimary xl:text-4xl">
          {message}
        </h1>
        <p className="mt-2 text-textSecondary xl:text-lg">
          {nickname ? `คุณ${nickname}` : "คุณ"} ทำแบบทดสอบครบแล้ว
        </p>

        {saving ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-textSecondary"
          >
            <LoadingSpinner size="sm" label="กำลังบันทึกคะแนน" />
            กำลังบันทึกคะแนน…
          </div>
        ) : resultSaved ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-sm text-success"
          >
            บันทึกคะแนนเรียบร้อยแล้ว
          </p>
        ) : null}

        <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-3">
          <ScoreCard label="ก่อนเรียน" score={preScore} total={5} />
          <ScoreCard label="หลังเรียน" score={postScore} total={5} highlight />
          <div
            className={
              improved
                ? "flex min-w-0 items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-4 min-[360px]:col-span-2 xl:col-span-1"
                : "flex min-w-0 items-center gap-2 rounded-lg border border-border bg-card p-4 min-[360px]:col-span-2 xl:col-span-1"
            }
          >
            <Star
              className={
                improved ? "size-5 text-warning" : "size-5 text-textDisabled"
              }
            />
            <div>
              <p className="text-xs tracking-wide text-textSecondary">พัฒนาการ</p>
              <p
                className={
                  improved
                    ? "font-heading text-2xl font-bold text-success xl:text-3xl"
                    : "font-heading text-2xl font-bold text-textPrimary xl:text-3xl"
                }
              >
                {improvement >= 0 ? "+" : ""}
                {improvement}{" "}
                <span className="text-lg text-textSecondary">คะแนน</span>
              </p>
            </div>
          </div>
        </div>

        {improved && !reduceMotion ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute size-2 rounded-full bg-primary"
                style={{
                  left: `${8 + ((i * 17) % 84)}%`,
                  top: `${10 + ((i * 29) % 40)}%`,
                  opacity: 0.35 + (i % 5) * 0.1,
                  transform: `rotate(${i * 20}deg)`,
                }}
              />
            ))}
          </motion.div>
        ) : null}

        <div className="mt-auto flex w-full flex-col items-start gap-3 pt-10 sm:flex-row sm:flex-wrap xl:gap-4">
          <Button
            render={<Link href="/anatomy" />}
            nativeButton={false}
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
          >
            <Box className="size-5" aria-hidden="true" />
            ดูโมเดลอีกครั้ง
          </Button>
          <Button
            type="button"
            variant="outline"
            size="touch"
            className="xl:min-h-12"
            onClick={() => {
              resetProgress();
              router.push("/pretest");
            }}
          >
            เรียนอีกครั้ง
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="touch"
            className="xl:min-h-12"
          >
            กลับหน้าหลัก
          </Button>
        </div>
      </main>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  total,
  highlight = false,
}: {
  label: string;
  score: number;
  total: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "min-w-0 rounded-lg border border-primary/40 bg-primary/10 p-4"
          : "min-w-0 rounded-lg border border-border bg-card p-4"
      }
    >
      <p className="text-xs tracking-wide text-textSecondary xl:text-sm">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-textPrimary xl:text-4xl">
        {score}
        <span className="text-lg text-textSecondary xl:text-xl">/{total}</span>
      </p>
    </div>
  );
}
