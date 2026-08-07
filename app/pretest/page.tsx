"use client";

import { useEffect } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { pretestQuestions } from "@/data/quiz-questions";
import { useRequirePhase, useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";

export default function PretestPage() {
  const hydrated = useHydrated();
  const ready = useRequirePhase("pretest");
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);
  const setPretestQuestions = useQuizStore((s) => s.setPretestQuestions);
  const setPhase = useQuizStore((s) => s.setPhase);

  useEffect(() => {
    if (!ready) return;
    setPretestQuestions(pretestQuestions);
    setQuestionIndex(0);
    setPhase("pretest");
  }, [ready, setPretestQuestions, setQuestionIndex, setPhase]);

  // Warm GLB cache during pretest so anatomy opens faster.
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-textSecondary">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="แบบทดสอบก่อนเรียน" showBack backHref="/" />
      <main className="flex-1">
        <QuizEngine type="pretest" questions={pretestQuestions} />
      </main>
    </div>
  );
}
