"use client";

import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { BodyImpactEntry, BodyOrgan } from "@/data/body-impact";
import { cn } from "@/lib/utils";

export type BodyState = "before" | "after";

/** วงไฮไลต์รอบอวัยวะที่เลือก พิกัดอยู่ในระบบ viewBox 0 0 120 300 */
const organFocus: Record<BodyOrgan, { cx: number; cy: number; r: number }> = {
  brain: { cx: 60, cy: 22, r: 18 },
  oral: { cx: 60, cy: 36, r: 13 },
  lungs: { cx: 60, cy: 88, r: 25 },
  heart: { cx: 66, cy: 95, r: 17 },
};

const organLabels: Record<
  BodyOrgan,
  { x: number; y: number; side: "left" | "right" }
> = {
  brain: { x: 118, y: 24, side: "right" },
  oral: { x: 2, y: 38, side: "left" },
  lungs: { x: 2, y: 86, side: "left" },
  heart: { x: 118, y: 98, side: "right" },
};

interface BodyMapProps {
  items: (BodyImpactEntry & { organ: BodyOrgan })[];
  activeId: string;
  state: BodyState;
  onSelect: (id: string) => void;
  className?: string;
}

export function BodyMap({
  items,
  activeId,
  state,
  onSelect,
  className,
}: BodyMapProps) {
  const reduceMotion = useReducedMotion();
  const after = state === "after";
  const active = items.find((item) => item.id === activeId);

  const selectOrgan = (organ: BodyOrgan) => {
    const item = items.find((entry) => entry.organ === organ);
    if (item) onSelect(item.id);
  };

  const organClass = (organ: BodyOrgan) =>
    cn(
      "transition-[color,opacity] duration-slow",
      after ? "text-primary" : "text-textPrimary",
      active?.organ === organ
        ? "opacity-100"
        : after
          ? "opacity-70"
          : "opacity-75"
    );

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="-48 0 216 290"
        className="mx-auto h-[19rem] w-auto sm:h-[22rem]"
        role="img"
        aria-label={`รูปร่างกายแสดงตำแหน่งอวัยวะ สถานะ${
          after ? "หลังสูบ" : "ก่อนสูบ"
        } กำลังเน้น${active?.title ?? ""}`}
      >
        {/* ร่างกาย — ใช้ text-primary โปร่ง ไม่ใช้ surface/border ที่ใกล้สีการ์ดในธีมมืด */}
        <g fill="none" strokeLinecap="round">
          <g className="stroke-textPrimary/25 light:stroke-textPrimary/15">
            <path d="M34 66 C23 80 20 102 22 128 L24 152" strokeWidth="16" />
            <path d="M86 66 C97 80 100 102 98 128 L96 152" strokeWidth="16" />
            <path d="M50 150 C47 184 46 224 47 268" strokeWidth="20" />
            <path d="M70 150 C73 184 74 224 73 268" strokeWidth="20" />
          </g>
          <g className="stroke-textPrimary/18 light:stroke-textPrimary/[0.08]">
            <path d="M34 66 C23 80 20 102 22 128 L24 152" strokeWidth="13" />
            <path d="M86 66 C97 80 100 102 98 128 L96 152" strokeWidth="13" />
            <path d="M50 150 C47 184 46 224 47 268" strokeWidth="17" />
            <path d="M70 150 C73 184 74 224 73 268" strokeWidth="17" />
          </g>
          <path
            className="stroke-textPrimary/18 light:stroke-textPrimary/[0.08]"
            d="M60 42 V58"
            strokeWidth="15"
          />
        </g>
        <path
          className="fill-textPrimary/18 stroke-textPrimary/40 light:fill-textPrimary/[0.08] light:stroke-textPrimary/20"
          strokeWidth="1.8"
          d="M60 48 C73 48 85 53 87 63 L89 82 C89 93 82 100 80 112 L82 136 C82 146 73 152 60 152 C47 152 38 146 38 136 L40 112 C38 100 31 93 31 82 L33 63 C35 53 47 48 60 48 Z"
        />
        <circle
          className="fill-textPrimary/18 stroke-textPrimary/40 light:fill-textPrimary/[0.08] light:stroke-textPrimary/20"
          strokeWidth="1.8"
          cx="60"
          cy="26"
          r="18"
        />

        {/* สมอง */}
        <g
          className={cn(organClass("brain"), "cursor-pointer")}
          onClick={() => selectOrgan("brain")}
        >
          <circle
            cx="60"
            cy="22"
            r="18"
            className="fill-transparent"
          />
          <ellipse cx="60" cy="22" rx="12" ry="9.5" fill="currentColor" />
          <path
            d="M50 22 C53.5 17 57 26.5 60.5 21 C64 16 67.5 25 70 21"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="text-background opacity-70"
          />
        </g>

        {/* ช่องปากและฟัน */}
        <g
          className={cn(organClass("oral"), "cursor-pointer")}
          onClick={() => selectOrgan("oral")}
        >
          <circle
            cx="60"
            cy="36"
            r="13"
            className="fill-transparent"
          />
          <ellipse cx="60" cy="36" rx="9" ry="5" fill="currentColor" />
          <path
            d="M52 35.5 H68"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            className="text-background opacity-70"
          />
        </g>

        {/* ปอดและทางเดินหายใจ */}
        <g
          className={cn(organClass("lungs"), "cursor-pointer")}
          onClick={() => selectOrgan("lungs")}
        >
          <ellipse
            cx="50"
            cy="88"
            rx="20"
            ry="22"
            className="fill-transparent"
          />
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.6"
          >
            <path d="M60 56 V70" />
            <path d="M60 70 L53 79" />
            <path d="M60 70 L67 79" />
          </g>
          <path
            d="M56 68 C48 68 42 76 41 88 C40 100 45 108 52 106 C56 105 57 96 57 86 Z"
            fill="currentColor"
          />
          <path
            d="M64 68 C72 68 78 76 79 88 C80 100 75 108 68 106 C64 105 63 96 63 86 Z"
            fill="currentColor"
          />
        </g>

        {/* หัวใจและหลอดเลือด */}
        <g
          className={cn(organClass("heart"), "cursor-pointer")}
          onClick={() => selectOrgan("heart")}
        >
          <circle
            cx="68"
            cy="94"
            r="16"
            className="fill-transparent"
          />
          <path
            d="M66 108 C62 104 54 97 54 90 C54 85 58 82 62 84 C64 85 65 87 66 88 C67 87 68 85 70 84 C74 82 78 85 78 90 C78 97 70 104 66 108 Z"
            fill="currentColor"
          />
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          >
            <path d="M61 104 C57 114 55 126 56 140" />
            <path d="M73 102 C77 112 79 124 78 138" />
          </g>
        </g>

        {/* ละอองไอ — แสดงเฉพาะสถานะหลังสูบ */}
        {after ? (
          <motion.g
            className="text-primary"
            fill="currentColor"
            initial={reduceMotion ? { opacity: 0.55 } : { opacity: 0 }}
            animate={
              reduceMotion
                ? { opacity: 0.55 }
                : { opacity: [0.25, 0.75, 0.25], y: [0, -6, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <circle cx="84" cy="30" r="2.6" />
            <circle cx="93" cy="42" r="1.9" />
            <circle cx="100" cy="24" r="1.4" />
            <circle cx="30" cy="30" r="2.1" />
            <circle cx="22" cy="20" r="1.5" />
            <circle cx="47" cy="92" r="1.7" />
            <circle cx="73" cy="82" r="1.5" />
          </motion.g>
        ) : null}

        {items.map((item) => {
          const label = organLabels[item.organ];
          const focus = organFocus[item.organ];
          const selected = item.id === activeId;
          const lineEndX = label.side === "right" ? label.x - 2 : label.x + 2;
          return (
            <g
              key={item.id}
              className="cursor-pointer"
              onClick={() => onSelect(item.id)}
            >
              <line
                x1={
                  label.side === "right" ? focus.cx + focus.r - 2 : focus.cx - focus.r + 2
                }
                y1={focus.cy}
                x2={lineEndX}
                y2={label.y}
                className={selected ? "stroke-primary" : "stroke-textPrimary/45"}
                strokeWidth="1.4"
              />
              <text
                x={label.x}
                y={label.y + 3}
                textAnchor={label.side === "right" ? "start" : "end"}
                className={cn(
                  "text-[11px] font-semibold",
                  selected ? "fill-primary" : "fill-textPrimary"
                )}
              >
                {item.shortTitle}
              </text>
            </g>
          );
        })}

        {/* วงเน้นอวัยวะที่เลือก */}
        {active ? (
          <motion.circle
            key={active.organ}
            cx={organFocus[active.organ].cx}
            cy={organFocus[active.organ].cy}
            r={organFocus[active.organ].r}
            fill="none"
            strokeWidth="2"
            strokeDasharray="5 4"
            className="text-primary"
            stroke="currentColor"
            initial={reduceMotion ? { opacity: 0.9 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          />
        ) : null}
      </svg>
    </div>
  );
}

interface OrganTabsProps {
  items: (BodyImpactEntry & { organ: BodyOrgan })[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function OrganTabs({
  items,
  activeId,
  onSelect,
  className,
}: OrganTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? -1
            : 0;
      if (!delta) return;
      event.preventDefault();
      const next = (index + delta + items.length) % items.length;
      onSelect(items[next].id);
      refs.current[next]?.focus();
    },
    [items, onSelect]
  );

  return (
    <div
      role="tablist"
      aria-label="เลือกอวัยวะ"
      aria-orientation="horizontal"
      className={cn("grid grid-cols-2 gap-2", className)}
    >
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="impact-detail"
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color] duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/15"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <span
              className={cn(
                "font-heading text-lg font-bold leading-none",
                active ? "text-primary" : "text-textSecondary"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-semibold text-textPrimary">
              {item.shortTitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
