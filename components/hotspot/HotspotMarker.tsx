"use client";

import { useRef } from "react";
import { invalidate, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import type { Mesh } from "three";

interface HotspotMarkerProps {
  id: string;
  label: string;
  position: [number, number, number];
  visited: boolean;
  selected: boolean;
  onClick: (id: string) => void;
  /** WebGL pulse keeps the demand-loop awake — off on lite devices. */
  animatePulse?: boolean;
}

/**
 * Pure WebGL markers (no Html/DOM sync) — much cheaper while orbiting on phones.
 * HotspotList remains the accessible fallback for keyboard / screen readers.
 */
export function HotspotMarker({
  id,
  label,
  position,
  visited,
  selected,
  onClick,
  animatePulse = false,
}: HotspotMarkerProps) {
  const pulseRef = useRef<Mesh>(null);
  const coreScale = selected ? 1.22 : 1;
  const fill = visited ? "#22C55E" : "#E53935";

  useFrame(({ clock }) => {
    const mesh = pulseRef.current;
    if (!mesh || visited || !animatePulse) return;
    const t = (Math.sin(clock.elapsedTime * Math.PI) + 1) / 2;
    mesh.scale.setScalar(1 + t * 0.4);
    const mat = mesh.material as { opacity: number };
    mat.opacity = 0.3 + t * 0.4;
    invalidate();
  });

  const handleSelect = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(id);
  };

  return (
    <group position={position} userData={{ hotspotId: id, label }}>
      <Billboard>
        {/* Large invisible hit target for thumbs */}
        <mesh onClick={handleSelect} onPointerDown={(e) => e.stopPropagation()}>
          <circleGeometry args={[0.24, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {!visited && animatePulse ? (
          <mesh ref={pulseRef} renderOrder={1}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial
              color="#E53935"
              transparent
              opacity={0.45}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ) : null}

        <mesh scale={coreScale} renderOrder={2} onClick={handleSelect}>
          <ringGeometry args={[0.07, 0.095, 20]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} depthWrite={false} />
        </mesh>

        <mesh scale={coreScale} renderOrder={3} onClick={handleSelect}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial color={fill} toneMapped={false} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}
