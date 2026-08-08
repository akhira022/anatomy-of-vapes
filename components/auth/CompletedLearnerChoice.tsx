"use client";

import { Box, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompletedLearnerChoiceProps = {
  nickname: string;
  onViewModel: () => void;
  onRetake: () => void;
};

/** Choice shown after login when this learner already finished the full quiz once. */
export function CompletedLearnerChoice({
  nickname,
  onViewModel,
  onRetake,
}: CompletedLearnerChoiceProps) {
  return (
    <div className="flex flex-1 flex-col text-left">
      <h1 className="font-heading text-2xl font-bold text-textPrimary">
        ยินดีต้อนรับกลับ คุณ{nickname}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-textSecondary">
        คุณเคยทำแบบทดสอบครบแล้ว — เลือกได้ว่าจะไปดูโมเดลเลย
        หรือเริ่มทำแบบทดสอบใหม่จากต้น
      </p>

      <div className="mt-8 flex flex-col items-start gap-3">
        <Button
          type="button"
          className="h-11 w-auto rounded-lg px-6 text-base font-semibold shadow-glowRed"
          onClick={onViewModel}
        >
          <Box className="size-5" aria-hidden="true" />
          ไปดูโมเดลเลย
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-auto rounded-lg px-6 text-base"
          onClick={onRetake}
        >
          <ClipboardList className="size-5" aria-hidden="true" />
          ทำแบบทดสอบใหม่
        </Button>
      </div>
    </div>
  );
}
