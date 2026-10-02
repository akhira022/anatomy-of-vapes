"use client";

import Link from "next/link";
import {
  ArrowRight,
  Box,
  Bot,
  ClipboardList,
  FlaskConical,
  MessageCircleHeart,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { PartnerLogos } from "@/components/layout/PartnerLogos";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";
import { openChatWidget } from "@/components/chat/ChatWidget";
import { ImpactLandingPreview } from "@/components/impact/ImpactLandingPreview";
import { FacebookPageLink } from "@/components/promo/FacebookPageLink";
import { FacebookPromoDialog } from "@/components/promo/FacebookPromoDialog";
import { useHydrated } from "@/hooks/useRequirePhase";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { useQuizStore } from "@/store/useQuizStore";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10%" } as const;

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  /** Route, or "learn" (learner's next step) / "chat" (open AI assistant). */
  href: string;
}[] = [
  {
    icon: Box,
    title: "เรียนผ่าน 3D",
    description: "หมุนและสำรวจโมเดลได้อย่างอิสระ",
    href: "learn",
    cta: "เริ่มสำรวจโมเดล",
  },
  {
    icon: FlaskConical,
    title: "ดูสารพิษ",
    description: "ข้อมูลสารเคมีอันตรายในบุหรี่ไฟฟ้า",
    href: "learn",
    cta: "ดูจุดสารพิษ",
  },
  {
    icon: ClipboardList,
    title: "ทำแบบทดสอบ",
    description: "วัดความรู้ก่อนและหลังเรียน",
    href: "learn",
    cta: "เริ่มทำแบบทดสอบ",
  },
  {
    icon: Bot,
    title: "ถาม AI ผู้ช่วย",
    description: "ถามเรื่องส่วนประกอบ ผลเสีย กฎหมาย พร้อมอ้างอิงแหล่ง",
    href: "chat",
    cta: "เปิดผู้ช่วย AI",
  },
  {
    icon: MessageCircleHeart,
    title: "ฝึกปฏิเสธเพื่อน",
    description: "จำลองสถานการณ์ชวนสูบและเลือกคำปฏิเสธที่ใช้ได้จริง",
    href: "/practice",
    cta: "เริ่มฝึก",
  },
];

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
  const hydrated = useHydrated();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const userType = useQuizStore((s) => s.userType);

  const learnHref =
    hydrated && isLoggedIn({ nickname, consentAccepted })
      ? currentPhase === "result"
        ? "/anatomy"
        : phaseToPath(currentPhase, userType)
      : "/register";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-50 light:bg-gradient-to-b light:from-background light:via-background/80 light:to-transparent">
        <nav
          aria-label="หลัก"
          className="relative mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 xl:max-w-6xl"
        >
          <Link
            href="/"
            title="Anatomy of Vapes"
            className="min-w-0 truncate font-heading text-sm font-semibold tracking-wide text-textPrimary transition-colors hover:text-primary lg:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Anatomy of Vapes
          </Link>
          <PartnerLogos
            density="nav"
            className="absolute left-1/2 hidden -translate-x-1/2 lg:flex"
          />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <UserSessionMenu />
          </div>
        </nav>
        <div className="flex h-14 items-center justify-center border-t border-border/70 bg-background/85 px-4 backdrop-blur-sm lg:hidden">
          <PartnerLogos density="nav" />
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Hero />

        <ImpactLandingPreview />

        <section
          id="how-it-works"
          aria-labelledby="features-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-20 xl:py-24"
        >
          <div className="mx-auto max-w-5xl xl:max-w-6xl">
            <motion.h2
              id="features-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl xl:text-4xl"
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

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {features.map(({ icon: Icon, title, description, href, cta }, index) => {
                const cardClass =
                  "group flex h-full w-full gap-4 rounded-xl border border-border bg-card p-5 text-left outline-none transition-[border-color,transform,box-shadow] duration-normal hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow-red focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0 sm:flex-col sm:gap-3 sm:p-6";
                const body = (
                  <>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary sm:size-12">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-heading text-base font-semibold text-textPrimary sm:text-lg">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-textSecondary sm:text-base">
                        {description}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-primary">
                        {cta}
                        <ArrowRight
                          className="size-4 transition-transform duration-normal group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </>
                );
                return (
                  <motion.li
                    key={title}
                    className="flex"
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
                    {href === "chat" ? (
                      <button
                        type="button"
                        onClick={openChatWidget}
                        className={cardClass}
                      >
                        {body}
                      </button>
                    ) : (
                      <Link
                        href={href === "learn" ? learnHref : href}
                        className={cardClass}
                      >
                        {body}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="path-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-20 xl:py-24"
        >
          <div className="mx-auto max-w-5xl xl:max-w-6xl">
            <motion.h2
              id="path-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl xl:text-4xl"
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
          id="partners"
          aria-labelledby="partners-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-16 xl:py-20"
        >
          <motion.div
            className="mx-auto flex max-w-5xl flex-col items-center text-center xl:max-w-6xl"
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
            <PartnerLogos className="mt-8 max-w-5xl" density="section" />
            <FacebookPageLink
              className="mt-8"
              label="ติดตามเพจ Anatomy of Vapes"
            />
          </motion.div>
        </section>
      </main>

      <SiteFooter />
      <FacebookPromoDialog />
    </div>
  );
}
