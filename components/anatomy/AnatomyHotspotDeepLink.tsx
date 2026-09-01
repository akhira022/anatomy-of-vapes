"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { hotspots } from "@/data/hotspots";

interface AnatomyHotspotDeepLinkProps {
  ready: boolean;
  hydrated: boolean;
  onDeepLink: (hotspotId: string) => void;
}

export function AnatomyHotspotDeepLink({
  ready,
  hydrated,
  onDeepLink,
}: AnatomyHotspotDeepLinkProps) {
  const searchParams = useSearchParams();
  const hotspotParam = searchParams.get("hotspot");
  const lastAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated || !ready || !hotspotParam) return;
    if (lastAppliedRef.current === hotspotParam) return;
    if (!hotspots.some((hotspot) => hotspot.id === hotspotParam)) return;

    lastAppliedRef.current = hotspotParam;
    onDeepLink(hotspotParam);
  }, [hydrated, ready, hotspotParam, onDeepLink]);

  return null;
}
