"use client";

import { useCallback, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ImpactCarousel } from "@/components/impact/ImpactCarousel";
import {
  ImpactDetail,
  type ImpactModelLink,
} from "@/components/impact/ImpactDetail";
import { bodyImpactClosing, bodyImpacts } from "@/data/body-impact";
import { useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";

const learningPhases = ["anatomy", "posttest", "result", "guest_complete"];

export default function ImpactPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const hydrated = useHydrated();
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const preAnswerCount = useQuizStore((s) => s.preAnswers.length);
  const resultSaved = useQuizStore((s) => s.resultSaved);

  const registered = hydrated && Boolean(nickname && consentAccepted);
  const canOpenModel =
    registered &&
    (preAnswerCount >= 5 ||
      resultSaved ||
      learningPhases.includes(currentPhase));

  const modelLink = useCallback(
    (hotspotId: string): ImpactModelLink => {
      if (canOpenModel) {
        return {
          href: `/anatomy?hotspot=${hotspotId}`,
          label: "ดูจุดนี้ในโมเดล 3D",
        };
      }
      if (registered) {
        return { href: "/pretest", label: "ทำแบบทดสอบเพื่อดูโมเดล 3D" };
      }
      return { href: "/guest", label: "เริ่มเรียนเพื่อดูโมเดล 3D" };
    },
    [canOpenModel, registered]
  );

  const active = bodyImpacts[activeIndex];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ผลต่อร่างกาย" showBack backHref="/" />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-primary">ก่อนสูบ / หลังสูบ</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-textPrimary sm:text-4xl">
            ร่างกายเปลี่ยนไปอย่างไร
            <br className="hidden sm:block" />
            เมื่อเริ่มสูบบุหรี่ไฟฟ้า
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-textSecondary sm:text-base">
            หลายคนคิดว่าบุหรี่ไฟฟ้าอันตรายน้อยกว่าบุหรี่มวน
            เลื่อนดู 4 ระบบในร่างกายแล้วเทียบก่อนและหลังด้วยตัวเอง
          </p>
        </header>

        <div className="mt-8">
          <ImpactCarousel
            items={bodyImpacts}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
        </div>

        <ImpactDetail
          item={active}
          index={activeIndex}
          modelLink={modelLink}
        />

        <p className="mx-auto mt-10 max-w-2xl text-balance text-center font-heading text-lg font-semibold leading-relaxed text-textPrimary sm:text-xl">
          {bodyImpactClosing}
        </p>
      </main>
    </div>
  );
}
