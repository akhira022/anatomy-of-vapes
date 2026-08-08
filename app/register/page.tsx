"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CompletedLearnerChoice } from "@/components/auth/CompletedLearnerChoice";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";
import { PdpaModal } from "@/components/popup/PdpaModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, findUserByNickname, hasQuizResult, saveConsent } from "@/lib/db";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import {
  gradeOptions,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations";
import { useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import type { Grade } from "@/types";

export default function RegisterPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const [submitting, setSubmitting] = useState(false);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const setUser = useQuizStore((s) => s.setUser);
  const setConsentAccepted = useQuizStore((s) => s.setConsentAccepted);
  const setPhase = useQuizStore((s) => s.setPhase);
  const setResultSaved = useQuizStore((s) => s.setResultSaved);
  const resetProgress = useQuizStore((s) => s.resetProgress);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nickname: "",
      grade: undefined,
      consent: false,
    },
  });

  useEffect(() => {
    if (!hydrated || awaitingChoice) return;
    if (isLoggedIn({ nickname, consentAccepted })) {
      router.replace(phaseToPath(currentPhase));
    }
  }, [
    hydrated,
    awaitingChoice,
    nickname,
    consentAccepted,
    currentPhase,
    router,
  ]);

  const goRetake = () => {
    resetProgress();
    toast.message("เริ่มทำแบบทดสอบใหม่");
    router.push("/pretest");
  };

  const goViewModel = () => {
    toast.success("เข้าโหมดทบทวนโมเดล");
    router.push("/anatomy");
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const existing = await findUserByNickname(values.nickname);
      if (existing && "error" in existing) {
        const canContinueOffline =
          existing.error.includes("ออฟไลน์") ||
          existing.error.includes("migration");
        if (!canContinueOffline) {
          toast.error(existing.error);
          return;
        }
      } else if (existing) {
        resetQuiz();
        setUser(existing.nickname, existing.grade as Grade, existing.id);
        setConsentAccepted(true);
        const alreadySaved = await hasQuizResult(existing.id);
        const completed = alreadySaved === true;
        setResultSaved(completed);
        toast.success("พบบัญชีเดิม — เข้าสู่ระบบให้แล้ว");

        if (completed) {
          setPhase("result");
          setAwaitingChoice(true);
          return;
        }

        setPhase("pretest");
        router.push("/pretest");
        return;
      }

      resetQuiz();
      const created = await createUser({
        nickname: values.nickname,
        grade: values.grade,
      });

      if ("error" in created) {
        toast.error(created.error);
        return;
      }

      const consent = await saveConsent(created.id, true);
      if ("error" in consent) {
        toast.error(consent.error);
        return;
      }

      setUser(values.nickname, values.grade as Grade, created.id);
      setConsentAccepted(true);
      setPhase("pretest");
      toast.success("ลงทะเบียนสำเร็จ");
      router.push("/pretest");
    } finally {
      setSubmitting(false);
    }
  };

  const onDecline = () => {
    toast.message("ต้องยอมรับเงื่อนไขเพื่อเริ่มเรียนรู้");
    router.push("/");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title="ลงทะเบียน"
        showBack
        backHref="/"
        rightSlot={<UserSessionMenu />}
      />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8 text-left sm:px-10">
        {awaitingChoice && nickname ? (
          <CompletedLearnerChoice
            nickname={nickname}
            onViewModel={goViewModel}
            onRetake={goRetake}
          />
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold text-textPrimary">
              ยินยอมและเริ่มต้น
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">
              กรอกชื่อเล่น เลือกระดับชั้น และยอมรับเงื่อนไข PDPA
              เพื่อเริ่มแบบทดสอบก่อนเรียน
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 flex flex-1 flex-col gap-6"
            >
              <div className="space-y-2">
                <Label htmlFor="nickname">ชื่อเล่น</Label>
                <Input
                  id="nickname"
                  placeholder="กรอกชื่อเล่น"
                  autoComplete="nickname"
                  className="h-11 rounded-lg"
                  {...register("nickname")}
                />
                {errors.nickname ? (
                  <p className="text-sm text-error">{errors.nickname.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>ระดับชั้น</Label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger className="h-11 w-full rounded-lg">
                        <SelectValue placeholder="เลือกระดับการศึกษา" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.grade ? (
                  <p className="text-sm text-error">{errors.grade.message}</p>
                ) : null}
              </div>

              <div className="space-y-2 rounded-lg border-2 border-border bg-card p-5 light:border-textPrimary/20 light:bg-surface">
                <Controller
                  name="consent"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start gap-3 text-sm leading-relaxed text-textPrimary">
                      <Checkbox
                        id="pdpa-consent"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="mt-0.5 size-5 shrink-0 rounded-[5px] border-[2.5px] border-primary bg-background shadow-sm data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground light:bg-white light:data-checked:bg-primary light:data-checked:text-white"
                      />
                      <p className="min-w-0">
                        <label htmlFor="pdpa-consent" className="cursor-pointer">
                          ข้าพเจ้ายินยอมให้เก็บข้อมูลตาม{" "}
                        </label>
                        <PdpaModal />
                        <label htmlFor="pdpa-consent" className="cursor-pointer">
                          {" "}
                          เพื่อใช้ในการเรียนรู้และวิจัยทางการศึกษา
                        </label>
                      </p>
                    </div>
                  )}
                />
                {errors.consent ? (
                  <p className="text-sm text-error">{errors.consent.message}</p>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col items-start gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-auto rounded-lg px-6 text-base font-semibold"
                >
                  {submitting ? "กำลังบันทึก..." : "ยอมรับและเริ่มทำแบบทดสอบ"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-auto rounded-lg px-6 text-base"
                  onClick={onDecline}
                >
                  ไม่ยอมรับ
                </Button>
                <p className="text-sm text-textSecondary">
                  เคยลงทะเบียนแล้ว?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
