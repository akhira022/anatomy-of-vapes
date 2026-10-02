"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { PageLoading } from "@/components/feedback/PageLoading";
import {
  BodyMap,
  OrganTabs,
  type BodyState,
} from "@/components/impact/BodyMap";
import { BeforeAfterToggle } from "@/components/impact/BeforeAfterToggle";
import {
  ImpactDetail,
  type ImpactModelLink,
} from "@/components/impact/ImpactDetail";
import {
  bodyImpactClosing,
  bodyImpactMyth,
  bodyImpactSecondhand,
  bodyOrganImpacts,
  getBodyOrganImpact,
} from "@/data/body-impact";
import { Users } from "lucide-react";
import { useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";

const learningPhases = ["anatomy", "posttest", "result", "guest_complete"];

export default function ImpactPage() {
  return (
    <Suspense fallback={<ImpactPageFallback />}>
      <ImpactPageContent />
    </Suspense>
  );
}

function ImpactPageFallback() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ผลต่อร่างกาย" showBack backHref="/" />
      <PageLoading
        fullScreen={false}
        className="flex-1 py-16"
        label="กำลังโหลด…"
      />
    </div>
  );
}

function ImpactPageContent() {
  const searchParams = useSearchParams();
  const organFromQuery = getBodyOrganImpact(searchParams.get("organ"));
  const [activeId, setActiveId] = useState(
    () => organFromQuery?.id ?? bodyOrganImpacts[0].id
  );
  const [bodyState, setBodyState] = useState<BodyState>("before");
  const [mounted, setMounted] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (organFromQuery) setActiveId(organFromQuery.id);
  }, [organFromQuery]);

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
      if (!mounted) {
        return { href: "/guest", label: "เริ่มเรียนเพื่อดูโมเดล 3D" };
      }
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
    [canOpenModel, mounted, registered]
  );

  const active = bodyOrganImpacts.find((item) => item.id === activeId);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ผลต่อร่างกาย" showBack backHref="/" />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
      >
        <header className="max-w-3xl">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
            ร่างกายเปลี่ยนไปอย่างไร
            <br className="hidden sm:block" />
            เมื่อเริ่มสูบบุหรี่ไฟฟ้า
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-textSecondary sm:text-base">
            หลายคนคิดว่าบุหรี่ไฟฟ้าอันตรายน้อยกว่าบุหรี่มวน
            แตะอวัยวะบนร่าง แล้วเทียบก่อนสูบกับหลังสูบ
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
              <div className="flex justify-center">
                <BeforeAfterToggle
                  value={bodyState}
                  onChange={setBodyState}
                />
              </div>
              <BodyMap
                items={bodyOrganImpacts}
                activeId={activeId}
                state={bodyState}
                onSelect={setActiveId}
                className="mt-4"
              />
              {bodyState === "after" ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs leading-relaxed text-textPrimary sm:text-sm">
                  <Users
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  <span>{bodyImpactSecondhand.text}</span>
                </p>
              ) : null}
            </div>
            <OrganTabs
              items={bodyOrganImpacts}
              activeId={activeId}
              onSelect={setActiveId}
              className="mt-3"
            />
          </div>

          {active ? (
            <ImpactDetail
              item={active}
              index={bodyOrganImpacts.indexOf(active)}
              modelLink={modelLink}
              activeSide={bodyState}
              onSideChange={setBodyState}
              asTabPanel
            />
          ) : null}
        </div>

        {bodyImpactMyth ? (
          <section className="mt-10">
            <h2 className="font-heading text-lg font-semibold text-textPrimary sm:text-xl">
              แล้วเทียบกับบุหรี่มวนล่ะ
            </h2>
            <ImpactDetail item={bodyImpactMyth} className="mt-3" />
            <p className="mx-auto mt-10 max-w-2xl text-balance text-center font-heading text-lg font-semibold leading-relaxed text-textPrimary sm:text-xl">
              {bodyImpactClosing}
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
