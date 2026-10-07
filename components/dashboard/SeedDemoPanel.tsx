"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminSeedDemo } from "@/lib/db";
import { cn } from "@/lib/utils";

const COUNT_OPTIONS = [5, 10, 25, 50] as const;

interface SeedDemoPanelProps {
  onSeeded?: () => void;
}

export function SeedDemoPanel({ onSeeded }: SeedDemoPanelProps) {
  const [count, setCount] = useState<(typeof COUNT_OPTIONS)[number]>(10);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const result = await adminSeedDemo(count);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`เพิ่มข้อมูลตัวอย่าง ${result.created} รายการแล้ว`);
      onSeeded?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-semibold text-textPrimary">
            ข้อมูลตัวอย่าง
          </h2>
          <p className="mt-1 max-w-xl text-sm text-textSecondary">
            สร้างผู้เรียนจำลองพร้อมคะแนนก่อน/หลังเรียน สำหรับทดสอบแดชบอร์ด
            (ชื่อขึ้นต้นด้วยคำสุ่ม + หมายเลข ไม่ผูก Auth)
          </p>
        </div>
        <FlaskConical
          aria-hidden="true"
          className="size-5 shrink-0 text-textSecondary"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-textPrimary">จำนวน</p>
        <div
          role="group"
          aria-label="จำนวนข้อมูลตัวอย่าง"
          className="flex flex-wrap gap-2"
        >
          {COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              onClick={() => setCount(n)}
              className={cn(
                "min-h-11 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors",
                count === n
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-textSecondary hover:border-primary/50 hover:text-textPrimary"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Button
          type="button"
          size="touch"
          loading={busy}
          disabled={busy}
          onClick={() => void run()}
        >
          เพิ่มข้อมูลตัวอย่าง {count} รายการ
        </Button>
      </div>
    </section>
  );
}
