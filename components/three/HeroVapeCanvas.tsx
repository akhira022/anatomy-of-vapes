"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { VapeModel } from "@/components/three/VapeModel";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";
import { useTheme } from "@/components/theme/ThemeProvider";

interface HeroVapeCanvasProps {
  reducedMotion?: boolean;
}

/**
 * Landing hero framing — portrait read for the right-column split pane.
 */
const HERO_CAM = {
  position: [1.05, 0.02, 4.15] as [number, number, number],
  fov: 34,
  lookAt: [0, 0.02, 0] as [number, number, number],
};
const HERO_MODEL_SCALE = 0.44;
const HERO_MODEL_POSITION: [number, number, number] = [0, 0.02, 0];

function ReadyAndPaint({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    onReady();
    invalidate();
  }, [invalidate, onReady]);
  return null;
}

/** Canvas camera props are initial-only — keep framing in sync explicitly. */
function HeroCameraRig() {
  const { camera, invalidate } = useThree();

  useLayoutEffect(() => {
    // R3F camera is a mutable Three.js object; framing must be applied in place.
    camera.position.set(...HERO_CAM.position);
    if ("fov" in camera) {
      // eslint-disable-next-line react-hooks/immutability -- Three.js PerspectiveCamera API
      (camera as typeof camera & { fov: number }).fov = HERO_CAM.fov;
      (
        camera as typeof camera & { updateProjectionMatrix: () => void }
      ).updateProjectionMatrix();
    }
    camera.lookAt(...HERO_CAM.lookAt);
    invalidate();
  }, [camera, invalidate]);

  return null;
}

export function HeroVapeCanvas({ reducedMotion = false }: HeroVapeCanvasProps) {
  const lite = usePreferLite3D();
  const { theme } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [dprFloor, setDprFloor] = useState(false);
  const [inView, setInView] = useState(true);
  const onModelReady = useCallback(() => setModelLoading(false), []);
  const isLight = theme === "light";
  const sceneBg = useMemo(
    () => (isLight ? "#f7f7f8" : "#080808"),
    [isLight]
  );
  const spinning = !reducedMotion && inView;
  const dpr = lite || dprFloor ? 1 : 1.25;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.05),
      { threshold: [0, 0.05, 0.2] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="relative h-full w-full">
      {modelLoading ? (
        <ModelLoadingOverlay
          className="absolute inset-0 z-[1]"
          label="กำลังโหลดโมเดล…"
        />
      ) : null}
      <Canvas
        className="h-full w-full"
        camera={{ position: HERO_CAM.position, fov: HERO_CAM.fov }}
        dpr={dpr}
        frameloop={spinning ? "always" : "demand"}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        gl={{
          antialias: !lite,
          alpha: false,
          powerPreference: lite ? "low-power" : "high-performance",
          stencil: false,
        }}
        style={{ background: sceneBg }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 0.92;
        }}
      >
        <HeroCameraRig />
        <PerformanceMonitor
          onIncline={() => setDprFloor(false)}
          onDecline={() => setDprFloor(true)}
        />
        <color attach="background" args={[sceneBg]} />
        {/* Lower ambient/hemisphere + stronger key/rim = more visible curvature, same asset weight. */}
        <hemisphereLight
          args={[
            isLight ? "#f4f4f5" : "#3a3a40",
            isLight ? "#d4d4d8" : "#0a0a0a",
            lite ? (isLight ? 0.5 : 0.34) : isLight ? 0.42 : 0.28,
          ]}
        />
        <ambientLight
          intensity={lite ? (isLight ? 0.48 : 0.36) : isLight ? 0.4 : 0.3}
        />
        <directionalLight
          position={[4.2, 6.5, 2.4]}
          intensity={lite ? (isLight ? 1.4 : 1.2) : isLight ? 1.3 : 1.1}
        />
        {/* Moved behind the model (was beside it) + cool tint — reads as a rim light against the dark backdrop. */}
        <directionalLight
          position={[-3.5, 2.2, -3.2]}
          intensity={lite ? (isLight ? 0.42 : 0.48) : isLight ? 0.36 : 0.42}
          color={isLight ? "#ffffff" : "#dfe6ff"}
        />
        <pointLight
          position={[-2.2, 1.2, 2.4]}
          intensity={lite ? (isLight ? 0.4 : 0.35) : isLight ? 0.45 : 0.4}
          color="#E53935"
        />
        {!lite ? (
          <Suspense fallback={null}>
            <Environment
              preset="city"
              environmentIntensity={isLight ? 0.56 : 0.48}
            />
          </Suspense>
        ) : null}
        <Suspense fallback={null}>
          <group position={HERO_MODEL_POSITION} scale={HERO_MODEL_SCALE}>
            <VapeModel
              exploded={false}
              showHotspots={false}
              castShadows={false}
              autoSpin={spinning}
              lite={lite}
            />
          </group>
          <ReadyAndPaint onReady={onModelReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
