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
 * Landing hero framing — larger presence under the title stack,
 * with theme-aware lighting so dark metals read on light backgrounds too.
 */
const HERO_CAM = {
  position: [0.85, 0.06, 4.85] as [number, number, number],
  fov: 36,
  lookAt: [0, 0.04, 0] as [number, number, number],
};
const HERO_MODEL_SCALE = 0.38;
const HERO_MODEL_POSITION: [number, number, number] = [0, 0.1, 0];

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
    camera.position.set(...HERO_CAM.position);
    if ("fov" in camera) {
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
  const [dpr, setDpr] = useState(1);
  const [inView, setInView] = useState(true);
  const onModelReady = useCallback(() => setModelLoading(false), []);
  const isLight = theme === "light";
  const sceneBg = useMemo(
    () => (isLight ? "#f7f7f8" : "#080808"),
    [isLight]
  );
  const spinning = !reducedMotion && inView;

  useEffect(() => {
    setDpr(lite ? 1 : 1.25);
  }, [lite]);

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
      >
        <HeroCameraRig />
        <PerformanceMonitor
          onIncline={() =>
            setDpr((prev) => {
              const next = lite ? 1 : 1.25;
              return prev === next ? prev : next;
            })
          }
          onDecline={() => setDpr((prev) => (prev === 1 ? prev : 1))}
        />
        <color attach="background" args={[sceneBg]} />
        <hemisphereLight
          args={[
            isLight ? "#ffffff" : "#1a1a1c",
            isLight ? "#e8e8ea" : "#080808",
            lite ? (isLight ? 0.85 : 0.55) : isLight ? 0.65 : 0.4,
          ]}
        />
        <ambientLight
          intensity={lite ? (isLight ? 1.05 : 0.85) : isLight ? 0.9 : 0.6}
        />
        <directionalLight
          position={[4.2, 6.5, 2.4]}
          intensity={lite ? (isLight ? 1.75 : 1.45) : isLight ? 1.55 : 1.25}
        />
        <directionalLight
          position={[-3.5, 2.5, -1.5]}
          intensity={lite ? (isLight ? 0.55 : 0.4) : isLight ? 0.45 : 0.35}
        />
        <pointLight
          position={[-2.2, 1.2, 2.4]}
          intensity={lite ? (isLight ? 0.55 : 0.5) : isLight ? 0.6 : 0.55}
          color="#E53935"
        />
        {!lite ? (
          <Suspense fallback={null}>
            <Environment
              preset="city"
              environmentIntensity={isLight ? 0.9 : 0.7}
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
