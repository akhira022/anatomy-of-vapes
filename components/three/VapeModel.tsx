"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group, Object3D } from "three";
import { Box3, Vector3 } from "three";
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

const MODEL_PATHS = {
  mouthpiece: "/models/mouthpiece.glb",
  coilTank: "/models/coilTank.glb",
  battery: "/models/battery.glb",
} as const;

/** Match outer diameters across parts; tweak height per piece. */
const TARGET_DIAMETER = 0.92;
const HEIGHT_FACTOR = {
  mouthpiece: 0.62,
  coilTank: 0.9,
  battery: 1,
} as const;

/** Extra gap only when exploded. */
const EXPLODE_GAP = {
  mouthpiece: 0.42,
  coilTank: 0,
  battery: -0.42,
} as const;

type PartKey = keyof typeof HEIGHT_FACTOR;

type PartMetrics = {
  root: Object3D;
  height: number;
  diameter: number;
};

function prepareScene(scene: Object3D, castShadows: boolean): PartMetrics {
  const root = scene.clone(true);
  root.traverse((obj: Object3D) => {
    const mesh = obj as Object3D & {
      isMesh?: boolean;
      castShadow?: boolean;
      receiveShadow?: boolean;
    };
    if (mesh.isMesh) {
      mesh.castShadow = castShadows;
      mesh.receiveShadow = castShadows;
    }
  });

  const box = new Box3().setFromObject(root);
  const center = new Vector3();
  const size = new Vector3();
  box.getCenter(center);
  box.getSize(size);
  root.position.sub(center);

  return {
    root,
    height: Math.max(size.y, 0.001),
    diameter: Math.max(size.x, size.z, 0.001),
  };
}

function scalesFor(part: PartKey, diameter: number, height: number) {
  const sx = TARGET_DIAMETER / diameter;
  const sy = sx * HEIGHT_FACTOR[part];
  return {
    scale: [sx, sy, sx] as [number, number, number],
    scaledHeight: height * sy,
  };
}

function PartModel({
  path,
  scale,
  targetY,
  castShadows,
}: {
  path: string;
  scale: [number, number, number];
  targetY: number;
  castShadows: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(path);

  const { root } = useMemo(
    () => prepareScene(scene, castShadows),
    [scene, castShadows]
  );

  useLayoutEffect(() => {
    if (groupRef.current) groupRef.current.position.y = targetY;
  }, [targetY]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * Math.min(1, delta * 4);
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={root} />
    </group>
  );
}

/**
 * Three-part Meshy GLB stack: assembled = flush; exploded = separated.
 * XZ scales match diameters; Y uses HEIGHT_FACTOR for silhouette.
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

  const mouth = useGLTF(MODEL_PATHS.mouthpiece);
  const coil = useGLTF(MODEL_PATHS.coilTank);
  const batt = useGLTF(MODEL_PATHS.battery);

  const layout = useMemo(() => {
    const mouthM = prepareScene(mouth.scene, false);
    const coilM = prepareScene(coil.scene, false);
    const battM = prepareScene(batt.scene, false);

    const mouthS = scalesFor("mouthpiece", mouthM.diameter, mouthM.height);
    const coilS = scalesFor("coilTank", coilM.diameter, coilM.height);
    const battS = scalesFor("battery", battM.diameter, battM.height);

    const total =
      mouthS.scaledHeight + coilS.scaledHeight + battS.scaledHeight;
    const bottom = -total / 2;

    const batteryY = bottom + battS.scaledHeight / 2;
    const coilTankY = bottom + battS.scaledHeight + coilS.scaledHeight / 2;
    const mouthpieceY =
      bottom +
      battS.scaledHeight +
      coilS.scaledHeight +
      mouthS.scaledHeight / 2;

    return {
      mouthpiece: {
        scale: mouthS.scale,
        assembledY: mouthpieceY,
        explodedY: mouthpieceY + EXPLODE_GAP.mouthpiece,
      },
      coilTank: {
        scale: coilS.scale,
        assembledY: coilTankY,
        explodedY: coilTankY + EXPLODE_GAP.coilTank,
      },
      battery: {
        scale: battS.scale,
        assembledY: batteryY,
        explodedY: batteryY + EXPLODE_GAP.battery,
      },
    };
  }, [mouth.scene, coil.scene, batt.scene]);

  useFrame((_, delta) => {
    if (!autoSpin || !rootRef.current) return;
    rootRef.current.rotation.y += delta * 0.35;
  });

  const yOf = (part: PartKey) =>
    exploded ? layout[part].explodedY : layout[part].assembledY;

  return (
    <group ref={rootRef}>
      <PartModel
        path={MODEL_PATHS.mouthpiece}
        scale={layout.mouthpiece.scale}
        targetY={yOf("mouthpiece")}
        castShadows={castShadows}
      />
      <PartModel
        path={MODEL_PATHS.coilTank}
        scale={layout.coilTank.scale}
        targetY={yOf("coilTank")}
        castShadows={castShadows}
      />
      <PartModel
        path={MODEL_PATHS.battery}
        scale={layout.battery.scale}
        targetY={yOf("battery")}
        castShadows={castShadows}
      />

      {showHotspots && onHotspotClick
        ? hotspots.map((hs) => {
            const part = (hs.meshName ?? "coilTank") as PartKey;
            return (
              <HotspotMarker
                key={hs.id}
                id={hs.id}
                label={hs.label}
                position={[
                  hs.position.x,
                  yOf(part) + hs.position.y,
                  hs.position.z,
                ]}
                visited={visitedHotspots.includes(hs.id)}
                selected={selectedHotspotId === hs.id}
                onClick={onHotspotClick}
              />
            );
          })
        : null}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.mouthpiece);
useGLTF.preload(MODEL_PATHS.coilTank);
useGLTF.preload(MODEL_PATHS.battery);
