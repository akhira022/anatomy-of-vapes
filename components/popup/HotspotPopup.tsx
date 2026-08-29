"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  ChevronDown,
  Flame,
  HeartPulse,
  Lightbulb,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HotspotContent } from "@/data/hotspots";
import { getChapterByHotspotId } from "@/data/chapters";
import { getMythById } from "@/data/myths";
import {
  SCENE_FULLSCREEN_EVENT,
  getSceneFullscreenRoot,
} from "@/lib/scene-fullscreen";
import { cn } from "@/lib/utils";

interface HotspotPopupProps {
  hotspot: HotspotContent | null;
  open: boolean;
  onClose: () => void;
}

export function HotspotPopup({ hotspot, open, onClose }: HotspotPopupProps) {
  const myth = getMythById(hotspot?.mythId);
  const chapter = hotspot ? getChapterByHotspotId(hotspot.id) : null;
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);

  // Native + CSS fullscreen only show descendants of the fullscreen root.
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
    if (!open) {
      setLessonOpen(false);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && hotspot ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotspot-title"
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-popup sm:p-6"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="hotspot-title"
                    className="font-heading text-xl font-bold text-textPrimary"
                  >
                    {hotspot.label}
                  </h2>
                  <Badge variant="destructive">{hotspot.classification}</Badge>
                  {chapter ? (
                    <Badge variant="secondary">บทที่ {chapter.id}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-textSecondary">
                  ระดับอันตราย:{" "}
                  <span className="font-semibold text-primary">
                    {hotspot.dangerLevel}
                  </span>
                </p>
              </div>
              <Button
                type="button"
                size="icon-lg"
                variant="ghost"
                aria-label="ปิด"
                className="size-11 shrink-0"
                onClick={onClose}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <InfoBlock
                icon={<Flame className="size-4 text-warning" />}
                title="พบที่ไหน"
                body={hotspot.foundIn}
              />
              <InfoBlock
                icon={<HeartPulse className="size-4 text-error" />}
                title="ผลต่อสุขภาพ"
                body={hotspot.healthEffects}
              />
              <InfoBlock
                icon={<Lightbulb className="size-4 text-info" />}
                title="คำแนะนำ"
                body={hotspot.advice}
              />

              {myth ? (
                <div className="rounded-lg border border-toxic/40 bg-toxic/10 p-4">
                  <p className="text-xs font-semibold tracking-wide text-toxic">
                    ความเข้าใจผิด vs ข้อเท็จจริง
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    <span className="font-semibold text-error">
                      ความเข้าใจผิด: {myth.myth}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-textPrimary">
                    <span className="font-semibold text-success">
                      ข้อเท็จจริง: {myth.fact}
                    </span>
                  </p>
                </div>
              ) : null}

              {chapter ? (
                <div className="rounded-lg border border-border bg-surface">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
                    aria-expanded={lessonOpen}
                    onClick={() => setLessonOpen((prev) => !prev)}
                  >
                    <span className="flex items-center gap-2 font-medium text-textPrimary">
                      <BookOpen className="size-4 text-info" />
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
                            <div
                              key={section.heading}
                              className="rounded-md border border-border/70 bg-card p-3"
                            >
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

                          <div className="rounded-md border border-info/30 bg-info/10 p-3">
                            <p className="text-xs font-semibold tracking-wide text-info">
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
              ) : null}
            </div>

            <Button
              type="button"
              className="mt-6 h-11 w-auto rounded-lg px-6 font-semibold"
              onClick={onClose}
            >
              ปิด
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalTarget
  );
}

function InfoBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5">
      <div className="flex items-center gap-2 font-medium text-textPrimary">
        {icon}
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-textSecondary">{body}</p>
    </div>
  );
}
