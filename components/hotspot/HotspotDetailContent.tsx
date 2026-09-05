"use client";

import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Flame,
  HeartPulse,
  Lightbulb,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { HotspotContent } from "@/data/hotspots";
import { getHotspotEffectSteps } from "@/data/hotspot-effects";
import { HotspotEffectStrip } from "@/components/hotspot/HotspotEffectStrip";
import type { ChapterLesson } from "@/data/chapters";
import { getChapterByHotspotId } from "@/data/chapters";
import { getMythById } from "@/data/myths";
import { hotspotTitles } from "@/lib/hotspot-display";
import { cn } from "@/lib/utils";

interface HotspotDetailContentProps {
  hotspot: HotspotContent;
  /** Heading element id for aria-labelledby */
  titleId?: string;
  className?: string;
  /** Compact padding for the side panel */
  compact?: boolean;
}

/** Shared hotspot detail body — used by mobile popup and desktop side panel. */
export function HotspotDetailContent({
  hotspot,
  titleId = "hotspot-title",
  className,
  compact = false,
}: HotspotDetailContentProps) {
  const myth = getMythById(hotspot.mythId);
  const chapter = getChapterByHotspotId(hotspot.id);
  const titles = hotspotTitles(hotspot);

  return (
    <div className={cn(className)}>
      <div className={cn(compact ? "px-4 pb-2 pt-1" : undefined)}>
        <p className="text-xs font-medium tracking-wide text-textSecondary">
          {[chapter ? `บทที่ ${chapter.id}` : null, hotspot.classification]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h2
          id={titleId}
          className={cn(
            "mt-1 font-heading font-bold leading-tight text-textPrimary",
            compact ? "text-xl" : "text-2xl"
          )}
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

      <div className={cn(compact ? "px-4 pb-4 pt-3" : "pt-4")}>
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
      </div>
    </div>
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
