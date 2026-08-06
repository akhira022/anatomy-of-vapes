"use client";

import { Html } from "@react-three/drei";
import { cn } from "@/lib/utils";

interface HotspotMarkerProps {
  id: string;
  label: string;
  position: [number, number, number];
  visited: boolean;
  selected: boolean;
  onClick: (id: string) => void;
}

export function HotspotMarker({
  id,
  label,
  position,
  visited,
  selected,
  onClick,
}: HotspotMarkerProps) {
  return (
    <group position={position}>
      <Html
        center
        distanceFactor={6}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
        // Skip expensive occlusion / depth tests — markers are always tappable.
        occlude={false}
      >
        <button
          type="button"
          aria-label={`จุดสำรวจ: ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick(id);
          }}
          className={cn(
            "pointer-events-auto flex size-11 items-center justify-center rounded-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            selected && "scale-110"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-5 rounded-full border-2 border-white shadow-glowRed transition-transform duration-normal",
              visited
                ? "bg-success shadow-glowGreen"
                : "bg-primary animate-hotspot-pulse",
              selected && "scale-125 ring-2 ring-white"
            )}
          />
        </button>
      </Html>
    </group>
  );
}
