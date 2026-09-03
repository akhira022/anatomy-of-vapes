"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HotspotDetailContent } from "@/components/hotspot/HotspotDetailContent";
import type { HotspotContent } from "@/data/hotspots";
import { cn } from "@/lib/utils";

interface HotspotDetailPanelProps {
  hotspot: HotspotContent | null;
  onClose: () => void;
  className?: string;
}

/** Desktop side-panel detail — keeps the 3D model visible while reading. */
export function HotspotDetailPanel({
  hotspot,
  onClose,
  className,
}: HotspotDetailPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {hotspot ? (
        <motion.section
          key={hotspot.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          aria-labelledby="hotspot-desktop-title"
          className={cn(
            "rounded-xl border border-border bg-card shadow-card",
            className
          )}
        >
          <div className="flex items-start justify-between gap-2 border-b border-border px-4 pb-2 pt-4">
            <p className="text-xs font-medium tracking-wide text-textSecondary">
              รายละเอียดจุดสำรวจ
            </p>
            <Button
              type="button"
              size="icon-lg"
              variant="ghost"
              aria-label="ปิดรายละเอียด"
              className="size-10 shrink-0 rounded-full"
              onClick={onClose}
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="max-h-[min(52dvh,28rem)] overflow-y-auto overscroll-contain">
            <HotspotDetailContent
              hotspot={hotspot}
              titleId="hotspot-desktop-title"
              compact
            />
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "rounded-xl border border-dashed border-border bg-card/60 px-4 py-5",
            className
          )}
        >
          <p className="font-heading text-base font-semibold text-textPrimary">
            เลือกจุดบนโมเดล
          </p>
          <p className="mt-1 text-sm leading-relaxed text-textSecondary">
            คลิกจุดบนโมเดล 3D หรือเลือกรายการด้านล่าง — รายละเอียดจะแสดงที่นี่โดยไม่บังโมเดล
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
