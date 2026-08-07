"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme, ready } = useTheme();
  const reduceMotion = useReducedMotion();
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
      onClick={(event) => {
        toggleTheme({ x: event.clientX, y: event.clientY });
      }}
      disabled={!ready}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? "moon" : "sun"}
          className="inline-flex"
          initial={
            reduceMotion ? false : { opacity: 0, rotate: -70, scale: 0.55 }
          }
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={
            reduceMotion
              ? undefined
              : { opacity: 0, rotate: 70, scale: 0.55 }
          }
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {isLight ? (
            <Moon className="size-5" aria-hidden="true" />
          ) : (
            <Sun className="size-5" aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
