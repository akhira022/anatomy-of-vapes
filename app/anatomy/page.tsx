"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { PageLoading } from "@/components/feedback/PageLoading";
import { AnatomyHotspotDeepLink } from "@/components/anatomy/AnatomyHotspotDeepLink";
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
  const userType = useQuizStore((s) => s.userType);
  const markHotspotVisited = useQuizStore((s) => s.markHotspotVisited);
  const setSelectedHotspotId = useQuizStore((s) => s.setSelectedHotspotId);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);

  const isGuest = userType === "guest";

  const isReview =
    currentPhase === "result" ||
    currentPhase === "guest_complete" ||
    (resultSaved &&
      currentPhase !== "anatomy" &&
      currentPhase !== "posttest");

  const handleHotspotClick = useCallback(
    (id: string) => {
      setSelectedHotspotId(id);
      if (!isReview) markHotspotVisited(id);
      setPopupOpen(true);
    },
    [isReview, markHotspotVisited, setSelectedHotspotId]
  );

  const handleDeepLink = useCallback(
    (hotspotId: string) => {
      handleHotspotClick(hotspotId);
    },
    [handleHotspotClick]
  );

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

  const goGuestComplete = () => {
    if (!allVisited || isReview) return;
    setPhase("guest_complete");
    router.push("/guest/complete");
  };

  const goNextAfterAnatomy = () => {
    if (isGuest) {
      goGuestComplete();
      return;
    }
    goPosttest();
  };

  const goResult = () => {
    if (isGuest) {
      router.push(resultSaved || currentPhase === "guest_complete" ? "/guest/complete" : "/");
      return;
    }
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

  /** Mobile/tablet sticky strip — primary next action lives here only. */
  const stickyProgress = !isReview ? (
    <div className="sticky top-14 z-20 -mx-4 border-y border-border bg-background/95 px-4 py-2.5 backdrop-blur-sm sm:top-16 sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-textSecondary" aria-live="polite">
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
            className="font-semibold shadow-glowRed"
            onClick={goNextAfterAnatomy}
          >
            {isGuest ? "เสร็จสิ้นการเรียนรู้" : "ไปแบบทดสอบหลังเรียน"}
            <ArrowRight className="size-4" />
          </Button>
        ) : nextHotspot ? (
          <Button
            type="button"
            size="touch"
            variant="secondary"
            className="font-semibold"
            onClick={goNextHotspot}
          >
            จุดถัดไป: {nextHotspot.label}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  /**
   * Status card. `showPrimaryCta` avoids duplicating the sticky next button on
   * phone/tablet; on xl the sticky is hidden so the card owns the CTA.
   */
  const statusSection = (showPrimaryCta: boolean) => (
    <section
      aria-labelledby="exploration-status"
      className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5"
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
          {isGuest
            ? "สำรวจครบแล้ว พร้อมเสร็จสิ้นการเรียนรู้"
            : "สำรวจครบแล้ว พร้อมไปทำแบบทดสอบหลังเรียน"}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-textSecondary xl:text-base">
        {selected
          ? selected.description
          : "หมุนโมเดล เปิดโหมดแยกชิ้นส่วน แล้วสำรวจจุดสารพิษให้ครบทุกจุด"}
      </p>

      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {showPrimaryCta && !allVisited && nextHotspot ? (
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
            {isGuest
              ? "กลับไปสรุปผล"
              : hasLocalResult
                ? "กลับไปดูผลลัพธ์"
                : "กลับหน้าหลัก"}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
        {showPrimaryCta && !isReview && allVisited ? (
          <Button
            type="button"
            size="touch"
            className="font-semibold shadow-glowRed xl:min-h-12"
            onClick={goNextAfterAnatomy}
          >
            {isGuest ? "เสร็จสิ้นการเรียนรู้" : "ถัดไป: แบบทดสอบหลังเรียน"}
            <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </section>
  );

  const scene = (
    <div className="relative h-[min(48dvh,380px)] w-full shrink-0 sm:h-[min(56dvh,440px)] xl:h-[calc(100dvh-7.5rem)] xl:min-h-[28rem] xl:max-h-[calc(100dvh-7.5rem)]">
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
      <AnatomyHotspotDeepLink
        hydrated={hydrated}
        ready={ready}
        onDeepLink={handleDeepLink}
      />
      <AppNavbar
        title={isReview ? "ทบทวนโมเดล 3D" : "สำรวจ 3 มิติ"}
        showBack
        backHref={
          isReview
            ? isGuest
              ? "/guest/complete"
              : hasLocalResult
                ? "/result"
                : "/"
            : "/pretest"
        }
        showSessionMenu
        contentClassName="xl:max-w-[1600px]"
      />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 px-4 pb-24 pt-4 text-left sm:gap-4 sm:px-6 sm:pb-28 sm:pt-6 xl:max-w-[1600px] xl:gap-4 xl:pb-8 xl:pt-5"
      >
        {isReview ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-textSecondary xl:text-base">
            โหมดทบทวน — สำรวจโมเดลและจุดสารพิษได้อิสระ ไม่กระทบคะแนนที่ทำไว้แล้ว
          </p>
        ) : (
          <Stepper current="anatomy" variant={isGuest ? "guest" : "full"} />
        )}

        {/* Mobile / tablet: stacked — sticky owns next CTA */}
        <div className="flex flex-col gap-3 sm:gap-4 xl:hidden">
          {modeToggle}
          {stickyProgress}
          {scene}
          {statusSection(false)}

          <details className="group rounded-lg border border-border bg-card sm:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-heading text-base font-semibold text-textPrimary marker:content-none [&::-webkit-details-marker]:hidden">
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

        {/* xl+: canvas left, single control column right (no duplicate sticky) */}
        <div className="hidden xl:grid xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,24rem)] xl:items-stretch xl:gap-5">
          <div className="min-h-0 min-w-0">{scene}</div>
          <aside className="flex min-h-0 max-h-[calc(100dvh-7.5rem)] flex-col gap-3 overflow-y-auto overscroll-contain pb-6 pr-1">
            {modeToggle}
            {statusSection(true)}
            <HotspotList
              items={hotspots}
              visitedIds={visitedHotspots}
              selectedId={selectedHotspotId}
              onSelect={handleHotspotClick}
              className="min-h-0 flex-1 [&_ul]:xl:grid-cols-1"
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
