export const ROUTE_PROGRESS_EVENT = "aov:route-progress-start";

/** Signal that a client-side route transition is starting (Link clicks dispatch this too). */
export function startRouteProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_PROGRESS_EVENT));
}
