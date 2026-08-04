"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { VapeModel } from "@/components/three/VapeModel";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";

interface OrbitControlsHandle {
  reset: () => void;
  update: () => void;
  object: { position: { multiplyScalar: (s: number) => void } };
}

interface VapeSceneProps {
  exploded: boolean;
  visitedHotspots: string[];
  selectedHotspotId: string | null;
  onHotspotClick: (id: string) => void;
}

export function VapeScene({
  exploded,
  visitedHotspots,
  selectedHotspotId,
  onHotspotClick,
}: VapeSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const lite = usePreferLite3D();

  const resetCamera = () => {
    controlsRef.current?.reset();
  };

  const zoomBy = (delta: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.multiplyScalar(1 + delta);
    controls.update();
  };

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="absolute inset-0">
        <Canvas
          className="touch-none"
          style={{ width: "100%", height: "100%", display: "block" }}
          camera={{ position: [0, 0.2, 4.2], fov: 42 }}
          dpr={lite ? [1, 1.25] : [1, 1.75]}
          gl={{ antialias: !lite, powerPreference: "high-performance" }}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
          onCreated={({ gl }) => {
            gl.domElement.style.width = "100%";
            gl.domElement.style.height = "100%";
            gl.domElement.style.display = "block";
          }}
        >
          <color attach="background" args={["#0c0c0c"]} />
          <ambientLight intensity={lite ? 0.75 : 0.55} />
          <directionalLight
            position={[4, 6, 2]}
            intensity={lite ? 1.25 : 1.1}
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
            {!lite ? <Environment preset="city" /> : null}
            {!lite ? (
              <ContactShadows
                position={[0, -1.6, 0]}
                opacity={0.45}
                scale={8}
                blur={2.5}
              />
            ) : (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -1.55, 0]}
                receiveShadow={false}
              >
                <circleGeometry args={[2.2, 32]} />
                <meshBasicMaterial color="#050505" transparent opacity={0.55} />
              </mesh>
            )}
          </Suspense>
          <OrbitControls
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={controlsRef as any}
            enablePan={false}
            minDistance={2.4}
            maxDistance={7}
            maxPolarAngle={Math.PI * 0.85}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-y-3 right-3 z-10 flex flex-col gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="ซูมเข้า"
          className="pointer-events-auto rounded-xl border border-border bg-card/90"
          onClick={() => zoomBy(-0.12)}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="ซูมออก"
          className="pointer-events-auto rounded-xl border border-border bg-card/90"
          onClick={() => zoomBy(0.12)}
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="รีเซ็ตมุมมอง"
          className="pointer-events-auto rounded-xl border border-border bg-card/90"
          onClick={resetCamera}
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-label="เต็มจอ"
          className="pointer-events-auto rounded-xl border border-border bg-card/90"
          onClick={() => {
            const el = rootRef.current;
            if (!el) return;
            if (!document.fullscreenElement) {
              void el.requestFullscreen?.();
            } else {
              void document.exitFullscreen?.();
            }
          }}
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
