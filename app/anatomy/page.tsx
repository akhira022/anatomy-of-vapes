"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Stepper } from "@/components/layout/Stepper";
import { HotspotList } from "@/components/hotspot/HotspotList";
import { HotspotPopup } from "@/components/popup/HotspotPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hotspots } from "@/data/hotspots";
import { useRequirePhase, useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";

const VapeScene = dynamic(
  () =>
    import("@/components/three/VapeScene").then((m) => m.VapeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-surface text-textSecondary">
        กำลังโหลดโมเดล 3 มิติ...
      </div>
    ),
  }
);

type ViewMode = "whole" | "exploded";

const modeOptions = [
  ["whole", "ทั้งชิ้น"],
  ["exploded", "แยกชิ้นส่วน"],
] as const;

export default function AnatomyPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const ready = useRequirePhase("anatomy");
  const [mode, setMode] = useState<ViewMode>("whole");
  const [popupOpen, setPopupOpen] = useState(false);

  const currentPhase = useQuizStore((s) => s.currentPhase);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const selectedHotspotId = useQuizStore((s) => s.selectedHotspotId);
  const markHotspotVisited = useQuizStore((s) => s.markHotspotVisited);
  const setSelectedHotspotId = useQuizStore((s) => s.setSelectedHotspotId);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);

  /** After post-test, learners can revisit the model without restarting the flow. */
  const isReview = currentPhase === "result";

  const selected = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [selectedHotspotId]
  );

  const remaining = useMemo(
    () => hotspots.filter((h) => !visitedHotspots.includes(h.id)),
    [visitedHotspots]
  );

  const nextHotspot = remaining[0] ?? null;
  const allVisited = remaining.length === 0;
  const remainingCount = remaining.length;

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-textSecondary">
        กำลังโหลด...
      </div>
    );
  }

  const handleHotspotClick = (id: string) => {
    setSelectedHotspotId(id);
    markHotspotVisited(id);
    setPopupOpen(true);
    if (mode === "whole") setMode("exploded");
  };

  const goNextHotspot = () => {
    if (!nextHotspot) return;
    handleHotspotClick(nextHotspot.id);
  };

  const goPosttest = () => {
    if (!allVisited || isReview) return;
    setQuestionIndex(0);
    setPhase("posttest");
    router.push("/posttest");
  };

  const goResult = () => {
    router.push("/result");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title={isReview ? "ทบทวนโมเดล 3D" : "สำรวจ 3 มิติ"}
        showBack
        backHref={isReview ? "/result" : "/pretest"}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        {isReview ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-textSecondary">
            โหมดทบทวน — สำรวจโมเดลและจุดสารพิษได้อิสระ ไม่กระทบคะแนนที่ทำไว้แล้ว
          </p>
        ) : (
          <Stepper current="anatomy" />
        )}

        <div
          role="group"
          aria-label="โหมดการดูโมเดล"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {modeOptions.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-normal",
                mode === id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-textSecondary hover:text-textPrimary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative h-[min(48dvh,380px)] w-full shrink-0 sm:h-[min(56dvh,520px)]">
          <VapeScene
            exploded={mode === "exploded"}
            onExplodedChange={(next) =>
              setMode(next ? "exploded" : "whole")
            }
            visitedHotspots={visitedHotspots}
            selectedHotspotId={selectedHotspotId}
            onHotspotClick={handleHotspotClick}
            hotspotItems={hotspots}
            nextHotspotId={nextHotspot?.id ?? null}
            onNextHotspot={goNextHotspot}
          />
        </div>

        <section
          aria-labelledby="exploration-status"
          className="rounded-2xl border border-border bg-card p-4 shadow-card"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p
                id="exploration-status"
                className="text-sm font-medium text-textSecondary"
              >
                จุดที่สำรวจแล้ว
              </p>
              <p
                className="font-heading text-2xl font-semibold text-textPrimary"
                aria-live="polite"
              >
                {visitedHotspots.length}/{hotspots.length}
              </p>
            </div>
            {selected ? (
              <Badge variant="destructive">{selected.label}</Badge>
            ) : (
              <Badge variant="outline">แตะจุดสีแดงหรือเลือกจากรายการ</Badge>
            )}
          </div>

          {isReview ? (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary">
              ทบทวนจุดสารพิษได้ตามต้องการ — กดกลับเมื่อพร้อม
            </p>
          ) : !allVisited ? (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary">
              ยังเหลืออีก{" "}
              <span className="font-semibold text-primary">
                {remainingCount} จุด
              </span>
              {nextHotspot ? (
                <>
                  {" "}
                  — ต่อไปลองสำรวจ{" "}
                  <span className="font-semibold">{nextHotspot.label}</span>
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-3 rounded-xl bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
              สำรวจครบแล้ว พร้อมไปทำแบบทดสอบหลังเรียน
            </p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-textSecondary">
            {selected
              ? selected.description
              : "หมุนโมเดล เปิดโหมดแยกชิ้นส่วน แล้วสำรวจจุดสารพิษให้ครบทุกจุด"}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!allVisited && nextHotspot ? (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl font-semibold shadow-glowRed"
                onClick={goNextHotspot}
              >
                จุดถัดไป: {nextHotspot.label}
                <ArrowRight className="size-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-2xl"
              disabled={!selected}
              onClick={() => setPopupOpen(true)}
            >
              ดูรายละเอียด
            </Button>
            {isReview ? (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl font-semibold shadow-glowRed"
                onClick={goResult}
              >
                กลับไปดูผลลัพธ์
                <ArrowRight className="size-4" />
              </Button>
            ) : allVisited ? (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl font-semibold shadow-glowRed"
                onClick={goPosttest}
              >
                ถัดไป: แบบทดสอบหลังเรียน
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-2xl text-textSecondary"
                disabled
                aria-disabled="true"
              >
                สำรวจอีก {remainingCount} จุดก่อนไปต่อ
              </Button>
            )}
          </div>
        </section>

        <HotspotList
          items={hotspots}
          visitedIds={visitedHotspots}
          selectedId={selectedHotspotId}
          onSelect={handleHotspotClick}
          className="pb-4"
        />
      </main>

      <HotspotPopup
        hotspot={selected}
        open={popupOpen && Boolean(selected)}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  );
}
