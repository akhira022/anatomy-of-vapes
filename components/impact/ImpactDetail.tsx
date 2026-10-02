"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Box, MessageCircleHeart, TriangleAlert } from "lucide-react";
import { BeforeAfterCompare } from "@/components/impact/BeforeAfterCompare";
import { Button } from "@/components/ui/button";
import type { BodyImpactEntry } from "@/data/body-impact";
import { contentSources } from "@/data/sources";
import { cn } from "@/lib/utils";

export interface ImpactModelLink {
  href: string;
  label: string;
}

interface ImpactDetailProps {
  item: BodyImpactEntry;
  index?: number;
  modelLink?: (hotspotId: string) => ImpactModelLink;
  activeSide?: "before" | "after";
  onSideChange?: (side: "before" | "after") => void;
  asTabPanel?: boolean;
  className?: string;
}

export function ImpactDetail({
  item,
  index,
  modelLink,
  activeSide,
  onSideChange,
  asTabPanel,
  className,
}: ImpactDetailProps) {
  const reduceMotion = useReducedMotion();
  const sources = item.sourceIds
    .map((id) => contentSources.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const model = modelLink?.(item.hotspotId);

  return (
    <section
      id={asTabPanel ? "impact-detail" : undefined}
      role={asTabPanel ? "tabpanel" : undefined}
      aria-live={asTabPanel ? "polite" : undefined}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.id}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="p-5 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {index === undefined ? null : (
                <span className="font-heading text-4xl font-bold leading-none text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <h2 className="font-heading text-xl font-semibold text-textPrimary sm:text-2xl">
                {item.title}
              </h2>
            </div>
            <span className="rounded-full bg-textPrimary px-3 py-1 text-xs font-semibold text-background">
              {item.badge}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
            {item.summary}
          </p>

          <div className="mt-6">
            <BeforeAfterCompare
              beforeLabel={item.beforeLabel}
              afterLabel={item.afterLabel}
              beforeText={item.beforeText}
              afterText={item.afterText}
              activeSide={activeSide}
              onSideChange={onSideChange}
            />
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-lg bg-primary/15 px-4 py-3 text-sm font-semibold text-textPrimary">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            {item.mythBust}
          </p>

          {model ? (
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                render={<Link href={model.href} />}
                nativeButton={false}
                size="touch"
              >
                <Box aria-hidden="true" />
                {model.label}
              </Button>
              <Button
                render={<Link href="/practice" />}
                nativeButton={false}
                variant="outline"
                size="touch"
              >
                <MessageCircleHeart aria-hidden="true" />
                ฝึกปฏิเสธเพื่อน
              </Button>
            </div>
          ) : null}

          {sources.length > 0 ? (
            <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-textDisabled">
              อ้างอิง:{" "}
              {sources.map((source, i) => (
                <span key={source.id}>
                  {i > 0 ? " · " : null}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:text-textSecondary hover:underline"
                  >
                    {source.org}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
