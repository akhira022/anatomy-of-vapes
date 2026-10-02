"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FacebookMark } from "@/components/promo/FacebookMark";
import { FACEBOOK_PAGE_URL } from "@/lib/social";

const STORAGE_KEY = "aov:facebook-promo-dismissed";

export function FacebookPromoDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode — still show once this visit */
    }

    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("promo-dialog-open", open);
    return () => document.body.classList.remove("promo-dialog-open");
  }, [open]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent
        overlayClassName="z-[140]"
        className="z-[141] max-w-[22rem] overflow-hidden rounded-2xl border-border bg-card p-0 sm:max-w-sm"
      >
        <div className="relative overflow-hidden px-5 pb-5 pt-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 left-1/2 size-40 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
          />
          <span
            aria-hidden="true"
            className="relative mx-auto mb-5 flex size-14 items-center justify-center"
          >
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-hotspot-pulse" />
            <span className="relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glowRed">
              <FacebookMark className="size-4" />
            </span>
          </span>

          <DialogTitle className="text-center font-heading text-xl font-bold tracking-tight text-textPrimary">
            ส่องไส้ต่อบนเพจ
          </DialogTitle>
          <DialogDescription className="mt-2 text-center text-sm leading-relaxed text-textSecondary">
            ติดตาม Anatomy of Vapes บน Facebook เพื่ออัปเดตโครงการและเรื่องรู้เท่าทันบุหรี่ไฟฟ้า
          </DialogDescription>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-glowRed transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <FacebookMark className="size-4" />
              เปิดเพจ Facebook
            </a>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-xl text-textSecondary"
              onClick={dismiss}
            >
              เรียนบนเว็บนี้ก่อน
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
