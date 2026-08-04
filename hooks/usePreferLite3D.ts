"use client";

import { useEffect, useState } from "react";

/**
 * Prefer a lighter WebGL path on phones and low-end devices.
 * Defaults to lite until we can measure, so first paint stays cheap.
 */
export function usePreferLite3D() {
  const [lite, setLite] = useState(true);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    const memory = (
      navigator as Navigator & { deviceMemory?: number }
    ).deviceMemory;
    const lowEnd = cores <= 4 || (memory !== undefined && memory <= 4);
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    setLite(Boolean(narrow || lowEnd || saveData));
  }, []);

  return lite;
}
