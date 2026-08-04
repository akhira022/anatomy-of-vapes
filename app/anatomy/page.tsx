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

type ViewMode = "whole" | "exploded" | "toxin";

const modeOptions = [
  ["whole", "ทั้งชิ้น"],
  ["exploded", "แยกชิ้นส่วน"],
  ["toxin", "สารพิษ"],
] as const;

export default function AnatomyPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const ready = useRequirePhase("anatomy");
  const [mode, setMode] = useState<ViewMode>("whole");
  const [popupOpen, setPopupOpen] = useState(false);

  const visitedHotspots = useQuizStore((s) => s.visitedHotspots);
  const selectedHotspotId = useQuizStore((s) => s.selectedHotspotId);
  const markHotspotVisited = useQuizStore((s) => s.markHotspotVisited);
  const setSelectedHotspotId = useQuizStore((s) => s.setSelectedHotspotId);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setQuestionIndex = useQuizStore((s) => s.setQuestionIndex);

  const selected = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [selectedHotspotId]
  );

  const allVisited = visitedHotspots.length >= hotspots.length;
  const exploded = mode === "exploded" || mode === "toxin";

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
    if (mode === "whole") setMode("toxin");
  };

  const goPosttest = () => {
    if (!allVisited) return;
    setQuestionIndex(0);
    setPhase("posttest");
    router.push("/posttest");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="สำรวจ 3 มิติ" showBack backHref="/pretest" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        <Stepper current="anatomy" />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {modeOptions.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-normal",
                mode === id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-textSecondary hover:text-textPrimary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative h-[min(52dvh,420px)] w-full shrink-0 sm:h-[min(60dvh,560px)]">
          <VapeScene
            exploded={exploded}
            visitedHotspots={visitedHotspots}
            selectedHotspotId={selectedHotspotId}
            onHotspotClick={handleHotspotClick}
          />
        </div>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs tracking-wide text-textSecondary">
                จุดที่สำรวจแล้ว
              </p>
              <p className="font-heading text-lg font-semibold text-textPrimary">
                {visitedHotspots.length}/{hotspots.length}
              </p>
            </div>
            {selected ? (
              <Badge variant="destructive">{selected.label}</Badge>
            ) : (
              <Badge variant="outline">แตะจุดสีแดงบนโมเดล</Badge>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-textSecondary">
            {selected
              ? selected.description
              : "หมุนโมเดล เปิดโหมดแยกชิ้นส่วน แล้วสำรวจจุดสารพิษให้ครบทุกจุดเพื่อไปทำแบบทดสอบหลังเรียน"}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-2xl"
              disabled={!selected}
              onClick={() => setPopupOpen(true)}
            >
              ดูรายละเอียด
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 rounded-2xl font-semibold"
              disabled={!allVisited}
              onClick={goPosttest}
            >
              ถัดไป: แบบทดสอบหลังเรียน
              <ArrowRight className="size-4" />
            </Button>
          </div>
          {!allVisited ? (
            <p className="mt-2 text-center text-xs text-warning">
              สำรวจจุดสารพิษให้ครบก่อนจึงจะไปต่อได้
            </p>
          ) : null}
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
