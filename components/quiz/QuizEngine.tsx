"use client";

import { OptionList } from "@/components/quiz/OptionList";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { Stepper } from "@/components/layout/Stepper";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useQuizStore } from "@/store/useQuizStore";
import type { QuizQuestion, QuizType } from "@/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useId, useState } from "react";

interface QuizEngineProps {
  type: QuizType;
  questions: QuizQuestion[];
}

export function QuizEngine({ type, questions }: QuizEngineProps) {
  const router = useAppRouter();
  const reduceMotion = useReducedMotion();
  const questionHeadingId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentQuestionIndex = useQuizStore((s) => s.currentQuestionIndex);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);
  const submitAnswer = useQuizStore((s) => s.submitAnswer);
  const setPhase = useQuizStore((s) => s.setPhase);

  const question = questions[currentQuestionIndex];
  const total = questions.length;
  const isLast = currentQuestionIndex >= total - 1;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-left sm:px-6 xl:max-w-3xl">
        <p className="text-textSecondary">ไม่พบคำถาม</p>
        <Button
          type="button"
          variant="outline"
          size="touch"
          className="mt-4"
          onClick={() => router.push("/register")}
        >
          กลับไปลงทะเบียน
        </Button>
      </div>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 text-left sm:gap-8 sm:px-6 sm:py-8 xl:max-w-3xl xl:gap-8 xl:py-10">
      <Stepper current={type === "pretest" ? "pretest" : "posttest"} />
      <QuizProgress current={currentQuestionIndex + 1} total={total} />

      {type === "posttest" ? (
        <p className="rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-textPrimary xl:text-base">
          แบบทดสอบหลังเรียน — อีก {total - currentQuestionIndex} ข้อแล้วเสร็จ
        </p>
      ) : null}

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={question.id}
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-7 xl:p-8"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-primary xl:text-sm">
              {type === "pretest" ? "แบบทดสอบก่อนเรียน" : "แบบทดสอบหลังเรียน"}
            </p>
            <h2
              id={questionHeadingId}
              className="mt-3 font-body text-xl font-medium leading-snug text-textPrimary sm:text-2xl xl:text-2xl"
            >
              {question.question}
            </h2>
            <div className="mt-6 xl:mt-8">
              <OptionList
                options={question.options}
                selectedId={selectedId}
                onSelect={handleSelect}
                ariaLabelledBy={questionHeadingId}
              />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="flex justify-start sm:justify-end">
        <Button
          size="touch"
          disabled={!selectedId}
          onClick={handleNext}
          className="font-semibold xl:min-h-12"
        >
          {isLast ? (type === "pretest" ? "ไปสำรวจ 3 มิติ" : "ดูผลลัพธ์") : "ถัดไป"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
