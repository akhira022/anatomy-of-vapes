"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerformanceMonitor,
} from "@react-three/drei";
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

export function VapeScene({
  exploded,
  onExplodedChange,
  visitedHotspots,
  selectedHotspotId,
  onHotspotClick,
  hotspotItems,
  nextHotspotId,
  onNextHotspot,
}: VapeSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const invalidateRef = useRef<() => void>(() => {});
  const { isFullscreen, cssFullscreen, toggle: toggleFullscreen, enter } =
    useSceneFullscreen(rootRef);
  const [showHint, setShowHint] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.25]);
  const onModelReady = useCallback(() => setModelLoading(false), []);
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

  useEffect(() => {
    setDpr(lite ? [1, 1] : [1, 1.5]);
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

  const dismissHint = () => {
    setShowHint(false);
    try {
      window.localStorage.setItem(HINT_STORAGE_KEY, "1");
    } catch {
      /* ignore quota / private mode */
    }
  };

  const resetCamera = () => {
    controlsRef.current?.reset();
    invalidateRef.current();
  };

  const zoomBy = (delta: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.multiplyScalar(1 + delta);
    controls.update();
    invalidateRef.current();
  };

  const controlBtn =
    "pointer-events-auto size-11 rounded-xl border border-border bg-card/90";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-2xl border border-border bg-surface",
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
            antialias: !lite,
            powerPreference: lite ? "low-power" : "high-performance",
            stencil: false,
            depth: true,
          }}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          onCreated={({ gl, invalidate }) => {
            invalidateRef.current = invalidate;
            gl.domElement.style.width = "100%";
            gl.domElement.style.height = "100%";
            gl.domElement.style.display = "block";
          }}
        >
          <PerformanceMonitor
            onIncline={() =>
              setDpr((prev) => {
                const next: [number, number] = lite ? [1, 1.15] : [1, 1.5];
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
          <color attach="background" args={[sceneBg]} />
          <ambientLight
            intensity={lite ? (isLight ? 0.95 : 0.75) : isLight ? 0.8 : 0.55}
          />
          <directionalLight
            position={[4, 6, 2]}
            intensity={lite ? (isLight ? 1.4 : 1.25) : isLight ? 1.3 : 1.1}
            castShadow={!lite}
          />
          <Suspense fallback={null}>
            <VapeModel
              exploded={exploded}
              visitedHotspots={visitedHotspots}
              selectedHotspotId={selectedHotspotId}
              onHotspotClick={onHotspotClick}
              castShadows={!lite}
            />
            <ModelReadySignal onReady={onModelReady} />
            {!lite ? <Environment preset="city" /> : null}
            {!lite ? (
              <ContactShadows
                position={[0, -1.6, 0]}
                opacity={isLight ? 0.28 : 0.45}
                scale={8}
                blur={2.5}
              />
            ) : (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -1.55, 0]}
                receiveShadow={false}
              >
                <circleGeometry args={[2.2, 24]} />
                <meshBasicMaterial
                  color={groundColor}
                  transparent
                  opacity={isLight ? 0.4 : 0.55}
                />
              </mesh>
            )}
          </Suspense>
          <OrbitControls
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={controlsRef as any}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.4}
            maxDistance={7}
            maxPolarAngle={Math.PI * 0.85}
            rotateSpeed={lite ? 0.85 : 1}
            zoomSpeed={lite ? 0.85 : 1}
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
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-xl border border-border bg-card/90 px-3 py-2 text-sm text-textPrimary shadow-card">
          สำรวจแล้ว {visitedCount}/{hotspotTotal}
          <span className="mt-0.5 block text-xs text-textSecondary">
            {exploded ? "โหมดแยกชิ้นส่วน" : "โหมดทั้งชิ้น"}
          </span>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-y-3 right-3 z-10 flex flex-col gap-2">
        {onExplodedChange ? (
          <Button
            type="button"
            size="icon-lg"
            variant="secondary"
            aria-label={exploded ? "รวมชิ้นส่วน" : "แยกชิ้นส่วน"}
            aria-pressed={exploded}
            className={cn(
              controlBtn,
              exploded &&
                "border-primary bg-primary text-white hover:bg-primaryHover"
            )}
            onClick={() => onExplodedChange(!exploded)}
          >
            <Split className="size-5" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          aria-label="ซูมเข้า"
          className={controlBtn}
          onClick={() => zoomBy(-0.12)}
        >
          <ZoomIn className="size-5" />
        </Button>
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          aria-label="ซูมออก"
          className={controlBtn}
          onClick={() => zoomBy(0.12)}
        >
          <ZoomOut className="size-5" />
        </Button>
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          aria-label="รีเซ็ตมุมมอง"
          className={controlBtn}
          onClick={resetCamera}
        >
          <RotateCcw className="size-5" />
        </Button>
        <Button
          type="button"
          size="icon-lg"
          variant="secondary"
          aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}
          className={controlBtn}
          onClick={() => void toggleFullscreen()}
        >
          {isFullscreen ? (
            <Minimize2 className="size-5" />
          ) : (
            <Maximize2 className="size-5" />
          )}
        </Button>
      </div>

      {isFullscreen && onNextHotspot && nextHotspotId ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-[5.75rem] z-10 sm:bottom-[6.25rem]">
          <Button
            type="button"
            className="pointer-events-auto h-11 w-full rounded-2xl font-semibold shadow-glowRed sm:mx-auto sm:max-w-sm"
            onClick={onNextHotspot}
          >
            จุดถัดไป{nextLabel ? `: ${nextLabel}` : ""}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : null}

      {isFullscreen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background/95 via-background/80 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8">
          <div
            role="list"
            aria-label="จุดสารพิษ"
            className="pointer-events-auto flex gap-2 overflow-x-auto pb-1"
          >
            {hotspotItems.map((item) => {
              const visited = visitedHotspots.includes(item.id);
              const selected = selectedHotspotId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  onClick={() => onHotspotClick(item.id)}
                  className={cn(
                    "flex min-h-11 min-w-[7.5rem] shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-colors duration-normal",
                    selected
                      ? "border-primary bg-primary text-white"
                      : visited
                        ? "border-success/50 bg-card/95 text-textPrimary"
                        : "border-border bg-card/95 text-textPrimary"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-white/40 bg-white/20"
                        : visited
                          ? "border-success bg-success text-white"
                          : "border-primary bg-primary/20 text-primary"
                    )}
                    aria-hidden="true"
                  >
                    {visited && !selected ? (
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
            <p className="mt-2 text-center text-xs text-textSecondary">
              เหลืออีก {remainingCount} จุด
            </p>
          ) : (
            <p className="mt-2 text-center text-xs font-medium text-success">
              สำรวจครบแล้ว
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
