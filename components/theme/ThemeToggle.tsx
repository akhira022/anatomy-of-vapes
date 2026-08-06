"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, ready } = useTheme();
  // Until mounted, mirror DEFAULT_THEME (dark) so SSR HTML matches client hydration.
  const isLight = ready && theme === "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isLight ? "สลับเป็นธีมมืด" : "สลับเป็นธีมสว่าง"}
      title={isLight ? "ธีมมืด" : "ธีมสว่าง"}
      className={cn("size-10 rounded-lg text-textPrimary", className)}
      onClick={toggleTheme}
      disabled={!ready}
    >
      {isLight ? (
        <Moon className="size-5" aria-hidden="true" />
      ) : (
        <Sun className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}
