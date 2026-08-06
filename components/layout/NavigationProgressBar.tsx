"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ROUTE_PROGRESS_EVENT } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<number | null>(null);
  const hideRef = useRef<number | null>(null);
  const skipPathnameRef = useRef(true);
  const activeRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (trickleRef.current != null) {
      window.clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (hideRef.current != null) {
      window.clearTimeout(hideRef.current);
      hideRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimers();
    activeRef.current = true;
    setVisible(true);
    setValue(14);
    trickleRef.current = window.setInterval(() => {
      setValue((current) => {
        if (current >= 88) return current;
        return Math.min(88, current + 6 + Math.random() * 10);
      });
    }, 350);
  }, [clearTimers]);

  const finish = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    setValue(100);
    hideRef.current = window.setTimeout(() => {
      setVisible(false);
      setValue(0);
    }, 320);
  }, [clearTimers]);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(ROUTE_PROGRESS_EVENT, onStart);
    return () => window.removeEventListener(ROUTE_PROGRESS_EVENT, onStart);
  }, [start]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      if (anchor.target === "_blank") return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname && url.search === window.location.search) {
        return;
      }

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, start]);

  useEffect(() => {
    if (skipPathnameRef.current) {
      skipPathnameRef.current = false;
      return;
    }
    finish();
  }, [pathname, finish]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="h-full bg-primary shadow-glowRed transition-[width] duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
