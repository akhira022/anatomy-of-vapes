"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import {
  SCENE_FULLSCREEN_ATTR,
  SCENE_FULLSCREEN_EVENT,
  canNativeFullscreen,
  dispatchSceneFullscreenChange,
  exitNativeFullscreen,
  getNativeFullscreenElement,
  requestNativeFullscreen,
} from "@/lib/scene-fullscreen";

/**
 * Fullscreen for the 3D scene: native API when available, CSS fixed overlay on iOS.
 */
export function useSceneFullscreen(rootRef: RefObject<HTMLElement | null>) {
  const [cssFullscreen, setCssFullscreen] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);

  const isFullscreen = cssFullscreen || nativeFullscreen;

  const syncNative = useCallback(() => {
    const el = rootRef.current;
    setNativeFullscreen(Boolean(el && getNativeFullscreenElement() === el));
    dispatchSceneFullscreenChange();
  }, [rootRef]);

  useEffect(() => {
    document.addEventListener("fullscreenchange", syncNative);
    document.addEventListener("webkitfullscreenchange", syncNative);
    syncNative();
    return () => {
      document.removeEventListener("fullscreenchange", syncNative);
      document.removeEventListener("webkitfullscreenchange", syncNative);
    };
  }, [syncNative]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (cssFullscreen) {
      el.setAttribute(SCENE_FULLSCREEN_ATTR, "true");
    } else {
      el.removeAttribute(SCENE_FULLSCREEN_ATTR);
    }
    dispatchSceneFullscreenChange();
  }, [cssFullscreen, rootRef]);

  useEffect(() => {
    if (!cssFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCssFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [cssFullscreen]);

  const enter = useCallback(async () => {
    const el = rootRef.current;
    if (!el || isFullscreen) return;

    if (canNativeFullscreen(el)) {
      try {
        await requestNativeFullscreen(el);
        return;
      } catch {
        /* fall through to CSS */
      }
    }
    setCssFullscreen(true);
  }, [isFullscreen, rootRef]);

  const exit = useCallback(async () => {
    if (getNativeFullscreenElement()) {
      try {
        await exitNativeFullscreen();
      } catch {
        /* ignore */
      }
    }
    setCssFullscreen(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isFullscreen) await exit();
    else await enter();
  }, [enter, exit, isFullscreen]);

  return {
    isFullscreen,
    cssFullscreen,
    enter,
    exit,
    toggle,
  };
}

export { SCENE_FULLSCREEN_EVENT };
