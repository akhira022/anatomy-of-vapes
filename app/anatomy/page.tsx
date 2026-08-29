"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { PageLoading } from "@/components/feedback/PageLoading";
import { useAppRouter } from "@/hooks/useAppRouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Stepper } from "@/components/layout/Stepper";
import { HotspotList } from "@/components/hotspot/HotspotList";
import { HotspotPopup } from "@/components/popup/HotspotPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hotspots } from "@/data/hotspots";
import {
  getPhaseBlockMessage,
  useRequirePhase,
  useHydrated,
} from "@/hooks/useRequirePhase";
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
  const { ready, blockedReason } = useRequirePhase("anatomy");
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

  const isReview =
    currentPhase === "result" ||
    (resultSaved &&
      currentPhase !== "anatomy" &&
      currentPhase !== "posttest");

  useEffect(() => {
    if (!hydrated || !ready) return;
    const hotspotParam = new URLSearchParams(window.location.search).get(
      "hotspot"
    );
    if (!hotspotParam) return;
    const exists = hotspots.some((h) => h.id === hotspotParam);
    if (!exists) return;

    setSelectedHotspotId(hotspotParam);
    if (!isReview) markHotspotVisited(hotspotParam);
    setPopupOpen(true);
    setMode("exploded");
  }, [
    hydrated,
    ready,
    isReview,
    markHotspotVisited,
    setSelectedHotspotId,
  ]);

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
      <PageLoading
        detail={getPhaseBlockMessage(blockedReason) ?? undefined}
      />
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

  const modeToggle = (
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
            "min-h-11 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-normal xl:min-h-12 xl:px-5 xl:text-base",
            mode === id
              ? "border-primary bg-primary text-white"
              : "border-border bg-card text-textSecondary hover:text-textPrimary"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const stickyProgress = !isReview ? (
    <div className="sticky top-14 z-20 -mx-4 border-y border-border bg-background/95 px-4 py-2.5 backdrop-blur-sm sm:top-16 sm:-mx-6 sm:px-6 xl:static xl:mx-0 xl:rounded-lg xl:border xl:px-4 xl:py-3 xl:backdrop-blur-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-textSecondary xl:text-base" aria-live="polite">
          สำรวจแล้ว{" "}
          <span className="font-semibold text-textPrimary">
            {visitedHotspots.length}/{hotspots.length}
          </span>
          {!allVisited ? (
            <>
              {" "}
              · เหลือ{" "}
              <span className="font-semibold text-primary">
                {remainingCount}
              </span>{" "}
              จุด
            </>
          ) : (
            <span className="ml-1 font-medium text-success">· ครบแล้ว</span>
          )}
        </p>
        {allVisited ? (
          <Button
            type="button"
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
            onClick={goPosttest}
          >
            ไปแบบทดสอบหลังเรียน
            <ArrowRight className="size-4" />
          </Button>
        ) : nextHotspot ? (
          <Button
            type="button"
            size="touch"
            variant="secondary"
            className="font-semibold xl:min-h-12"
            onClick={goNextHotspot}
          >
            จุดถัดไป: {nextHotspot.label}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  const statusSection = (
    <section
      aria-labelledby="exploration-status"
      className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5 xl:p-5"
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
            className="font-heading text-2xl font-semibold text-textPrimary xl:text-3xl"
            aria-live="polite"
          >
            {visitedHotspots.length}/{hotspots.length}
          </p>
        </div>
        {selected ? (
          <Badge variant="outline">{selected.label}</Badge>
        ) : (
          <Badge variant="outline">แตะจุดสีแดงหรือเลือกจากรายการ</Badge>
        )}
      </div>

      {isReview ? (
        <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary xl:text-base">
          ทบทวนจุดสารพิษได้ตามต้องการ — กดกลับเมื่อพร้อม
        </p>
      ) : !allVisited ? (
        <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-textPrimary xl:text-base">
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
        <p className="mt-3 rounded-lg bg-success/10 px-3 py-2.5 text-sm font-medium text-success xl:text-base">
          สำรวจครบแล้ว พร้อมไปทำแบบทดสอบหลังเรียน
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-textSecondary xl:text-base">
        {selected
          ? selected.description
          : "หมุนโมเดล เปิดโหมดแยกชิ้นส่วน แล้วสำรวจจุดสารพิษให้ครบทุกจุด"}
      </p>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {!allVisited && nextHotspot ? (
          <Button
            type="button"
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
            onClick={goNextHotspot}
          >
            สำรวจต่อ: {nextHotspot.label}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="touch"
          className="xl:min-h-12"
          disabled={!selected}
          onClick={() => setPopupOpen(true)}
        >
          ดูรายละเอียด
        </Button>
        {isReview ? (
          <Button
            type="button"
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
            onClick={goResult}
          >
            {hasLocalResult ? "กลับไปดูผลลัพธ์" : "กลับหน้าหลัก"}
            <ArrowRight className="size-4" />
          </Button>
        ) : allVisited ? (
          <Button
            type="button"
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
            onClick={goPosttest}
          >
            ถัดไป: แบบทดสอบหลังเรียน
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="touch"
            className="opacity-60 xl:min-h-12"
            disabled
            aria-disabled="true"
          >
            สำรวจต่ออีก {remainingCount} จุด
          </Button>
        )}
      </div>
    </section>
  );

  const scene = (
    <div className="relative h-[min(48dvh,380px)] w-full shrink-0 sm:h-[min(56dvh,440px)] xl:h-[calc(100dvh-8rem)] xl:min-h-[28rem]">
      <VapeScene
        exploded={mode === "exploded"}
        onExplodedChange={(next) => setMode(next ? "exploded" : "whole")}
        visitedHotspots={visitedHotspots}
        selectedHotspotId={selectedHotspotId}
        onHotspotClick={handleHotspotClick}
        hotspotItems={hotspots}
        nextHotspotId={nextHotspot?.id ?? null}
        onNextHotspot={goNextHotspot}
        popupOpen={popupOpen && Boolean(selected)}
      />
    </div>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title={isReview ? "ทบทวนโมเดล 3D" : "สำรวจ 3 มิติ"}
        showBack
        backHref={isReview ? (hasLocalResult ? "/result" : "/") : "/pretest"}
        showSessionMenu
      />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-6 xl:max-w-[1600px] xl:gap-5"
      >
        {isReview ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-textSecondary xl:text-base">
            โหมดทบทวน — สำรวจโมเดลและจุดสารพิษได้อิสระ ไม่กระทบคะแนนที่ทำไว้แล้ว
          </p>
        ) : (
          <Stepper current="anatomy" />
        )}

        {/* Mobile / tablet: stacked */}
        <div className="flex flex-col gap-3 sm:gap-4 xl:hidden">
          {modeToggle}
          {stickyProgress}
          {scene}
          {statusSection}

          <details className="group rounded-lg border border-border bg-card sm:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-heading text-base font-semibold text-textPrimary marker:content-none [&::-webkit-details-marker]:hidden">
              รายการจุดสารพิษ
              <ChevronDown className="size-5 shrink-0 text-textSecondary transition-transform group-open:rotate-180" />
            </summary>
            <HotspotList
              items={hotspots}
              visitedIds={visitedHotspots}
              selectedId={selectedHotspotId}
              onSelect={handleHotspotClick}
              className="px-4 pb-4"
              headingId="hotspot-list-heading-mobile"
            />
          </details>

          <HotspotList
            items={hotspots}
            visitedIds={visitedHotspots}
            selectedId={selectedHotspotId}
            onSelect={handleHotspotClick}
            className="hidden pb-4 sm:block"
            headingId="hotspot-list-heading-tablet"
          />
        </div>

        {/* xl+: two-column — tall canvas left, controls right */}
        <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)] xl:items-start xl:gap-6">
          <div className="min-w-0">{scene}</div>
          <aside className="flex max-h-[calc(100dvh-8rem)] flex-col gap-4 overflow-y-auto pr-1">
            {modeToggle}
            {stickyProgress}
            {statusSection}
            <HotspotList
              items={hotspots}
              visitedIds={visitedHotspots}
              selectedId={selectedHotspotId}
              onSelect={handleHotspotClick}
              className="pb-2 [&_ul]:xl:grid-cols-1"
              headingId="hotspot-list-heading-xl"
            />
          </aside>
        </div>
      </main>

      <HotspotPopup
        hotspot={selected}
        open={popupOpen && Boolean(selected)}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  );
}
