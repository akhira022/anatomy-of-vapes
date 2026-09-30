"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircleHeart, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { PracticeAdvicePanel } from "@/components/practice/PracticeAdvicePanel";
import { PracticeChat } from "@/components/practice/PracticeChat";
import { PracticeConsentBanner } from "@/components/practice/PracticeConsentBanner";
import {
  PracticeStepper,
  type PracticeStepId,
} from "@/components/practice/PracticeStepper";
import { Button } from "@/components/ui/button";
import { practiceSituations } from "@/data/refusal-skills";
import { saveRefusalPractice } from "@/lib/db";
import {
  getPracticeSessionId,
  hasPracticeConsent,
  hasPracticeConsentDecision,
} from "@/lib/practice-session";
import { useQuizStore } from "@/store/useQuizStore";

export default function PracticePage() {
  const userId = useQuizStore((s) => s.userId);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);

  const [index, setIndex] = useState(0);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [consentReady, setConsentReady] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [needsConsentPrompt, setNeedsConsentPrompt] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fromQuiz = Boolean(consentAccepted);
    const fromPractice = hasPracticeConsent();
    setCanSave(fromQuiz || fromPractice);
    setNeedsConsentPrompt(!fromQuiz && !hasPracticeConsentDecision());
    setConsentReady(true);
  }, [consentAccepted]);

  const situation = practiceSituations[index];
  const total = practiceSituations.length;
  const isLast = index >= total - 1;

  const step: PracticeStepId = useMemo(() => {
    if (finished) return "again";
    if (!selectedPhrase) return "choose";
    return "advice";
  }, [finished, selectedPhrase]);

  const persistChoice = useCallback(
    async (phrase: string, situationId: string) => {
      if (!canSave) return;
      const sessionId = getPracticeSessionId();
      if (!sessionId) return;
      const result = await saveRefusalPractice({
        sessionId,
        situationId,
        selectedPhrase: phrase,
        userId: userId || null,
      });
      if ("error" in result) {
        toast.error(result.error);
      }
    },
    [canSave, userId]
  );

  const handleSelect = useCallback(
    (phrase: string) => {
      if (!situation) return;
      setSelectedPhrase(phrase);
      void persistChoice(phrase, situation.id);
    },
    [persistChoice, situation]
  );

  const handleTryAnother = () => {
    setSelectedPhrase(null);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelectedPhrase(null);
  };

  const handleRestart = () => {
    setIndex(0);
    setSelectedPhrase(null);
    setFinished(false);
  };

  const showConsentBanner =
    consentReady && needsConsentPrompt && !finished;

  if (!situation) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <AppNavbar title="ฝึกปฏิเสธเพื่อน" showBack backHref="/" />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-textSecondary">ยังไม่มีสถานการณ์ฝึก</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="ฝึกสกิลปฏิเสธเพื่อน" showBack backHref="/" />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8"
      >
        <header className="max-w-3xl">
          <p className="text-sm font-medium text-primary">ทักษะชีวิต</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-textPrimary sm:text-3xl">
            ฝึกสกิลปฏิเสธเพื่อน
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-textSecondary sm:text-base">
            จำลองสถานการณ์เพื่อนชวนสูบ เลือกคำปฏิเสธที่ใช้ได้จริง
            แล้วฝึกจนมั่นใจขึ้น — ไม่ต้องสมัครสมาชิก
          </p>
        </header>

        {showConsentBanner ? (
          <div className="mt-6">
            <PracticeConsentBanner
              onAccepted={() => {
                setCanSave(true);
                setNeedsConsentPrompt(false);
                toast.success("จะบันทึกการฝึกเมื่อคุณเลือกคำตอบ");
                if (selectedPhrase && situation) {
                  void (async () => {
                    const sessionId = getPracticeSessionId();
                    if (!sessionId) return;
                    const result = await saveRefusalPractice({
                      sessionId,
                      situationId: situation.id,
                      selectedPhrase,
                      userId: userId || null,
                    });
                    if ("error" in result) toast.error(result.error);
                  })();
                }
              }}
              onDecline={() => {
                setCanSave(false);
                setNeedsConsentPrompt(false);
                toast.message("ฝึกได้ตามปกติ โดยไม่บันทึกลงฐานข้อมูล");
              }}
            />
          </div>
        ) : null}

        {finished ? (
          <section className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-textPrimary">
              ฝึกครบทุกสถานการณ์แล้ว
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">
              คุณฝึกปฏิเสธครบ {total} สถานการณ์แล้ว
              สามารถฝึกซ้ำหรือกลับไปเรียนรู้โมเดล 3D ได้
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" size="touch" onClick={handleRestart}>
                ฝึกอีกครั้ง
              </Button>
              <Button
                render={<Link href="/anatomy" />}
                nativeButton={false}
                variant="outline"
                size="touch"
              >
                ไปสำรวจ 3D
              </Button>
              <Button
                render={<Link href="/" />}
                nativeButton={false}
                variant="ghost"
                size="touch"
              >
                กลับหน้าหลัก
              </Button>
            </div>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)_18rem] lg:items-start">
            <PracticeStepper
              current={step}
              className="hidden rounded-xl border border-border bg-card p-4 lg:flex"
            />

            <PracticeChat
              situationTitle={`สถานการณ์ที่ ${index + 1}: ${situation.situation}`}
              progressLabel={`${index + 1}/${total}`}
              friendLines={situation.practice.friendLines}
              friendReply={situation.practice.friendReply}
              phrases={situation.examplePhrases}
              selectedPhrase={selectedPhrase}
              onSelect={handleSelect}
              onTryAnother={handleTryAnother}
              onNext={handleNext}
              isLast={isLast}
            />

            <PracticeAdvicePanel
              advice={situation.practice.advice}
              examplePhrases={situation.examplePhrases}
              showAdvice={Boolean(selectedPhrase)}
            />
          </div>
        )}

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Users,
              title: "จำลองการถูกชวน",
              body: "สถานการณ์ใกล้เคียงชีวิตจริงของวัยรุ่น",
            },
            {
              icon: MessageCircleHeart,
              title: "ตัวอย่างที่ใช้ได้จริง",
              body: "ประโยคสุภาพ มั่นใจ พร้อมนำไปใช้",
            },
            {
              icon: Sparkles,
              title: "หลายสถานการณ์",
              body: "ฝึกซ้ำได้จนรู้สึกมั่นใจขึ้น",
            },
          ].map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card p-4"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-sm font-semibold text-textPrimary">
                {title}
              </h3>
              <p className="mt-1 text-sm text-textSecondary">{body}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
