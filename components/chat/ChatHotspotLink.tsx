"use client";

import { useAppRouter } from "@/hooks/useAppRouter";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";

interface ChatHotspotLinkProps {
  hotspotId: string;
}

export function ChatHotspotLink({ hotspotId }: ChatHotspotLinkProps) {
  const router = useAppRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-2 h-8 w-full justify-start gap-2 text-xs"
      onClick={() => router.push(`/anatomy?hotspot=${hotspotId}`)}
    >
      <Box className="size-3.5" />
      ดูในโมเดล 3D
    </Button>
  );
}
