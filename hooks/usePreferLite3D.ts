"use client";

import { useState } from "react";

function detectLite3D(): boolean {
  if (typeof window === "undefined") return false;

  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;
  const lowEnd = cores <= 4 || (memory !== undefined && memory <= 4);
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  const iOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mobileLike = narrow || coarse || iOS;

  // Desktop with few cores still gets full materials; phones always lite.
  return Boolean(mobileLike || saveData || (lowEnd && mobileLike));
}

/**
 * Prefer a lighter WebGL path on phones and low-end devices.
 * Defaults to full quality so first paint keeps textures (lite mutates a clone).
 */
export function usePreferLite3D() {
  const [lite] = useState(detectLite3D);
  return lite;
}
