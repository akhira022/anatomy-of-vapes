"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import { VapeModel } from "@/components/three/VapeModel";
import { ModelReadySignal } from "@/components/three/ModelReadySignal";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";
import { useTheme } from "@/components/theme/ThemeProvider";

interface HeroVapeCanvasProps {
  reducedMotion?: boolean;
}

export function HeroVapeCanvas({ reducedMotion = false }: HeroVapeCanvasProps) {
  const lite = usePreferLite3D();
  const { theme } = useTheme();
  const [modelLoading, setModelLoading] = useState(true);
  const [dpr, setDpr] = useState(1);
  const onModelReady = useCallback(() => setModelLoading(false), []);
  const sceneBg = useMemo(
    () => (theme === "light" ? "#f7f7f8" : "#080808"),
    [theme]
  );
  const spinning = !reducedMotion;

  useEffect(() => {
    setDpr(lite ? 1 : 1.35);
  }, [lite]);

  return (
    <div className="relative h-full w-full">
      {modelLoading ? (
        <ModelLoadingOverlay
          className="absolute inset-0 z-[1]"
          label="กำลังโหลดโมเดล…"
        />
      ) : null}
      <Canvas
        className="h-full w-full"
        camera={{ position: [1.1, 0.35, 3.6], fov: 38 }}
        dpr={dpr}
        frameloop={spinning ? "always" : "demand"}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        gl={{
          antialias: !lite,
          alpha: true,
          powerPreference: lite ? "low-power" : "high-performance",
          stencil: false,
        }}
        style={{ background: "transparent" }}
      >
        <PerformanceMonitor
          onIncline={() =>
            setDpr((prev) => {
              const next = lite ? 1.1 : 1.35;
              return prev === next ? prev : next;
            })
          }
          onDecline={() => setDpr((prev) => (prev === 1 ? prev : 1))}
        />
        <color attach="background" args={[sceneBg]} />
        <ambientLight intensity={theme === "light" ? 0.95 : 0.7} />
        <directionalLight
          position={[3, 5, 2]}
          intensity={theme === "light" ? 1.35 : 1.15}
        />
        <pointLight position={[-2, 1, 2]} intensity={0.45} color="#E53935" />
        <Suspense fallback={null}>
          <group position={[0, -0.15, 0]} scale={1.05}>
            <VapeModel
              exploded={false}
              showHotspots={false}
              castShadows={false}
              autoSpin={spinning}
            />
          </group>
          <ModelReadySignal onReady={onModelReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
