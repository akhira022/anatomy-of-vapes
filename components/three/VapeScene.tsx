"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { VapeModel } from "@/components/three/VapeModel";
import {
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Split,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";
import { useSceneFullscreen } from "@/hooks/useSceneFullscreen";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import type { HotspotContent } from "@/data/hotspots";
import { ModelLoadingOverlay } from "@/components/feedback/ModelLoadingOverlay";
import {
  AnatomyTutorialOverlay,
  HINT_STORAGE_KEY,
} from "@/components/three/AnatomyTutorialOverlay";
import { ModelReadySignal } from "@/components/three/ModelReadySignal";

const IDLE_RESUME_MS = 2500;

interface OrbitControlsHandle {
  reset: () => void;
  update: () => void;
  object: { position: { multiplyScalar: (s: number) => void } };
}

interface VapeSceneProps {
  exploded: boolean;
  onExplodedChange?: (exploded: boolean) => void;
  visitedHotspots: string[];
  selectedHotspotId: string | null;
  onHotspotClick: (id: string) => void;
  hotspotItems: HotspotContent[];
  nextHotspotId?: string | null;
  onNextHotspot?: () => void;
  /** Pause idle auto-rotate while detail popup is open. */
  popupOpen?: boolean;
}

/** Keeps demand-mode canvas painting while explode lerp / camera settle. */
function InvalidateOnChange({
  exploded,
  selectedHotspotId,
}: {
  exploded: boolean;
  selectedHotspotId: string | null;
}) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [exploded, selectedHotspotId, invalidate]);
  return null;
}

/** Demand-mode needs continuous invalidate while OrbitControls.autoRotate runs. */
function InvalidateWhileAutoRotate({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => {
    if (active) invalidate();
  });
  return null;
}

