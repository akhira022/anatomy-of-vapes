"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";

interface AppNavbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  showSessionMenu?: boolean;
  className?: string;
  /** Extra classes for the inner nav row (e.g. wider max-width on xl). */
  contentClassName?: string;
}

export function AppNavbar({
  title = "ระบบประชาสัมพันธ์ภัยบุหรี่ไฟฟ้าอัจฉริยะ",
  showBack = false,
  backHref = "/",
  onBack,
  rightSlot,
  showSessionMenu = true,
  className,
  contentClassName,
}: AppNavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
        className
      )}
    >
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6",
          contentClassName
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {showBack ? (
            onBack ? (
              <button
                type="button"
                aria-label="ย้อนกลับ"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-textPrimary transition-colors hover:bg-surface"
                onClick={onBack}
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : (
              <Link
                href={backHref}
                aria-label="ย้อนกลับ"
                className="flex size-11 shrink-0 items-center justify-center rounded-lg text-textPrimary transition-colors hover:bg-surface"
              >
                <ArrowLeft className="size-5" />
              </Link>
            )
          ) : null}
          <span className="truncate font-heading text-base font-bold tracking-wide text-textPrimary sm:text-lg">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {rightSlot ??
            (showSessionMenu ? <UserSessionMenu showNicknameOnMobile /> : null)}
        </div>
      </nav>
    </header>
  );
}
