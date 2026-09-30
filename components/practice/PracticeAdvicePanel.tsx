"use client";

import { Lightbulb } from "lucide-react";

interface PracticeAdvicePanelProps {
  advice: string;
  examplePhrases: string[];
  showAdvice: boolean;
}

export function PracticeAdvicePanel({
  advice,
  examplePhrases,
  showAdvice,
}: PracticeAdvicePanelProps) {
  return (
    <aside
      aria-label="คำแนะนำและตัวอย่าง"
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <div>
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="size-5" aria-hidden="true" />
          <h2 className="font-heading text-base font-semibold">คำแนะนำ</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-textPrimary">
          {showAdvice
            ? advice
            : "เลือกคำปฏิเสธในแชทด้านซ้าย แล้วจะเห็นคำแนะนำตรงนี้"}
        </p>
      </div>

      <div>
        <h3 className="font-heading text-sm font-semibold text-textPrimary">
          ตัวอย่างคำปฏิเสธที่ใช้ได้จริง
        </h3>
        <ul className="mt-3 space-y-2">
          {examplePhrases.map((phrase) => (
            <li
              key={phrase}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-textPrimary"
            >
              “{phrase}”
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
