"use client";

import { Box, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompletedLearnerContext = "login" | "register" | "result";

const copyByContext: Record<
  CompletedLearnerContext,
  { title: string; body: string }
> = {
  login: {
    title: "ยินดีต้อนรับกลับ",
    body: "คุณเคยทำแบบทดสอบครบแล้ว — เลือกดูโมเดลทบทวน หรือเริ่มเรียนรอบใหม่",
  },
  register: {
    title: "พบบัญชีเดิมที่เรียนครบแล้ว",
    body: "บัญชีนี้มีผลคะแนนแล้ว — เลือกดูโมเดลทบทวน หรือเริ่มทำแบบทดสอบใหม่",
  },
  result: {
    title: "ยินดีต้อนรับกลับ",
    body: "คุณเคยทำแบบทดสอบครบแล้ว — เลือกดูโมเดลทบทวน หรือเริ่มเรียนรอบใหม่",
  },
};

type CompletedLearnerChoiceProps = {
  nickname: string;
  context?: CompletedLearnerContext;
  onViewModel: () => void;
  onRetake: () => void;
};

export function CompletedLearnerChoice({
  nickname,
  context = "login",
  onViewModel,
  onRetake,
}: CompletedLearnerChoiceProps) {
  const copy = copyByContext[context];

  return (
    <div className="flex flex-1 flex-col text-left">
      <h1 className="font-heading text-2xl font-bold text-textPrimary">
        {copy.title} คุณ{nickname}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-textSecondary">
        {copy.body}
      </p>

      <div className="mt-8 flex flex-col items-start gap-3">
        <Button
          type="button"
          size="touch"
          className="font-semibold shadow-glowRed"
          onClick={onViewModel}
        >
          <Box className="size-5" aria-hidden="true" />
          ไปดูโมเดลเลย
        </Button>
        <Button
          type="button"
          variant="outline"
          size="touch"
          onClick={onRetake}
        >
          <ClipboardList className="size-5" aria-hidden="true" />
          ทำแบบทดสอบใหม่
        </Button>
      </div>
    </div>
  );
}
