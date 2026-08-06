"use client";

import { useEffect } from "react";

interface ModelReadySignalProps {
  onReady: () => void;
}

/** Render inside Suspense after GLB content — fires once models are mounted. */
export function ModelReadySignal({ onReady }: ModelReadySignalProps) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}
