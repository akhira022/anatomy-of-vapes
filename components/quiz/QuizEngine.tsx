"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { OptionList } from "@/components/quiz/OptionList";
import { Stepper } from "@/components/layout/Stepper";
import { useQuizStore } from "@/store/useQuizStore";
import type { QuizQuestion, QuizType } from "@/types";

interface QuizEngineProps {
  type: QuizType;
  questions: QuizQuestion[];
}

export function QuizEngine({ type, questions }: QuizEngineProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);
  const submitAnswer = useQuizStore((s) => s.submitAnswer);
  const setPhase = useQuizStore((s) => s.setPhase);

  const question = questions[currentQuestionIndex];
  const total = questions.length;
  const isLast = currentQuestionIndex >= total - 1;

  if (!question) {
    return (
      <p className="text-center text-textSecondary">ไม่พบคำถาม</p>
    );
  }

  const handleNext = () => {
    if (!selectedId) return;
    const isCorrect = selectedId === question.correctOptionId;
    submitAnswer(question.id, selectedId, isCorrect, type);

    if (isLast) {
      if (type === "pretest") {
        setPhase("anatomy");
        setQuestionIndex(0);
        router.push("/anatomy");
      } else {
        setPhase("result");
        setQuestionIndex(0);
        router.push("/result");
      }
      return;
    }

    setSelectedId(null);
    setQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6 sm:px-6">
      <Stepper current={type === "pretest" ? "pretest" : "posttest"} />
      <QuizProgress current={currentQuestionIndex + 1} total={total} />

      <article className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          {type === "pretest" ? "แบบทดสอบก่อนเรียน" : "แบบทดสอบหลังเรียน"}
        </p>
        <h2 className="mt-3 font-heading text-xl font-semibold leading-snug text-textPrimary sm:text-2xl">
          {question.question}
        </h2>
        <div className="mt-6">
          <OptionList
            options={question.options}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </article>

      <Button
        size="lg"
        disabled={!selectedId}
        onClick={handleNext}
        className="h-12 w-full rounded-2xl text-base font-semibold"
      >
        {isLast ? (type === "pretest" ? "ไปสำรวจ 3 มิติ" : "ดูผลลัพธ์") : "ถัดไป"}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
