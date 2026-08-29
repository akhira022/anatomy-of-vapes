"use client";

import Link from "next/link";
import { Box, Bot, ClipboardList, FlaskConical } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { PartnerLogos } from "@/components/layout/PartnerLogos";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10%" } as const;

const features = [
  {
    icon: Box,
    title: "เรียนผ่าน 3D",
    description: "หมุนและสำรวจโมเดลได้อย่างอิสระ",
  },
  {
    icon: FlaskConical,
    title: "ดูสารพิษ",
    description: "ข้อมูลสารเคมีอันตรายในบุหรี่ไฟฟ้า",
  },
  {
    icon: ClipboardList,
    title: "ทำแบบทดสอบ",
    description: "วัดความรู้ก่อนและหลังเรียน",
  },
  {
    icon: Bot,
    title: "ถาม AI ผู้ช่วย",
    description: "ถามเรื่องส่วนประกอบ ผลเสีย กฎหมาย พร้อมอ้างอิงแหล่ง",
  },
] as const;

const learningSteps = [
  {
    title: "ทดสอบก่อนเรียน",
    description: "วัดความรู้ตั้งต้นก่อนสำรวจโมเดล",
  },
  {
    title: "ดูโมเดล 3 มิติ",
    description: "แยกชิ้นส่วนและเปิดจุดสารพิษทีละจุด",
  },
  {
    title: "ทดสอบหลังเรียน",
    description: "เทียบคะแนนและทบทวนโมเดลได้ทันที",
  },
] as const;

export default function Home() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-50 light:bg-gradient-to-b light:from-background light:via-background/80 light:to-transparent">
        <nav
          aria-label="หลัก"
          className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6"
        >
          <Link
            href="/"
            className="font-heading text-sm font-semibold tracking-wide text-textPrimary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Anatomy of Vapes
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/#partners"
              className="text-xs font-medium text-textPrimary/70 transition-colors hover:text-textPrimary sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              สนับสนุนโดย
            </Link>
            <ThemeToggle />
            <UserSessionMenu />
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Hero />

        <section
          id="how-it-works"
          aria-labelledby="features-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <motion.h2
              id="features-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: EASE_OUT }
              }
            >
              เรียนรู้ยังไง
            </motion.h2>

            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
              {features.map(({ icon: Icon, title, description }, index) => (
                <motion.li
                  key={title}
                  className="flex gap-4 sm:flex-col sm:gap-3"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          delay: Math.min(index * 0.1, 0.3),
                          duration: 0.4,
                          ease: EASE_OUT,
                        }
                  }
                >
                  <Icon
                    className="mt-0.5 size-6 shrink-0 text-primary sm:size-7"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-heading text-base font-semibold text-textPrimary sm:text-lg">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-textSecondary sm:text-base">
                      {description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="path-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <motion.h2
              id="path-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, ease: EASE_OUT }
              }
            >
              เส้นทางผู้เรียน
            </motion.h2>
            <motion.p
              className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { delay: 0.05, duration: 0.4, ease: EASE_OUT }
              }
            >
              เข้าสู่ระบบแล้วเรียนตามลำดับ — หลังจบครบทุกขั้น สามารถกลับมาดูโมเดลได้อีกทันที
            </motion.p>

            <ol className="mt-10 space-y-8 border-l border-border pl-6 sm:pl-8">
              {learningSteps.map((step, index) => (
                <motion.li
                  key={step.title}
                  className="relative"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          delay: Math.min(index * 0.1, 0.3),
                          duration: 0.4,
                          ease: EASE_OUT,
                        }
                  }
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute -left-[1.9rem] top-1 flex size-6 items-center justify-center rounded-full border border-border bg-background font-heading text-xs font-semibold text-primary sm:-left-[2.4rem]"
                    initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            delay: Math.min(index * 0.1, 0.3),
                            duration: 0.35,
                            ease: EASE_OUT,
                          }
                    }
                  >
                    {index + 1}
                  </motion.span>
                  <h3 className="font-heading text-base font-semibold text-textPrimary sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-textSecondary sm:text-base">
                    {step.description}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="partners-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-16"
        >
          <motion.div
            className="mx-auto flex max-w-5xl flex-col items-center text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.45, ease: EASE_OUT }
            }
          >
            <h2
              id="partners-heading"
              className="font-heading text-xl font-bold tracking-tight text-textPrimary sm:text-2xl"
            >
              สนับสนุนโดย
            </h2>
            <p className="mt-2 max-w-md text-sm text-textSecondary">
              เครือข่ายสื่อสร้างสรรค์และส่งเสริมสุขภาพ
            </p>
            <PartnerLogos className="mt-8 max-w-3xl" density="section" />
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