export function VapeScene({
  exploded,
  onExplodedChange,
  visitedHotspots,
  selectedHotspotId,
  onHotspotClick,
  hotspotItems,
  nextHotspotId,
  onNextHotspot,
  popupOpen = false,
}: VapeSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const invalidateRef = useRef<() => void>(() => {});
  const idleTimerRef = useRef<number | null>(null);
  const { isFullscreen, cssFullscreen, toggle: toggleFullscreen, enter } =
    useSceneFullscreen(rootRef);
  const [showHint, setShowHint] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [userInteracting, setUserInteracting] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.25]);
  const onModelReady = useCallback(() => setModelLoading(false), []);
  const reduceMotion = useReducedMotion();
  const lite = usePreferLite3D();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const sceneBg = useMemo(
    () => (isLight ? "#ececee" : "#0c0c0c"),
    [isLight]
  );
  const groundColor = isLight ? "#d8d8de" : "#050505";

  const visitedCount = visitedHotspots.length;
  const hotspotTotal = hotspotItems.length;
  const remainingCount = Math.max(0, hotspotTotal - visitedCount);
  const nextLabel =
    hotspotItems.find((h) => h.id === nextHotspotId)?.label ?? null;

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const pauseAutoRotate = useCallback(() => {
    setUserInteracting(true);
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      setUserInteracting(false);
      idleTimerRef.current = null;
    }, IDLE_RESUME_MS);
  }, [clearIdleTimer]);

  const autoRotate =
    !reduceMotion &&
    !modelLoading &&
    !showHint &&
    !popupOpen &&
    !userInteracting;

  useEffect(() => {
    setDpr(lite ? [1, 1.25] : [1, 1.75]);
  }, [lite]);

  useEffect(() => {
    // CSS/native fullscreen changes layout — force canvas resize + paint.
    window.dispatchEvent(new Event("resize"));
    invalidateRef.current();
  }, [isFullscreen, cssFullscreen]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HINT_STORAGE_KEY) !== "1") {
        setShowHint(true);
      }
    } catch {
      setShowHint(true);
    }
  }, []);

  useEffect(() => {
    return () => clearIdleTimer();
  }, [clearIdleTimer]);

  const dismissHint = () => {
    setShowHint(false);
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
  };

  const resetCamera = () => {
    pauseAutoRotate();
    controlsRef.current?.reset();
    invalidateRef.current();
  };

  const zoomBy = (delta: number) => {
    pauseAutoRotate();
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.multiplyScalar(1 + delta);
    controls.update();
    invalidateRef.current();
  };

  const controlBtn =
    "pointer-events-auto flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card/95 text-textPrimary shadow-card backdrop-blur-sm transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-lg border border-border bg-surface",
        cssFullscreen &&
          "fixed inset-0 z-[100] h-[100dvh] max-h-[100dvh] w-[100vw] rounded-none border-0"
      )}
    >
      {modelLoading ? (
        <ModelLoadingOverlay className="absolute inset-0 z-[5]" />
      ) : null}

      <div className="absolute inset-0">
        <Canvas
          className="touch-none"
          style={{ width: "100%", height: "100%", display: "block" }}
          camera={{ position: [0, 0.2, 4.2], fov: 42 }}
          dpr={dpr}
          frameloop="demand"
          performance={{ min: 0.5, max: 1, debounce: 200 }}
          gl={{
            antialias: true,
            powerPreference: lite ? "low-power" : "high-performance",
            stencil: false,
            depth: true,
          }}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          onCreated={({ gl, invalidate }) => {
            invalidateRef.current = invalidate;
            gl.toneMappingExposure = 0.92;
            gl.domElement.style.width = "100%";
            gl.domElement.style.height = "100%";
            gl.domElement.style.display = "block";
            // First paint before Suspense finishes + after layout.
            invalidate();
          }}
        >
          <PerformanceMonitor
            onIncline={() =>
              setDpr((prev) => {
                const next: [number, number] = lite ? [1, 1.35] : [1, 1.75];
                return prev[1] === next[1] ? prev : next;
              })
            }
            onDecline={() =>
              setDpr((prev) => (prev[1] === 1 ? prev : [1, 1]))
            }
          />
          <InvalidateOnChange
            exploded={exploded}
            selectedHotspotId={selectedHotspotId}
          />
          <InvalidateWhileAutoRotate active={autoRotate} />
          <color attach="background" args={[sceneBg]} />
          {/* Lower ambient + stronger key = shading gradient reads the curvature. */}
          <ambientLight
            intensity={lite ? (isLight ? 0.42 : 0.3) : isLight ? 0.34 : 0.24}
          />
          <directionalLight
            position={[3.6, 5.6, 2.6]}
            intensity={lite ? (isLight ? 1.3 : 1.1) : isLight ? 1.2 : 1}
            castShadow={!lite}
          />
          {/* Cool rim light from behind separates the silhouette from the dark backdrop — no shadow map, near-zero cost. */}
          <directionalLight
            position={[-3.2, 1.8, -3.4]}
            intensity={lite ? (isLight ? 0.32 : 0.42) : isLight ? 0.28 : 0.36}
            color={isLight ? "#ffffff" : "#dfe6ff"}
          />
          <Suspense fallback={null}>
            <VapeModel
              exploded={exploded}
              visitedHotspots={visitedHotspots}
              selectedHotspotId={selectedHotspotId}
              onHotspotClick={onHotspotClick}
              castShadows={!lite}
              lite={lite}
            />
            <ModelReadySignal onReady={onModelReady} />
            <Environment
              preset="city"
              environmentIntensity={
                lite
                  ? isLight
                    ? 0.32
                    : 0.26
                  : isLight
                    ? 0.48
                    : 0.4
              }
            />
            {!lite ? (
              <ContactShadows
                position={[0, -1.6, 0]}
                opacity={isLight ? 0.34 : 0.5}
                scale={8}
                blur={2}
                frames={1}
              />
            ) : (
              <>
                <mesh
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, -1.55, 0]}
                  receiveShadow={false}
                >
                  <circleGeometry args={[2.2, 16]} />
                  <meshBasicMaterial
                    color={groundColor}
                    transparent
                    opacity={isLight ? 0.42 : 0.58}
                  />
                </mesh>
                {/* Tighter, darker core under the model — cheap fake contact shadow for the no-Environment path. */}
                <mesh
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, -1.548, 0]}
                  receiveShadow={false}
                >
                  <circleGeometry args={[0.85, 16]} />
                  <meshBasicMaterial
                    color={groundColor}
                    transparent
                    opacity={isLight ? 0.24 : 0.3}
                  />
                </mesh>
              </>
            )}
          </Suspense>
          <OrbitControls
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={controlsRef as any}
            enablePan={false}
            enableDamping={!lite}
            dampingFactor={0.08}
            minDistance={2.4}
            maxDistance={7}
            maxPolarAngle={Math.PI * 0.85}
            rotateSpeed={lite ? 0.85 : 1}
            zoomSpeed={lite ? 0.85 : 1}
            autoRotate={autoRotate}
            autoRotateSpeed={0.55}
            onStart={pauseAutoRotate}
          />
        </Canvas>
      </div>

      <AnatomyTutorialOverlay
        open={showHint}
        onDismiss={dismissHint}
        onEnterFullscreen={() => {
          void enter();
        }}
      />

      {!showHint && isFullscreen ? (
        <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 max-w-[min(16rem,calc(100%-5.5rem))] rounded-xl border border-border bg-card/95 px-3.5 py-2.5 text-sm text-textPrimary shadow-card backdrop-blur-sm">
          <p className="font-medium">
            สำรวจแล้ว {visitedCount}/{hotspotTotal}
          </p>
          <p className="mt-0.5 text-xs text-textSecondary">
            {exploded ? "โหมดแยกชิ้นส่วน" : "โหมดทั้งชิ้น"}
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute z-10 flex flex-col gap-2",
          isFullscreen
            ? "top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))]"
            : "top-3 left-2 sm:left-3"
        )}
      >
        {onExplodedChange ? (
          <button
            type="button"
            title={exploded ? "รวมชิ้นส่วน" : "แยกชิ้นส่วน"}
            aria-label={exploded ? "รวมชิ้นส่วน" : "แยกชิ้นส่วน"}
            aria-pressed={exploded}
            className={cn(
              controlBtn,
              exploded &&
                "border-primary bg-primary text-white hover:bg-primaryHover"
            )}
            onClick={() => {
              pauseAutoRotate();
              onExplodedChange(!exploded);
            }}
          >
            <Split className="size-4" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          title="ซูมเข้า"
          aria-label="ซูมเข้า"
          className={controlBtn}
          onClick={() => zoomBy(-0.12)}
        >
          <ZoomIn className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="ซูมออก"
          aria-label="ซูมออก"
          className={controlBtn}
          onClick={() => zoomBy(0.12)}
        >
          <ZoomOut className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="รีเซ็ตมุมมอง"
          aria-label="รีเซ็ตมุมมอง"
          className={controlBtn}
          onClick={resetCamera}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          className={controlBtn}
          onClick={() => {
            pauseAutoRotate();
            void toggleFullscreen();
          }}
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {isFullscreen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-16 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-none mx-auto flex w-full max-w-3xl flex-col items-stretch gap-2.5 px-3 sm:px-4">
            {onNextHotspot && nextHotspotId ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  className="pointer-events-auto h-11 rounded-xl px-6 font-semibold shadow-glowRed"
                  onClick={onNextHotspot}
                >
                  สำรวจต่อ{nextLabel ? `: ${nextLabel}` : ""}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : null}

            <div
              role="list"
              aria-label="จุดสารพิษ"
              className="pointer-events-auto flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center sm:flex-wrap sm:overflow-visible"
            >
              {hotspotItems.map((item) => {
                const visited = visitedHotspots.includes(item.id);
                const isSelected = selectedHotspotId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="listitem"
                    onClick={() => onHotspotClick(item.id)}
                    className={cn(
                      "flex min-h-11 min-w-[7.25rem] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors duration-normal",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : visited
                          ? "border-success/50 bg-card/95 text-textPrimary"
                          : "border-border bg-card/95 text-textPrimary"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        isSelected
                          ? "border-white/40 bg-white/20"
                          : visited
                            ? "border-success bg-success text-white"
                            : "border-primary bg-primary/20 text-primary"
                      )}
                      aria-hidden="true"
                    >
                      {visited && !isSelected ? (
                        <Check className="size-3 stroke-[3]" />
                      ) : null}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {remainingCount > 0 ? (
              <p className="text-center text-xs text-textSecondary">
                สำรวจต่อได้อีก {remainingCount} จุด
              </p>
            ) : (
              <p className="text-center text-xs font-medium text-success">
                สำรวจครบแล้ว
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
