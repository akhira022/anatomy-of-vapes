"use client";

import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { PageLoading } from "@/components/feedback/PageLoading";
import { pretestQuestions } from "@/data/quiz-questions";
import {
  getPhaseBlockMessage,
  useRequirePhase,
  useHydrated,
} from "@/hooks/useRequirePhase";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useQuizStore } from "@/store/useQuizStore";

export default function PretestPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const { ready, blockedReason } = useRequirePhase("pretest");
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);
  const setPretestQuestions = useQuizStore((s) => s.setPretestQuestions);
  const setPhase = useQuizStore((s) => s.setPhase);

  useEffect(() => {
    if (!ready) return;
    setPretestQuestions(pretestQuestions);
    setQuestionIndex(0);
    setPhase("pretest");
  }, [ready, setPretestQuestions, setQuestionIndex, setPhase]);

  useEffect(() => {
    if (!ready) return;
    const idle =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 1200);
    const cancel =
      typeof cancelIdleCallback === "function"
        ? cancelIdleCallback
        : (id: number) => window.clearTimeout(id);

    const id = idle(() => {
      void import("@/components/three/VapeModel").then((m) => {
        m.preloadVapeModels();
      });
    });
    return () => cancel(id as number);
  }, [ready]);

  if (!hydrated || !ready) {
    return (
      <PageLoading
        detail={getPhaseBlockMessage(blockedReason) ?? undefined}
      />
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title="แบบทดสอบก่อนเรียน"
        showBack
        onBack={() => setBackConfirmOpen(true)}
        showSessionMenu
      />
      <ConfirmDialog
        open={backConfirmOpen}
        onOpenChange={setBackConfirmOpen}
        title="ออกจากแบบทดสอบ?"
        description="ความคืบหน้าข้อปัจจุบันอาจไม่ถูกบันทึก ต้องการกลับไปหน้าก่อนหรือไม่?"
        confirmLabel="ออกจากแบบทดสอบ"
        onConfirm={() => router.push("/register")}
      />
      <main id="main-content" className="flex-1">
        <QuizEngine type="pretest" questions={pretestQuestions} />
      </main>
    </div>
  );
}
