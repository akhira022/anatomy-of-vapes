"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { saveQuizResult } from "@/lib/db";
import { useRequirePhase, useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import { toast } from "sonner";

export default function ResultPage() {
  const hydrated = useHydrated();
  const ready = useRequirePhase("result");
  const nickname = useQuizStore((s) => s.nickname);
  const userId = useQuizStore((s) => s.userId);
  const preScore = useQuizStore((s) => s.preScore);
  const postScore = useQuizStore((s) => s.postScore);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const setResultSaved = useQuizStore((s) => s.setResultSaved);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const improvement = postScore - preScore;
  const improved = improvement > 0;

  const message = useMemo(() => {
    if (postScore >= 4) return "ยอดเยี่ยม!";
    if (postScore >= 3) return "ทำได้ดี!";
    return "เริ่มต้นได้แล้ว!";
  }, [postScore]);

  useEffect(() => {
    if (!ready || !hydrated || resultSaved || !userId) return;

    let cancelled = false;
    (async () => {
      const result = await saveQuizResult({
        userId,
        preScore,
        postScore,
        preTotal: 5,
        postTotal: 5,
      });
      if (cancelled) return;
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setResultSaved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    ready,
    hydrated,
    resultSaved,
    userId,
    preScore,
    postScore,
    setResultSaved,
  ]);

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-textSecondary">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ผลลัพธ์" showBack backHref="/" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex size-20 items-center justify-center rounded-full bg-primary/15 text-primary shadow-glowRed"
        >
          <Trophy className="size-10" />
        </motion.div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-textPrimary">
          {message}
        </h1>
        <p className="mt-2 text-textSecondary">
          {nickname ? `คุณ${nickname}` : "คุณ"} ทำแบบทดสอบครบแล้ว
        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <ScoreCard label="ก่อนเรียน" score={preScore} total={5} />
          <ScoreCard label="หลังเรียน" score={postScore} total={5} highlight />
        </div>

        <motion.div
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Star className={improved ? "size-5 text-warning" : "size-5 text-textDisabled"} />
          <span className="text-sm text-textSecondary">พัฒนาการ</span>
          <span
            className={
              improved
                ? "font-heading text-lg font-bold text-success"
                : "font-heading text-lg font-bold text-textPrimary"
            }
          >
            {improvement >= 0 ? "+" : ""}
            {improvement} คะแนน
          </span>
        </motion.div>

        {improved ? (
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

        <div className="mt-auto flex w-full flex-col gap-3 pt-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl text-base"
            render={<Link href="/register" onClick={() => resetQuiz()} />}
            nativeButton={false}
          >
            เรียนอีกครั้ง
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="h-12 rounded-2xl text-base font-semibold"
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
          ? "rounded-2xl border border-primary/40 bg-primary/10 p-4"
          : "rounded-2xl border border-border bg-card p-4"
      }
    >
      <p className="text-xs tracking-wide text-textSecondary">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-textPrimary">
        {score}
        <span className="text-lg text-textSecondary">/{total}</span>
      </p>
    </div>
  );
}
