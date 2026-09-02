"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { hotspots } from "@/data/hotspots";

interface AnatomyHotspotDeepLinkProps {
  ready: boolean;
  hydrated: boolean;
  onDeepLink: (hotspotId: string) => void;
}

/**
 * Opens a hotspot from `?hotspot=` once, then strips the query so refresh /
 * back-navigation does not auto-reopen the detail sheet.
 */
export function AnatomyHotspotDeepLink({
  ready,
  hydrated,
  onDeepLink,
}: AnatomyHotspotDeepLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hotspotParam = searchParams.get("hotspot");
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !ready || !hotspotParam) return;
    if (lastAppliedRef.current === hotspotParam) return;
    if (!hotspots.some((hotspot) => hotspot.id === hotspotParam)) return;

    lastAppliedRef.current = hotspotParam;
    onDeepLink(hotspotParam);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("hotspot");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    hydrated,
    ready,
    hotspotParam,
    onDeepLink,
    pathname,
    router,
    searchParams,
  ]);

  return null;
}
