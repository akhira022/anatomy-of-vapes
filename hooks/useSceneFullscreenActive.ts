"use client";

import { useEffect, useState } from "react";
import {
  SCENE_FULLSCREEN_EVENT,
  getSceneFullscreenRoot,
} from "@/lib/scene-fullscreen";

/** True when the 3D scene is in native or CSS fullscreen. */
export function useSceneFullscreenActive() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(Boolean(getSceneFullscreenRoot()));
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    document.addEventListener(SCENE_FULLSCREEN_EVENT, sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      document.removeEventListener(SCENE_FULLSCREEN_EVENT, sync);
    };
  }, []);

  return active;
}
