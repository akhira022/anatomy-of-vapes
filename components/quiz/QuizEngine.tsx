"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAppRouter } from "@/hooks/useAppRouter";
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
  const router = useAppRouter();
  const reduceMotion = useReducedMotion();
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
      <p className="text-left text-textSecondary">ไม่พบคำถาม</p>
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-8 text-left sm:px-10">
      <Stepper current={type === "pretest" ? "pretest" : "posttest"} />
      <QuizProgress current={currentQuestionIndex + 1} total={total} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={question.id}
            initial={
              reduceMotion ? false : { opacity: 0, x: 12 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, x: -12 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-7"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {type === "pretest" ? "แบบทดสอบก่อนเรียน" : "แบบทดสอบหลังเรียน"}
            </p>
            <h2 className="mt-3 font-body text-xl font-medium leading-snug text-textPrimary sm:text-2xl">
              {question.question}
            </h2>
            <div className="mt-6">
              <OptionList
                options={question.options}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="flex justify-start sm:justify-end">
        <Button
          size="lg"
          disabled={!selectedId}
          onClick={handleNext}
          className="h-11 w-auto rounded-lg px-6 text-base font-semibold"
        >
          {isLast ? (type === "pretest" ? "ไปสำรวจ 3 มิติ" : "ดูผลลัพธ์") : "ถัดไป"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
