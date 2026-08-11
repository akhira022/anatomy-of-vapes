"use client";

/**
 * Static leader-line callouts over the hero's 3D device — mirrors the
 * assembled part stack (mouthpiece / coilTank / battery, top to bottom)
 * so the very first screen already reads as "an anatomy diagram", not
 * just a spinning product shot.
 */
interface AnatomyLabel {
  id: string;
  label: string;
  /** Percent offsets within the hero visual. */
  top: string;
  side: "left" | "right";
  inset: string;
}

const ANATOMY_LABELS: AnatomyLabel[] = [
  { id: "mouthpiece", label: "ปลายไอ", top: "16%", side: "left", inset: "4%" },
  { id: "coilTank", label: "ตัวเครื่อง", top: "38%", side: "right", inset: "4%" },
  { id: "battery", label: "แบตเตอรี่", top: "58%", side: "left", inset: "6%" },
];

export function HeroAnatomyLabels() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] hidden sm:block"
      aria-hidden="true"
    >
      {ANATOMY_LABELS.map(({ id, label, top, side, inset }) => (
        <div
          key={id}
          className={`absolute flex items-center gap-2 ${
            side === "left" ? "flex-row" : "flex-row-reverse"
          }`}
          style={{
            top,
            [side]: inset,
          }}
        >
          <span className="whitespace-nowrap rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-xs font-medium text-textPrimary backdrop-blur-sm">
            {label}
          </span>
          <span className="h-px w-6 bg-primary/70 sm:w-9" />
          <span className="size-1.5 shrink-0 rounded-full bg-primary shadow-glowRed" />
        </div>
      ))}
      <span className="sr-only">
        ส่วนประกอบหลักของบุหรี่ไฟฟ้าจากบนลงล่าง: ปลายไอ ตัวเครื่อง และแบตเตอรี่
      </span>
    </div>
  );
}
