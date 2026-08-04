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
      <Html center distanceFactor={6} zIndexRange={[10, 0]}>
        <button
          type="button"
          aria-label={`จุดสำรวจ: ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick(id);
          }}
          className={cn(
            "size-5 rounded-full border-2 border-white shadow-glowRed transition-transform duration-normal",
            visited ? "bg-success" : "bg-primary animate-hotspot-pulse",
            selected && "scale-125 ring-2 ring-white"
          )}
        />
      </Html>
      <mesh visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>
    </group>
  );
}
