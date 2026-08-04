"use client";

import { useEffect } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { posttestQuestions } from "@/data/quiz-questions";
import { useRequirePhase, useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";

export default function PosttestPage() {
  const hydrated = useHydrated();
  const ready = useRequirePhase("posttest");
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);
  const setPosttestQuestions = useQuizStore((s) => s.setPosttestQuestions);
  const setPhase = useQuizStore((s) => s.setPhase);

  useEffect(() => {
    if (!ready) return;
    setPosttestQuestions(posttestQuestions);
    setQuestionIndex(0);
    setPhase("posttest");
  }, [ready, setPosttestQuestions, setQuestionIndex, setPhase]);

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-textSecondary">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="แบบทดสอบหลังเรียน" showBack backHref="/anatomy" />
      <main className="flex-1">
        <QuizEngine type="posttest" questions={posttestQuestions} />
      </main>
    </div>
  );
}
