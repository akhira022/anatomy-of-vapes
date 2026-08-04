"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { HotspotMarker } from "@/components/hotspot/HotspotMarker";
import { hotspots } from "@/data/hotspots";

export interface VapeModelProps {
  exploded: boolean;
  visitedHotspots?: string[];
  selectedHotspotId?: string | null;
  onHotspotClick?: (id: string) => void;
  showHotspots?: boolean;
  castShadows?: boolean;
  autoSpin?: boolean;
}

function Part({
  position,
  targetY,
  color,
  args,
  castShadows,
}: {
  position: [number, number, number];
  targetY: number;
  color: string;
  args: [number, number, number, number];
  castShadows: boolean;
}) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const current = ref.current.position.y;
    ref.current.position.y += (targetY - current) * Math.min(1, delta * 4);
  });

  return (
    <group ref={ref} position={position}>
      <mesh castShadow={castShadows} receiveShadow={castShadows}>
        <cylinderGeometry args={args} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Placeholder 3-part vape model.
 * Swap this implementation for useGLTF('/models/vape.glb') when the real asset is ready.
 */
export function VapeModel({
  exploded,
  visitedHotspots = [],
  selectedHotspotId = null,
  onHotspotClick,
  showHotspots = true,
  castShadows = true,
  autoSpin = false,
}: VapeModelProps) {
  const rootRef = useRef<Group>(null);
  const mouthY = exploded ? 1.35 : 0.85;
  const coilY = exploded ? 0.15 : 0.15;
  const batteryY = exploded ? -1.15 : -0.7;

  useFrame((_, delta) => {
    if (!autoSpin || !rootRef.current) return;
    rootRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={rootRef}>
      <Part
        position={[0, 0.85, 0]}
        targetY={mouthY}
        color="#4b5563"
        args={[0.22, 0.18, 0.55, 24]}
        castShadows={castShadows}
      />
      <Part
        position={[0, 0.15, 0]}
        targetY={coilY}
        color="#9ca3af"
        args={[0.28, 0.28, 0.7, 24]}
        castShadows={castShadows}
      />
      <Part
        position={[0, -0.7, 0]}
        targetY={batteryY}
        color="#1f2937"
        args={[0.3, 0.3, 0.95, 24]}
        castShadows={castShadows}
      />

      <mesh position={[0, exploded ? 0.55 : 0.5, 0]}>
        <torusGeometry args={[0.29, 0.03, 12, 32]} />
        <meshStandardMaterial
          color="#E53935"
          emissive="#E53935"
          emissiveIntensity={0.35}
        />
      </mesh>

      {showHotspots && onHotspotClick
        ? hotspots.map((hs) => (
            <HotspotMarker
              key={hs.id}
              id={hs.id}
              label={hs.label}
              position={[
                hs.position.x,
                exploded
                  ? hs.position.y +
                    (hs.meshName === "mouthpiece"
                      ? 0.5
                      : hs.meshName === "battery"
                        ? -0.45
                        : 0)
                  : hs.position.y,
                hs.position.z,
              ]}
              visited={visitedHotspots.includes(hs.id)}
              selected={selectedHotspotId === hs.id}
              onClick={onHotspotClick}
            />
          ))
        : null}
    </group>
  );
}
