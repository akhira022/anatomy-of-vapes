"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findUserByNickname, hasQuizResult } from "@/lib/db";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import {
  learnerLoginSchema,
  type LearnerLoginFormValues,
} from "@/lib/validations";
import { useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import type { Grade } from "@/types";

export default function LoginPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const [submitting, setSubmitting] = useState(false);
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const setUser = useQuizStore((s) => s.setUser);
  const setConsentAccepted = useQuizStore((s) => s.setConsentAccepted);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setResultSaved = useQuizStore((s) => s.setResultSaved);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LearnerLoginFormValues>({
    resolver: zodResolver(learnerLoginSchema),
    defaultValues: { nickname: "" },
  });

  useEffect(() => {
    if (!hydrated) return;
    if (isLoggedIn({ nickname, consentAccepted })) {
      router.replace(phaseToPath(currentPhase));
    }
  }, [hydrated, nickname, consentAccepted, currentPhase, router]);

  const onSubmit = async (values: LearnerLoginFormValues) => {
    setSubmitting(true);
    try {
      const found = await findUserByNickname(values.nickname);

      if (found && "error" in found) {
        toast.error(found.error);
        return;
      }

      if (!found) {
        toast.error("ไม่พบบัญชีนี้ — ลองลงทะเบียนใหม่");
        return;
      }

      resetQuiz();
      setUser(found.nickname, found.grade as Grade, found.id);
      setConsentAccepted(true);
      const alreadySaved = await hasQuizResult(found.id);
      setResultSaved(alreadySaved === true);
      setPhase("pretest");
      toast.success(`ยินดีต้อนรับกลับ คุณ${found.nickname}`);
      router.push("/pretest");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title="เข้าสู่ระบบ"
        showBack
        backHref="/"
        rightSlot={<UserSessionMenu />}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8 text-left sm:px-10">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          เข้าสู่ระบบด้วยชื่อเล่น
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-textSecondary">
          หากเคยลงทะเบียนแล้ว กรอกชื่อเล่นเดิมเพื่อเริ่มเส้นทางเรียน:
          ทดสอบก่อนเรียน → ดูโมเดล → ทดสอบหลังเรียน
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-1 flex-col gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="nickname">ชื่อเล่น</Label>
            <Input
              id="nickname"
              placeholder="กรอกชื่อเล่นที่เคยใช้"
              autoComplete="nickname"
              className="h-11 rounded-lg"
              {...register("nickname")}
            />
            {errors.nickname ? (
              <p className="text-sm text-error">{errors.nickname.message}</p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col items-start gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-auto rounded-lg px-6 text-base font-semibold"
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
            <p className="text-sm text-textSecondary">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                ลงทะเบียน
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
