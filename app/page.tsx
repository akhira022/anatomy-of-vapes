"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, ClipboardList, FlaskConical } from "lucide-react";
import { Hero } from "@/components/Hero";

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

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          aria-label="หลัก"
          className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:h-16 sm:px-6"
        >
          <Link
            href="/"
            className="font-heading text-sm font-semibold tracking-wide text-textPrimary/80 transition-colors hover:text-textPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Anatomy of Vapes
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Hero />

        <section
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
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
          <Image
            src="/images/partners.png"
            alt="โลโก้พันธมิตรโครงการ คิดดี IDOL, ยกกำลังสุข และ สสส."
            width={900}
            height={160}
            className="h-auto w-full max-w-xl object-contain opacity-85"
          />
          <p className="text-center text-xs text-textDisabled">
            © {new Date().getFullYear()} Anatomy of Vapes
          </p>
        </div>
      </footer>
    </div>
  );
}
