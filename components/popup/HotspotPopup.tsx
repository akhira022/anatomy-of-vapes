"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Flame, HeartPulse, Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HotspotContent } from "@/data/hotspots";
import { getMythById } from "@/data/myths";

interface HotspotPopupProps {
  hotspot: HotspotContent | null;
  open: boolean;
  onClose: () => void;
}

export function HotspotPopup({ hotspot, open, onClose }: HotspotPopupProps) {
  const myth = getMythById(hotspot?.mythId);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  // Fullscreen only shows descendants of the fullscreen element, so portal into it.
  useEffect(() => {
    const sync = () => {
      setPortalTarget(document.fullscreenElement ?? document.body);
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
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
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-popup sm:p-6"
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
                <div className="rounded-xl border border-toxic/40 bg-toxic/10 p-4">
                  <p className="text-xs font-semibold tracking-wide text-toxic">
                    ความเข้าใจผิด vs ข้อเท็จจริง
                  </p>
                  <p className="mt-2 text-sm text-textSecondary">
                    <span className="font-semibold text-error">ความเข้าใจผิด: {myth.myth}</span>
                  </p>
                  <p className="mt-1 text-sm text-textPrimary">
                    <span className="font-semibold text-success">ข้อเท็จจริง: {myth.fact}</span>
                  </p>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              className="mt-6 h-11 w-full rounded-2xl font-semibold"
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
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center gap-2 font-medium text-textPrimary">
        {icon}
        {title}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-textSecondary">{body}</p>
    </div>
  );
}
