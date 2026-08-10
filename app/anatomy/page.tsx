"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { useAppRouter } from "@/hooks/useAppRouter";
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
      <ModelLoadingOverlay className="h-full min-h-[20rem] w-full rounded-lg border border-border" />
    ),
  }
);

type ViewMode = "whole" | "exploded";

const modeOptions = [
  ["whole", "ทั้งชิ้น"],
  ["exploded", "แยกชิ้นส่วน"],
] as const;

export default function AnatomyPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const ready = useRequirePhase("anatomy");
  const [mode, setMode] = useState<ViewMode>("whole");
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    void import("@/components/three/VapeModel").then((m) => {
      m.preloadVapeModels();
    });
  }, []);

  const currentPhase = useQuizStore((s) => s.currentPhase);
  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const selectedHotspotId = useQuizStore((s) => s.selectedHotspotId);
  const postAnswers = useQuizStore((s) => s.postAnswers);
  const resultSaved = useQuizStore((s) => s.resultSaved);
  const markHotspotVisited = useQuizStore((s) => s.markHotspotVisited);
  const setSelectedHotspotId = useQuizStore((s) => s.setSelectedHotspotId);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);

  /**
   * Review = finished once and not currently on the active anatomy/posttest path.
   * Keeps mid-retake "ดูโมเดล" from counting as progress toward posttest.
   */
  const isReview =
    currentPhase === "result" ||
    (resultSaved &&
      currentPhase !== "anatomy" &&
      currentPhase !== "posttest");
  /** Returning learners who skip retake have no local scores — don't send them to empty result. */
  const hasLocalResult = postAnswers.length > 0;

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
    if (!isReview) markHotspotVisited(id);
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
    router.push(hasLocalResult ? "/result" : "/");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title={isReview ? "ทบทวนโมเดล 3D" : "สำรวจ 3 มิติ"}
        showBack
        backHref={isReview ? (hasLocalResult ? "/result" : "/") : "/pretest"}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-6 py-6 text-left sm:gap-5 sm:px-10">
        {isReview ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-textSecondary">
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
                "min-h-11 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-normal",
                mode === id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-textSecondary hover:text-textPrimary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative h-[min(56dvh,440px)] w-full shrink-0 sm:h-[min(64dvh,560px)]">
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
            popupOpen={popupOpen && Boolean(selected)}
          />
        </div>

        <section
          aria-labelledby="exploration-status"
          className="rounded-lg border border-border bg-card p-5 shadow-card sm:p-6"
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
            <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary">
              ทบทวนจุดสารพิษได้ตามต้องการ — กดกลับเมื่อพร้อม
            </p>
          ) : !allVisited ? (
            <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary">
              สำรวจต่อได้อีก{" "}
              <span className="font-semibold text-primary">
                {remainingCount} จุด
              </span>
              {nextHotspot ? (
                <>
                  {" "}
                  — ลองดู{" "}
                  <span className="font-semibold">{nextHotspot.label}</span>
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-3 rounded-lg bg-success/10 px-3 py-2.5 text-sm font-medium text-success">
              สำรวจครบแล้ว พร้อมไปทำแบบทดสอบหลังเรียน
            </p>
          )}

          <p className="mt-3 text-sm leading-relaxed text-textSecondary">
            {selected
              ? selected.description
              : "หมุนโมเดล เปิดโหมดแยกชิ้นส่วน แล้วสำรวจจุดสารพิษให้ครบทุกจุด"}
          </p>

          <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {!allVisited && nextHotspot ? (
              <Button
                type="button"
                className="h-11 w-auto rounded-lg px-5 font-semibold shadow-glowRed"
                onClick={goNextHotspot}
              >
                สำรวจต่อ: {nextHotspot.label}
                <ArrowRight className="size-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="h-11 w-auto rounded-lg px-5"
              disabled={!selected}
              onClick={() => setPopupOpen(true)}
            >
              ดูรายละเอียด
            </Button>
            {isReview ? (
              <Button
                type="button"
                className="h-11 w-auto rounded-lg px-5 font-semibold shadow-glowRed"
                onClick={goResult}
              >
                {hasLocalResult ? "กลับไปดูผลลัพธ์" : "กลับหน้าหลัก"}
                <ArrowRight className="size-4" />
              </Button>
            ) : allVisited ? (
              <Button
                type="button"
                className="h-11 w-auto rounded-lg px-5 font-semibold shadow-glowRed"
                onClick={goPosttest}
              >
                ถัดไป: แบบทดสอบหลังเรียน
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-auto rounded-lg px-5 text-textSecondary"
                disabled
                aria-disabled="true"
              >
                สำรวจต่ออีก {remainingCount} จุด
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
