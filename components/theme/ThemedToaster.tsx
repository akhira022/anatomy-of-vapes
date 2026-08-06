"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/components/theme/ThemeProvider";

export function ThemedToaster() {
  const { theme } = useTheme();
  return <SonnerToaster theme={theme} richColors position="top-center" />;
}
