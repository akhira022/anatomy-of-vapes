"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Star, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { PageLoading } from "@/components/feedback/PageLoading";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { hotspots } from "@/data/hotspots";
import { saveGuestPretestResult } from "@/lib/db";
import {
  getPhaseBlockMessage,
  useHydrated,
  useRequirePhase,
} from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";

export default function GuestCompletePage() {
  const hydrated = useHydrated();
  const { ready, blockedReason } = useRequirePhase("guest_complete");
  const nickname = useQuizStore((s) => s.nickname);
  const userId = useQuizStore((s) => s.userId);
  const preScore = useQuizStore((s) => s.preScore);
  const preAnswers = useQuizStore((s) => s.preAnswers);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const setResultSaved = useQuizStore((s) => s.setResultSaved);
  const setPhase = useQuizStore((s) => s.setPhase);
  const [persisted, setPersisted] = useState(false);

  const shouldPersist =
    ready && hydrated && !resultSaved && Boolean(userId) && preAnswers.length > 0;
  const saving = shouldPersist && !persisted;

  useEffect(() => {
    if (!ready) return;
    setPhase("guest_complete");
  }, [ready, setPhase]);

  useEffect(() => {
    if (!shouldPersist || persisted) return;

    let cancelled = false;
    (async () => {
      const result = await saveGuestPretestResult({
        userId: userId!,
        preScore,
        preTotal: 5,
        preAnswers,
      });
      if (cancelled) return;
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setResultSaved(true);
      setPersisted(true);
      if (result.skipped) {
        toast.message("บันทึกไว้แล้ว — ไม่บันทึกซ้ำ");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    shouldPersist,
    persisted,
    userId,
    preScore,
    preAnswers,
    setResultSaved,
  ]);

  if (!hydrated || !ready) {
    return (
      <PageLoading
        detail={getPhaseBlockMessage(blockedReason) ?? undefined}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="เสร็จสิ้น" showBack backHref="/" />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 text-left sm:px-6 xl:max-w-4xl xl:py-12"
      >
        <div className="flex size-16 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-glowRed">
          <Trophy className="size-8" />
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-textPrimary xl:text-4xl">
          สำรวจครบแล้ว!
        </h1>
        <p className="mt-2 text-textSecondary xl:text-lg">
          {nickname ? `คุณ${nickname}` : "คุณ"} ทำแบบทดสอบก่อนเรียนและสำรวจโมเดลครบแล้ว
        </p>

        {saving ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-textSecondary"
          >
            <LoadingSpinner size="sm" label="กำลังบันทึก" />
            กำลังบันทึกข้อมูล…
          </div>
        ) : resultSaved ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-sm text-success"
          >
            บันทึกข้อมูลเรียบร้อยแล้ว
          </p>
        ) : null}

        <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-border bg-card p-4">
            <p className="text-xs tracking-wide text-textSecondary">
              คะแนนก่อนเรียน
            </p>
            <p className="mt-1 font-heading text-3xl font-bold text-textPrimary">
              {preScore}
              <span className="text-lg text-textSecondary">/5</span>
            </p>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-card p-4">
            <p className="text-xs tracking-wide text-textSecondary">
              จุดที่สำรวจ
            </p>
            <p className="mt-1 flex items-center gap-2 font-heading text-3xl font-bold text-textPrimary">
              <Star className="size-6 text-warning" aria-hidden="true" />
              {visitedHotspots.length}/{hotspots.length}
            </p>
          </div>
        </div>

        <p className="mt-6 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm leading-relaxed text-textPrimary">
          โหมดผู้ชมไม่มีแบบทดสอบหลังเรียน — หากต้องการทำครบและเก็บคะแนนถาวร
          สามารถสมัครสมาชิกได้
        </p>

        <div className="mt-auto flex w-full flex-col items-start gap-3 pt-10 sm:flex-row sm:flex-wrap">
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
            render={<Link href="/register" />}
            nativeButton={false}
            variant="outline"
            size="touch"
            className="xl:min-h-12"
          >
            สมัครสมาชิก
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
