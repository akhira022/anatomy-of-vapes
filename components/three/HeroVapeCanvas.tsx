"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { VapeModel } from "@/components/three/VapeModel";
import { usePreferLite3D } from "@/hooks/usePreferLite3D";

interface HeroVapeCanvasProps {
  reducedMotion?: boolean;
}

export function HeroVapeCanvas({ reducedMotion = false }: HeroVapeCanvasProps) {
  const lite = usePreferLite3D();

  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [1.1, 0.35, 3.6], fov: 38 }}
      dpr={lite ? [1, 1.15] : [1, 1.5]}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#080808"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 2]} intensity={1.15} />
      <pointLight position={[-2, 1, 2]} intensity={0.45} color="#E53935" />
      <Suspense fallback={null}>
        <group position={[0, -0.15, 0]} scale={1.05}>
          <VapeModel
            exploded={false}
            showHotspots={false}
            castShadows={false}
            autoSpin={!reducedMotion}
          />
        </group>
      </Suspense>
    </Canvas>
  );
}
