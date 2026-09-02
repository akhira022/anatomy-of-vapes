"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CompletedLearnerChoice } from "@/components/auth/CompletedLearnerChoice";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { findUserById, hasQuizResult } from "@/lib/db";
import { signInLearner } from "@/lib/learner-auth";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { isSupabaseConfigured } from "@/lib/supabase";
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
  const supabaseReady = isSupabaseConfigured();
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
    handleSubmit,
    formState: { errors },
  } = useForm<LearnerLoginFormValues>({
    resolver: zodResolver(learnerLoginSchema),
    defaultValues: { email: "", password: "" },
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

  const onSubmit = async (values: LearnerLoginFormValues) => {
    if (!supabaseReady) {
      toast.error("ยังไม่ได้ตั้งค่า Supabase — ตรวจ .env.local");
      return;
    }

    setSubmitting(true);
    try {
      const auth = await signInLearner(values.email, values.password);
      if ("error" in auth) {
        toast.error(auth.error);
        return;
      }

      const found = await findUserById(auth.userId);
      if (found && "error" in found) {
        toast.error(found.error);
        return;
      }

      if (!found) {
        toast.error("ไม่พบบัญชีผู้เรียน — ลองลงทะเบียนใหม่");
        return;
      }

      resetQuiz();
      setUser(
        found.nickname,
        found.grade as Grade,
        found.id,
        found.email ?? undefined,
        found.ageRange ?? undefined,
        found.userType ?? "member"
      );
      setConsentAccepted(true);

      const alreadySaved = await hasQuizResult(found.id);
      const completed = alreadySaved === true;
      setResultSaved(completed);

      if (completed) {
        setPhase("result");
        setAwaitingChoice(true);
        toast.success(`ยินดีต้อนรับกลับ คุณ${found.nickname}`);
        return;
      }

      setPhase("pretest");
      toast.success(`ยินดีต้อนรับกลับ คุณ${found.nickname}`);
      router.push("/pretest");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes("Load failed")
          ? "เชื่อมต่อฐานข้อมูลไม่ได้ — ตรวจ Wi‑Fi หรือ URL Supabase ใน .env.local"
          : err instanceof Error
            ? err.message
            : "เข้าสู่ระบบไม่สำเร็จ"
      );
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
      <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 text-left sm:px-6 xl:max-w-3xl xl:justify-center xl:py-12">
        {awaitingChoice && nickname ? (
          <CompletedLearnerChoice
            nickname={nickname}
            context="login"
            onViewModel={goViewModel}
            onRetake={goRetake}
          />
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold text-textPrimary xl:text-3xl">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary xl:text-base">
              ใช้อีเมลและรหัสผ่านที่ลงทะเบียนไว้
            </p>

            {!supabaseReady ? (
              <div
                role="status"
                className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-textPrimary"
              >
                ยังไม่ได้ตั้งค่า Supabase — ใส่ URL และ anon key ใน{" "}
                <code className="text-xs">.env.local</code>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 flex flex-1 flex-col gap-6"
            >
              <FormField
                id="email"
                label="อีเมล"
                required
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="h-11 rounded-lg xl:min-h-12 xl:text-lg"
                  {...register("email")}
                />
              </FormField>

              <FormField
                id="password"
                label="รหัสผ่าน"
                required
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  className="h-11 rounded-lg xl:min-h-12 xl:text-lg"
                  {...register("password")}
                />
              </FormField>

              <div className="mt-auto flex flex-col items-start gap-3 pt-4">
                <Button
                  type="submit"
                  size="touch"
                  loading={submitting}
                  disabled={!supabaseReady}
                  className="font-semibold xl:min-h-12"
                >
                  เข้าสู่ระบบ
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
          </>
        )}
      </main>
    </div>
  );
}
