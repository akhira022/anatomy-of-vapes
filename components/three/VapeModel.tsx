"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { invalidate, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { Group, Material, Mesh, Object3D, Texture } from "three";
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
  /** Soften PBR maps on phones (keeps baseColor + emissiveMap). */
  lite?: boolean;
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
  mouthpiece: 0.58,
  coilTank: 0,
  battery: -0.58,
} as const;

type PartKey = keyof typeof HEIGHT_FACTOR;

type PartMetrics = {
  root: Object3D;
  height: number;
  diameter: number;
};

/** Bounds only — no clone (layout math must stay cheap). */
function measureScene(scene: Object3D) {
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  box.getSize(size);
  return {
    height: Math.max(size.y, 0.001),
    diameter: Math.max(size.x, size.z, 0.001),
  };
}

function asMaterials(material: Material | Material[]): Material[] {
  return Array.isArray(material) ? material : [material];
}

type TunableMaterial = Material & {
  map?: Texture | null;
  normalMap?: Texture | null;
  emissiveMap?: Texture | null;
  metalnessMap?: Texture | null;
  roughnessMap?: Texture | null;
  aoMap?: Texture | null;
  envMapIntensity?: number;
  metalness?: number;
  roughness?: number;
  emissiveIntensity?: number;
  emissive?: { r: number; g: number; b: number; setRGB: (r: number, g: number, b: number) => void };
  needsUpdate?: boolean;
};

function isNearWhiteEmissive(m: TunableMaterial) {
  const e = m.emissive;
  if (!e) return false;
  return e.r > 0.9 && e.g > 0.9 && e.b > 0.9;
}

/** Clone materials so lite tuning never mutates the shared GLTF cache. */
function cloneMeshMaterials(root: Object3D) {
  root.traverse((obj: Object3D) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();
  });
}

/**
 * Meshy GLBs ship emissiveFactor=[1,1,1] + emissiveMap.
 * Stripping the map (or a failed decode) leaves full-white emissive → glowing white mesh.
 * Always keep map+emissive paired, and tone down the factor on every device.
 */
function tuneMaterials(root: Object3D, castShadows: boolean, lite: boolean) {
  root.traverse((obj: Object3D) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = castShadows;
    mesh.receiveShadow = castShadows;
    mesh.frustumCulled = true;

    for (const mat of asMaterials(mesh.material)) {
      const m = mat as TunableMaterial;

      // Keep normal + roughness maps even on lite — stripping them makes
      // Meshy meshes look faceted/"broken". Textures are already decoded.
      if (lite) {
        if (m.metalnessMap) m.metalnessMap = null;
        if (m.aoMap) m.aoMap = null;
        if (typeof m.envMapIntensity === "number") m.envMapIntensity = 0.22;
      }

      for (const tex of [m.map, m.normalMap, m.roughnessMap, m.emissiveMap]) {
        if (!tex) continue;
        if (tex.anisotropy < 8) tex.anisotropy = 8;
      }

      // Critical: never leave white emissive without a working map.
      // Meshy ships emissiveFactor=[1,1,1]; a missing/failed map → solid white.
      const emissiveMapOk =
        Boolean(m.emissiveMap?.image) &&
        Boolean(
          (m.emissiveMap?.image as { width?: number } | undefined)?.width
        );

      if (m.emissive) {
        if (!emissiveMapOk) {
          m.emissiveMap = null;
          m.emissive.setRGB(0, 0, 0);
          if (typeof m.emissiveIntensity === "number") m.emissiveIntensity = 0;
        } else if (isNearWhiteEmissive(m)) {
          // Soften Meshy's full-white factor — washes out on many mobile GPUs.
          m.emissive.setRGB(0.35, 0.35, 0.35);
          if (typeof m.emissiveIntensity === "number") {
            m.emissiveIntensity = lite ? 0.55 : 0.7;
          }
        }
      }

      m.needsUpdate = true;
    }
  });
}

function prepareScene(
  scene: Object3D,
  castShadows: boolean,
  lite: boolean
): PartMetrics {
  const root = scene.clone(true);
  cloneMeshMaterials(root);
  tuneMaterials(root, castShadows, lite);

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
  lite,
}: {
  path: string;
  scale: [number, number, number];
  targetY: number;
  castShadows: boolean;
  lite: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const settled = useRef(false);
  const mounted = useRef(false);
  const { scene } = useGLTF(path);

  const { root } = useMemo(
    () => prepareScene(scene, castShadows, lite),
    [scene, castShadows, lite]
  );

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (!mounted.current) {
      group.position.y = targetY;
      mounted.current = true;
      settled.current = true;
      invalidate();
      return;
    }
    settled.current = false;
    invalidate();
  }, [targetY]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || settled.current) return;
    const cur = group.position.y;
    const diff = targetY - cur;
    if (Math.abs(diff) < 0.0004) {
      group.position.y = targetY;
      settled.current = true;
      return;
    }
    group.position.y += diff * Math.min(1, delta * 5);
    invalidate();
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
  lite = false,
}: VapeModelProps) {
  const rootRef = useRef<Group>(null);

  const mouth = useGLTF(MODEL_PATHS.mouthpiece);
  const coil = useGLTF(MODEL_PATHS.coilTank);
  const batt = useGLTF(MODEL_PATHS.battery);

  const layout = useMemo(() => {
    const mouthM = measureScene(mouth.scene);
    const coilM = measureScene(coil.scene);
    const battM = measureScene(batt.scene);

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
    invalidate();
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
        lite={lite}
      />
      <PartModel
        path={MODEL_PATHS.coilTank}
        scale={layout.coilTank.scale}
        targetY={yOf("coilTank")}
        castShadows={castShadows}
        lite={lite}
      />
      <PartModel
        path={MODEL_PATHS.battery}
        scale={layout.battery.scale}
        targetY={yOf("battery")}
        castShadows={castShadows}
        lite={lite}
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
                animatePulse={!lite}
              />
            );
          })
        : null}
    </group>
  );
}

/** Call from pretest/anatomy — avoid loading ~13MB GLBs on the homepage. */
export function preloadVapeModels() {
  useGLTF.preload(MODEL_PATHS.mouthpiece);
  useGLTF.preload(MODEL_PATHS.coilTank);
  useGLTF.preload(MODEL_PATHS.battery);
}

export const VAPE_MODEL_URLS = Object.values(MODEL_PATHS);
