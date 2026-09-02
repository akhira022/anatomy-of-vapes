"use client";

import { useMemo, useRef } from "react";
import { invalidate, useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import {
  CanvasTexture,
  type Mesh,
  type MeshBasicMaterial,
  SRGBColorSpace,
} from "three";

interface HotspotMarkerProps {
  id: string;
  label: string;
  /** ส่วนของบุหรี่ไฟฟ้า เช่น ที่สูบ แท้งก์ */
  partLabel?: string;
  position: [number, number, number];
  visited: boolean;
  selected: boolean;
  onClick: (id: string) => void;
  /** WebGL pulse keeps the demand-loop awake — off on lite devices. */
  animatePulse?: boolean;
}

const labelTextureCache = new Map<string, CanvasTexture>();

function getLabelTexture(
  text: string,
  accent: string,
  selected: boolean
): CanvasTexture {
  const key = `${text}|${accent}|${selected ? 1 : 0}`;
  const cached = labelTextureCache.get(key);
  if (cached) return cached;

  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2
  );
  const padX = 14;
  const padY = 8;
  const fontSize = 22;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const empty = new CanvasTexture(canvas);
    labelTextureCache.set(key, empty);
    return empty;
  }

  ctx.font = `600 ${fontSize}px "Segoe UI", "Sarabun", "Noto Sans Thai", Tahoma, sans-serif`;
  const textWidth = Math.ceil(ctx.measureText(text).width);
  const w = textWidth + padX * 2;
  const h = fontSize + padY * 2;
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.font = `600 ${fontSize}px "Segoe UI", "Sarabun", "Noto Sans Thai", Tahoma, sans-serif`;
  const radius = h / 2;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();
  ctx.fillStyle = selected ? "rgba(229, 57, 53, 0.95)" : "rgba(20, 20, 22, 0.82)";
  ctx.fill();
  ctx.strokeStyle = selected ? "rgba(255,255,255,0.55)" : accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 0.5);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  labelTextureCache.set(key, texture);
  return texture;
}

/**
 * Pure WebGL markers (no Html/DOM sync) — much cheaper while orbiting on phones.
 * HotspotList remains the accessible fallback for keyboard / screen readers.
 */
export function HotspotMarker({
  id,
  label,
  partLabel,
  position,
  visited,
  selected,
  onClick,
  animatePulse = false,
}: HotspotMarkerProps) {
  const pulseRef = useRef<Mesh>(null);
  const coreScale = selected ? 1.22 : 1;
  const fill = visited ? "#22C55E" : "#E53935";
  const caption = partLabel?.trim() || label;

  const labelTexture = useMemo(
    () => getLabelTexture(caption, fill, selected),
    [caption, fill, selected]
  );

  const labelAspect = useMemo(() => {
    const img = labelTexture.image as HTMLCanvasElement | undefined;
    if (!img?.width || !img?.height) return 2.4;
    return img.width / img.height;
  }, [labelTexture]);

  useFrame(({ clock }) => {
    const mesh = pulseRef.current;
    if (!mesh || visited || !animatePulse) return;
    const t = (Math.sin(clock.elapsedTime * Math.PI) + 1) / 2;
    mesh.scale.setScalar(1 + t * 0.4);
    const mat = mesh.material as MeshBasicMaterial;
    mat.opacity = 0.3 + t * 0.4;
    invalidate();
  });

  const handleSelect = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(id);
  };

  const labelH = selected ? 0.2 : 0.16;
  const labelW = labelH * labelAspect;

  return (
    <group position={position} userData={{ hotspotId: id, label, partLabel }}>
      <Billboard>
        {/* Large invisible hit target for thumbs */}
        <mesh onClick={handleSelect} onPointerDown={(e) => e.stopPropagation()}>
          <circleGeometry args={[0.28, 12]} />
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
          <meshBasicMaterial
            color="#FFFFFF"
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh scale={coreScale} renderOrder={3} onClick={handleSelect}>
          <circleGeometry args={[0.07, 16]} />
          <meshBasicMaterial
            color={fill}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh
          position={[0.22 + labelW * 0.35, 0.02, 0]}
          renderOrder={4}
          onClick={handleSelect}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <planeGeometry args={[labelW, labelH]} />
          <meshBasicMaterial
            map={labelTexture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
