"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  ChevronDown,
  Flame,
  HeartPulse,
  Lightbulb,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { HotspotContent } from "@/data/hotspots";
import { getHotspotEffectSteps } from "@/data/hotspot-effects";
import { HotspotEffectStrip } from "@/components/hotspot/HotspotEffectStrip";
import type { ChapterLesson } from "@/data/chapters";
import { getChapterByHotspotId } from "@/data/chapters";
import { getMythById } from "@/data/myths";
import { hotspotTitles } from "@/lib/hotspot-display";
import {
  SCENE_FULLSCREEN_EVENT,
  getSceneFullscreenRoot,
} from "@/lib/scene-fullscreen";
import { cn } from "@/lib/utils";

const DIALOG_OPEN_CLASS = "hotspot-dialog-open";

interface HotspotPopupProps {
  hotspot: HotspotContent | null;
  open: boolean;
  onClose: () => void;
}

export function HotspotPopup({ hotspot, open, onClose }: HotspotPopupProps) {
  const myth = getMythById(hotspot?.mythId);
  const chapter = hotspot ? getChapterByHotspotId(hotspot.id) : null;
  const titles = hotspot ? hotspotTitles(hotspot) : null;
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const sync = () => {
      setPortalTarget(getSceneFullscreenRoot() ?? document.body);
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    document.addEventListener(SCENE_FULLSCREEN_EVENT, sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      document.removeEventListener(SCENE_FULLSCREEN_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  // Hide chat FAB / mark modal open for the rest of the UI.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add(DIALOG_OPEN_CLASS);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove(DIALOG_OPEN_CLASS);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && hotspot && titles ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotspot-title"
            data-hotspot-dialog=""
            className="flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-popup sm:rounded-2xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="shrink-0 border-b border-border px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-textSecondary">
                    {[chapter ? `บทที่ ${chapter.id}` : null, hotspot.classification]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <h2
                    id="hotspot-title"
                    className="mt-1 font-heading text-2xl font-bold leading-tight text-textPrimary"
                  >
                    {titles.primary}
                  </h2>
                  {titles.secondary ? (
                    <p className="mt-0.5 text-sm font-medium text-textSecondary">
                      สารที่เกี่ยวข้อง: {titles.secondary}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-textSecondary">
                    ระดับอันตราย{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        hotspot.dangerLevel === "สูง"
                          ? "text-primary"
                          : hotspot.dangerLevel === "กลาง"
                            ? "text-warning"
                            : "text-textPrimary"
                      )}
                    >
                      {hotspot.dangerLevel}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="ghost"
                  aria-label="ปิด"
                  className="size-11 shrink-0 rounded-full"
                  onClick={handleClose}
                >
                  <X className="size-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable body — extra bottom pad clears home indicator */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
              <HotspotEffectStrip
                hotspotId={hotspot.id}
                steps={getHotspotEffectSteps(hotspot.id)}
                className="mt-0"
              />

              <div className="mt-5 space-y-1 divide-y divide-border rounded-xl border border-border bg-surface">
                <InfoRow
                  icon={<Flame className="size-4 text-textSecondary" />}
                  title="พบที่ไหน"
                  body={hotspot.foundIn}
                />
                <InfoRow
                  icon={<HeartPulse className="size-4 text-textSecondary" />}
                  title="ผลต่อสุขภาพ"
                  body={hotspot.healthEffects}
                />
                <InfoRow
                  icon={<Lightbulb className="size-4 text-textSecondary" />}
                  title="คำแนะนำ"
                  body={hotspot.advice}
                />
              </div>

              {myth ? (
                <div className="mt-4 rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold tracking-wide text-textSecondary">
                    ความเข้าใจผิด vs ข้อเท็จจริง
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <p className="text-sm leading-relaxed text-textSecondary">
                      <span className="font-medium text-textPrimary">เข้าใจผิด — </span>
                      {myth.myth}
                    </p>
                    <p className="text-sm leading-relaxed text-textSecondary">
                      <span className="font-medium text-textPrimary">ข้อเท็จจริง — </span>
                      {myth.fact}
                    </p>
                  </div>
                </div>
              ) : null}

              {chapter ? (
                <div className="mt-4">
                  <HotspotLessonAccordion key={hotspot.id} chapter={chapter} />
                </div>
              ) : null}

              <div className="h-3" aria-hidden="true" />
            </div>

            <div className="shrink-0 border-t border-border px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
              <Button
                type="button"
                className="h-11 w-full rounded-xl font-semibold sm:w-auto sm:px-8"
                onClick={handleClose}
              >
                ปิด
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget
  );
}

function HotspotLessonAccordion({ chapter }: { chapter: ChapterLesson }) {
  const [lessonOpen, setLessonOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
        aria-expanded={lessonOpen}
        onClick={() => setLessonOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-textPrimary">
          <BookOpen className="size-4 text-textSecondary" />
          อ่านบทเรียนเต็ม — บทที่ {chapter.id}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-textSecondary transition-transform duration-normal",
            lessonOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {lessonOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border px-3.5 pb-3.5 pt-3">
              <div>
                <p className="font-heading text-sm font-semibold text-textPrimary">
                  {chapter.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-textSecondary">
                  {chapter.summary}
                </p>
              </div>

              {chapter.sections.map((section) => (
                <div key={section.heading} className="rounded-lg bg-card p-3">
                  <p className="text-sm font-semibold text-textPrimary">
                    {section.heading}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-textSecondary">
                    {section.body}
                  </p>
                  {section.bulletPoints?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-textSecondary">
                      {section.bulletPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}

              <div className="rounded-lg bg-card p-3">
                <p className="text-xs font-semibold tracking-wide text-textSecondary">
                  จุดที่ควรจำ
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-textPrimary">
                  {chapter.keyTakeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="px-3.5 py-3.5">
      <div className="flex items-center gap-2 text-sm font-medium text-textPrimary">
        {icon}
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-textSecondary">{body}</p>
    </div>
  );
}
