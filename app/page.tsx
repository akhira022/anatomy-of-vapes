"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, ClipboardList, FlaskConical } from "lucide-react";
import { Hero } from "@/components/Hero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";

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
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="หลัก"
          className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6"
        >
          <Link
            href="/"
            className="font-heading text-sm font-semibold tracking-wide text-textPrimary/80 transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Anatomy of Vapes
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/#contact"
              className="hidden text-sm text-textSecondary transition-colors hover:text-textPrimary sm:inline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              ติดต่อเรา
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
            <h2
              id="features-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl"
            >
              เรียนรู้ยังไง
            </h2>

            <ul className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4 sm:flex-col sm:gap-3">
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
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="path-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="path-heading"
              className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl"
            >
              เส้นทางผู้เรียน
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">
              เข้าสู่ระบบแล้วเรียนตามลำดับ — หลังจบครบทุกขั้น สามารถกลับมาดูโมเดลได้อีกทันที
            </p>

            <ol className="mt-10 space-y-8 border-l border-border pl-6 sm:pl-8">
              {learningSteps.map((step, index) => (
                <li key={step.title} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.9rem] top-1 flex size-6 items-center justify-center rounded-full border border-border bg-background font-heading text-xs font-semibold text-primary sm:-left-[2.4rem]"
                  >
                    {index + 1}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-textPrimary sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-textSecondary sm:text-base">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="partners-heading"
          className="border-t border-border px-4 py-14 sm:px-6 sm:py-16"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <h2
              id="partners-heading"
              className="font-heading text-xl font-bold tracking-tight text-textPrimary sm:text-2xl"
            >
              สนับสนุนโดย
            </h2>
            <p className="mt-2 max-w-md text-sm text-textSecondary">
              เครือข่ายสื่อสร้างสรรค์และส่งเสริมสุขภาพ
            </p>
            <Image
              src="/images/partners.png"
              alt="โลโก้พันธมิตรโครงการ คิดดี IDOL, ยกกำลังสุข และ สสส."
              width={900}
              height={160}
              className="mt-8 h-auto w-full max-w-xl object-contain opacity-90"
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
