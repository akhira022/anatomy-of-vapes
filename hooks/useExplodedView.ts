"use client";

import { useState } from "react";

/** Toggle exploded state for the 3D viewer */
export function useExplodedView(initial = false) {
  const [exploded, setExploded] = useState(initial);
  return {
    exploded,
    setExploded,
    toggle: () => setExploded((v) => !v),
  };
}
