/** Custom event when CSS “fake” fullscreen toggles (iOS has no Fullscreen API for divs). */
export const SCENE_FULLSCREEN_EVENT = "aov:scene-fullscreen";

export const SCENE_FULLSCREEN_ATTR = "data-scene-fullscreen";

type FullscreenCapable = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type DocFullscreen = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

/** True when the browser can fullscreen a non-video element (false on iPhone Safari). */
export function canNativeFullscreen(el?: HTMLElement | null): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as DocFullscreen;
  if (!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) return false;
  if (!el) return true;
  const node = el as FullscreenCapable;
  return Boolean(node.requestFullscreen || node.webkitRequestFullscreen);
}

export function getNativeFullscreenElement(): Element | null {
  const doc = document as DocFullscreen;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export async function requestNativeFullscreen(el: HTMLElement): Promise<void> {
  const node = el as FullscreenCapable;
  if (node.requestFullscreen) {
    await node.requestFullscreen();
    return;
  }
  if (node.webkitRequestFullscreen) {
    await node.webkitRequestFullscreen();
  }
}

export async function exitNativeFullscreen(): Promise<void> {
  const doc = document as DocFullscreen;
  if (doc.fullscreenElement && doc.exitFullscreen) {
    await doc.exitFullscreen();
    return;
  }
  if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
  }
}

export function getSceneFullscreenRoot(): Element | null {
  if (typeof document === "undefined") return null;
  return (
    getNativeFullscreenElement() ??
    document.querySelector(`[${SCENE_FULLSCREEN_ATTR}="true"]`)
  );
}

export function dispatchSceneFullscreenChange(): void {
  document.dispatchEvent(new Event(SCENE_FULLSCREEN_EVENT));
}
