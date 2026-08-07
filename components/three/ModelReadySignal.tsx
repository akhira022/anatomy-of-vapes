"use client";

import { useEffect } from "react";
import { invalidate } from "@react-three/fiber";

interface ModelReadySignalProps {
  onReady: () => void;
}

/** Render inside Suspense after GLB content — fires once models are mounted. */
export function ModelReadySignal({ onReady }: ModelReadySignalProps) {
  useEffect(() => {
    onReady();
    // Demand-mode canvases need an explicit paint after Suspense resolves.
    invalidate();
  }, [onReady]);

  return null;
}
