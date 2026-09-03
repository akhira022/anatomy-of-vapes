"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  /** Nudge the floating caption up/down to avoid stacking with neighbors. */
  labelOffsetY?: number;
}

const labelTextureCache = new Map<string, CanvasTexture>();

/** Match app/layout.tsx — next/font IBM Plex Sans Thai (400/500/700). */
const LABEL_FONT =
  '700 22px "IBM Plex Sans Thai", "Noto Sans Thai", Tahoma, sans-serif';

function measureLabelWidth(ctx: CanvasRenderingContext2D, text: string) {
  const metrics = ctx.measureText(text);
  const bounding =
    (metrics.actualBoundingBoxLeft ?? 0) +
    (metrics.actualBoundingBoxRight ?? 0);
  return Math.ceil(Math.max(metrics.width, bounding, text.length * 12) * 1.2);
}

function getLabelTexture(
  text: string,
  accent: string,
  selected: boolean,
  fontReadyToken: number
): CanvasTexture {
  const key = `${text}|${accent}|${selected ? 1 : 0}|f${fontReadyToken}`;
  const cached = labelTextureCache.get(key);
  if (cached) return cached;

  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2
  );
  const padX = 20;
  const padY = 12;
  const fontSize = 22;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const empty = new CanvasTexture(canvas);
    labelTextureCache.set(key, empty);
    return empty;
  }

  ctx.font = LABEL_FONT;
  const textWidth = measureLabelWidth(ctx, text);
  const w = textWidth + padX * 2;
  const h = fontSize + padY * 2 + 4;
  canvas.width = Math.ceil(w * dpr);
  canvas.height = Math.ceil(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.font = LABEL_FONT;
  const radius = Math.min(h / 2, 14);
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();
  ctx.fillStyle = selected
    ? "rgba(229, 57, 53, 0.95)"
    : "rgba(20, 20, 22, 0.88)";
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
  texture.anisotropy = 2;
  labelTextureCache.set(key, texture);
  return texture;
}

/**
 * Pure WebGL markers (no Html/DOM sync) — much cheaper while orbiting on phones.
 * Hit targets stay tight so OrbitControls can still receive drags nearby.
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
  labelOffsetY = 0,
}: HotspotMarkerProps) {
  const pulseRef = useRef<Mesh>(null);
  const coreScale = selected ? 1.28 : 1;
  // Quieter visited green so a completed model does not look “neon”.
  const fill = selected ? "#E53935" : visited ? "#2F9E5B" : "#E53935";
  const caption = partLabel?.trim() || label;
  const labelSide = position[0] < -0.05 ? -1 : 1;

  const [fontReadyToken, setFontReadyToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (cancelled) return;
      setFontReadyToken((n) => n + 1);
      invalidate();
    };

    if (typeof document === "undefined" || !document.fonts?.load) {
      return;
    }

    void document.fonts
      .load('700 22px "IBM Plex Sans Thai"')
      .then(markReady)
      .catch(() => {});

    if (document.fonts.status === "loaded") {
      markReady();
    } else {
      document.fonts.ready.then(markReady).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const labelTexture = useMemo(
    () => getLabelTexture(caption, fill, selected, fontReadyToken),
    [caption, fill, selected, fontReadyToken]
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
    mesh.scale.setScalar(1 + t * 0.35);
    const mat = mesh.material as MeshBasicMaterial;
    mat.opacity = 0.28 + t * 0.35;
    invalidate();
  });

  const handleSelect = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(id);
  };

  const labelH = selected ? 0.2 : 0.15;
  const labelW = labelH * labelAspect;
  const labelX = labelSide * (0.26 + labelW * 0.35);

  return (
    <group position={position} userData={{ hotspotId: id, label, partLabel }}>
      <Billboard>
        {/*
          Tight hit disc only — a large invisible plane was swallowing orbit
          drags and made nearby green dots feel “sticky” / wrong on phones.
        */}
        <mesh
          onClick={handleSelect}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <circleGeometry args={[0.15, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {!visited && animatePulse ? (
          <mesh ref={pulseRef} renderOrder={1}>
            <circleGeometry args={[0.11, 16]} />
            <meshBasicMaterial
              color="#E53935"
              transparent
              opacity={0.4}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ) : null}

        <mesh scale={coreScale} renderOrder={2} onClick={handleSelect}>
          <ringGeometry args={[0.065, 0.09, 24]} />
          <meshBasicMaterial
            color="#FFFFFF"
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh scale={coreScale} renderOrder={3} onClick={handleSelect}>
          <circleGeometry args={[0.065, 20]} />
          <meshBasicMaterial
            color={fill}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <mesh
          key={`label-${caption}-${fontReadyToken}-${selected ? 1 : 0}`}
          position={[labelX, 0.02 + labelOffsetY, 0]}
          renderOrder={4}
          onClick={handleSelect}
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
