"use client";

import { Badge } from "@/components/ui/badge";
import type { HotspotContent } from "@/data/hotspots";
import { cn } from "@/lib/utils";

interface HotspotPanelProps {
  hotspot: HotspotContent | null;
  visitedCount: number;
  total: number;
  className?: string;
}

export function HotspotPanel({
  hotspot,
  visitedCount,
  total,
  className,
}: HotspotPanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs tracking-wide text-textSecondary">
          จุดสำรวจ {visitedCount}/{total}
        </p>
        {hotspot ? (
          <Badge variant="destructive">{hotspot.dangerLevel}</Badge>
        ) : null}
      </div>
      <h3 className="mt-2 font-heading text-lg font-semibold text-textPrimary">
        {hotspot?.label ?? "เลือกจุดบนโมเดล"}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-textSecondary">
        {hotspot?.description ??
          "แตะจุดสีแดงเพื่อดูข้อมูลสารพิษแบบสั้นๆ"}
      </p>
    </div>
  );
}
