"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HotspotDetailContent } from "@/components/hotspot/HotspotDetailContent";
import type { HotspotContent } from "@/data/hotspots";
import { hotspotTitles } from "@/lib/hotspot-display";
import {
  SCENE_FULLSCREEN_EVENT,
  getSceneFullscreenRoot,
} from "@/lib/scene-fullscreen";

const DIALOG_OPEN_CLASS = "hotspot-dialog-open";

interface HotspotPopupProps {
  hotspot: HotspotContent | null;
  open: boolean;
  onClose: () => void;
}

/** Mobile / tablet / scene-fullscreen modal for hotspot details. */
export function HotspotPopup({ hotspot, open, onClose }: HotspotPopupProps) {
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
            <div className="flex shrink-0 items-start justify-end border-b border-border px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6">
              <HotspotDetailContent
                hotspot={hotspot}
                titleId="hotspot-title"
              />
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
