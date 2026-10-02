"use client";

import Link from "next/link";
import { Brain, HeartPulse, Smile, Wind } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { BeforeAfterCompare } from "@/components/impact/BeforeAfterCompare";
import { Button } from "@/components/ui/button";
import {
  bodyImpactLandingSample,
  bodyOrganImpacts,
} from "@/data/body-impact";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10%" } as const;

const icons = {
  brain: Brain,
  oral: Smile,
  lungs: Wind,
  heart: HeartPulse,
} as const;

export function ImpactLandingPreview() {
  const reduceMotion = useReducedMotion();
  const sample = bodyImpactLandingSample;

  return (
    <section
      id="body-impact"
      aria-labelledby="impact-preview-heading"
      className="border-t border-border px-4 py-14 sm:px-6 sm:py-20 xl:py-24"
    >
      <div className="mx-auto max-w-5xl xl:max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }
          }
        >
          <h2
            id="impact-preview-heading"
            className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl xl:text-4xl"
          >
            ร่างกายเปลี่ยนไปอย่างไรเมื่อสูบ
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
            เทียบก่อนและหลังสูบใน 4 ระบบ แล้วเปิดร่างเต็มเพื่อดูจุดอื่นต่อ
          </p>
        </motion.div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bodyOrganImpacts.map((item, index) => {
            const Icon = icons[item.organ];
            return (
              <motion.li
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        delay: Math.min(index * 0.08, 0.24),
                        duration: 0.4,
                        ease: EASE_OUT,
                      }
                }
              >
                <Link
                  href={`/impact?organ=${item.organ}`}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left outline-none",
                    "transition-[border-color,transform,box-shadow] duration-normal",
                    "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow-red",
                    "focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0"
                  )}
                >
                  <div className="flex items-start justify-between bg-surface-2 px-5 py-4">
                    <span className="font-heading text-4xl font-bold leading-none text-textPrimary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-10 text-primary transition-transform duration-normal group-hover:scale-105"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 border-t border-border px-5 py-4">
                    <h3 className="font-heading text-base font-semibold text-textPrimary">
                      {item.title}
                    </h3>
                    <span className="w-fit rounded-full bg-textPrimary px-3 py-1 text-xs font-semibold text-background">
                      {item.badge}
                    </span>
                    <span className="mt-auto text-sm font-medium text-primary">
                      ดูรายละเอียด →
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {sample ? (
          <motion.div
            className="mt-8"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }
            }
          >
            <p className="mb-3 text-sm font-semibold text-textSecondary">
              ตัวอย่าง {sample.shortTitle}
            </p>
            <BeforeAfterCompare
              beforeLabel={sample.beforeLabel}
              afterLabel={sample.afterLabel}
              beforeText={sample.beforeText}
              afterText={sample.afterText}
            />
          </motion.div>
        ) : null}

        <div className="mt-8">
          <Button
            render={<Link href="/impact" />}
            nativeButton={false}
            size="touch"
          >
            ดูผลต่อร่างกายทั้งร่าง
          </Button>
        </div>
      </div>
    </section>
  );
}
