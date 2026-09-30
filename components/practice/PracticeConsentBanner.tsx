"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PdpaModal } from "@/components/popup/PdpaModal";
import { setPracticeConsent } from "@/lib/practice-session";

interface PracticeConsentBannerProps {
  onAccepted: () => void;
  onDecline: () => void;
}

export function PracticeConsentBanner({
  onAccepted,
  onDecline,
}: PracticeConsentBannerProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      role="region"
      aria-label="ยินยอมเก็บข้อมูลการฝึก"
      className="rounded-xl border border-border bg-surface-2 p-4 sm:p-5"
    >
      <p className="text-sm leading-relaxed text-textPrimary">
        ยินยอมให้เก็บว่าฝึกสถานการณ์ไหนและเลือกประโยคใด
        เพื่อใช้ในการเรียนรู้และวิจัย — ยังฝึกได้แม้ไม่ยินยอม
        แต่จะไม่บันทึกลงฐานข้อมูล
      </p>
      <div className="mt-3 flex items-start gap-3 text-sm text-textPrimary">
        <Checkbox
          id="pdpa-consent-practice"
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
          className="mt-0.5 size-5 shrink-0 rounded-[5px] border-[2.5px] border-primary bg-background shadow-sm data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground"
        />
        <p className="min-w-0">
          <label htmlFor="pdpa-consent-practice" className="cursor-pointer">
            ข้าพเจ้ายินยอมตาม{" "}
          </label>
          <PdpaModal />
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="touch"
          disabled={!checked}
          onClick={() => {
            setPracticeConsent(true);
            onAccepted();
          }}
        >
          ยินยอมและบันทึกการฝึก
        </Button>
        <Button
          type="button"
          variant="outline"
          size="touch"
          onClick={() => {
            setPracticeConsent(false);
            onDecline();
          }}
        >
          ฝึกโดยไม่บันทึก
        </Button>
      </div>
    </div>
  );
}
