"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { UserSessionMenu } from "@/components/layout/UserSessionMenu";
import { PdpaModal } from "@/components/popup/PdpaModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUser,
  findUserByEmail,
  saveConsent,
} from "@/lib/db";
import { signUpLearner } from "@/lib/learner-auth";
import { isLoggedIn, phaseToPath } from "@/lib/phase";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  gradeOptions,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations";
import { useHydrated } from "@/hooks/useRequirePhase";
import { useQuizStore } from "@/store/useQuizStore";
import type { Grade } from "@/types";

type RegisterFormState = RegisterFormValues;

export default function RegisterPage() {
  const router = useAppRouter();
  const hydrated = useHydrated();
  const supabaseReady = isSupabaseConfigured();
  const [submitting, setSubmitting] = useState(false);
  const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
  const nickname = useQuizStore((s) => s.nickname);
  const consentAccepted = useQuizStore((s) => s.consentAccepted);
  const currentPhase = useQuizStore((s) => s.currentPhase);
  const setUser = useQuizStore((s) => s.setUser);
  const setConsentAccepted = useQuizStore((s) => s.setConsentAccepted);
  const setPhase = useQuizStore((s) => s.setPhase);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormState>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      grade: undefined,
      consent: false,
    },
  });

  useEffect(() => {
    if (!hydrated) return;
    if (isLoggedIn({ nickname, consentAccepted })) {
      router.replace(phaseToPath(currentPhase));
    }
  }, [hydrated, nickname, consentAccepted, currentPhase, router]);

  const onSubmit = async (values: RegisterFormState) => {
    if (!supabaseReady) {
      toast.error("ยังไม่ได้ตั้งค่า Supabase — ตรวจ .env.local");
      return;
    }

    setSubmitting(true);
    try {
      const emailExisting = await findUserByEmail(values.email);
      if (emailExisting && "error" in emailExisting) {
        toast.error(emailExisting.error);
        return;
      }
      if (emailExisting) {
        toast.error("อีเมลนี้ถูกใช้แล้ว — เข้าสู่ระบบที่หน้า Login");
        router.push("/login");
        return;
      }

      resetQuiz();

      const auth = await signUpLearner(values.email, values.password);
      if ("error" in auth) {
        toast.error(auth.error);
        return;
      }

      const needsEmailConfirmation = auth.needsEmailConfirmation;
      if (needsEmailConfirmation) {
        toast.message("ลงทะเบียนสำเร็จ — กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      }

      const userId = auth.userId;
      const email = values.email.trim().toLowerCase();

      const created = await createUser({
        id: userId,
        nickname: values.nickname,
        grade: values.grade,
        email,
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

      setUser(values.nickname, values.grade as Grade, created.id, email);
      setConsentAccepted(true);
      setPhase("pretest");

      if (needsEmailConfirmation) {
        router.push("/login");
        return;
      }

      toast.success("ลงทะเบียนสำเร็จ");
      router.push("/pretest");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.includes("Load failed")
          ? "เชื่อมต่อฐานข้อมูลไม่ได้ — ตรวจ Wi‑Fi หรือ URL Supabase ใน .env.local"
          : err instanceof Error
            ? err.message
            : "ลงทะเบียนไม่สำเร็จ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar
        title="ลงทะเบียน"
        showBack
        backHref="/"
        rightSlot={<UserSessionMenu />}
      />
      <ConfirmDialog
        open={declineConfirmOpen}
        onOpenChange={setDeclineConfirmOpen}
        title="ไม่ยอมรับเงื่อนไข?"
        description="หากไม่ยอมรับ PDPA จะไม่สามารถเริ่มเรียนได้ ต้องการกลับหน้าแรกหรือไม่?"
        confirmLabel="กลับหน้าแรก"
        onConfirm={() => router.push("/")}
        destructive
      />
      <main id="main-content" className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 text-left sm:px-6 xl:max-w-4xl xl:justify-center xl:py-12">
        <>
            <h1 className="font-heading text-2xl font-bold text-textPrimary xl:text-3xl">
              ยินยอมและเริ่มต้น
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary xl:text-base">
              สร้างบัญชีด้วยอีเมล กรอกชื่อเล่น เลือกระดับชั้น และยอมรับเงื่อนไข PDPA
            </p>

            {!supabaseReady ? (
              <div
                role="status"
                className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-textPrimary"
              >
                ยังไม่ได้ตั้งค่า Supabase — สมัครด้วยอีเมลต้องใส่ URL และ anon key ใน{" "}
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
                  disabled={!supabaseReady}
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
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  autoComplete="new-password"
                  className="h-11 rounded-lg xl:min-h-12 xl:text-lg"
                  disabled={!supabaseReady}
                  {...register("password")}
                />
              </FormField>

              <FormField
                id="confirmPassword"
                label="ยืนยันรหัสผ่าน"
                required
                error={errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  autoComplete="new-password"
                  className="h-11 rounded-lg xl:min-h-12 xl:text-lg"
                  disabled={!supabaseReady}
                  {...register("confirmPassword")}
                />
              </FormField>

              <FormField
                id="nickname"
                label="ชื่อเล่น"
                required
                error={errors.nickname?.message}
              >
                <Input
                  placeholder="กรอกชื่อเล่น"
                  autoComplete="nickname"
                  className="h-11 rounded-lg xl:min-h-12 xl:text-lg"
                  {...register("nickname")}
                />
              </FormField>

              <div className="space-y-2">
                <label
                  htmlFor="grade"
                  className="text-sm font-medium leading-none text-textPrimary"
                >
                  ระดับชั้น
                  <span className="ml-1 text-error" aria-hidden="true">
                    *
                  </span>
                </label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? null}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger
                        id="grade"
                        aria-invalid={Boolean(errors.grade)}
                        aria-describedby={
                          errors.grade ? "grade-error" : undefined
                        }
                        className="h-11 w-full rounded-lg xl:min-h-12 xl:text-lg"
                      >
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
                  <p id="grade-error" className="text-sm text-error">
                    {errors.grade.message}
                  </p>
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
                        aria-invalid={Boolean(errors.consent)}
                        aria-describedby={
                          errors.consent ? "pdpa-consent-error" : undefined
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
                  <p id="pdpa-consent-error" className="text-sm text-error">
                    {errors.consent.message}
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col items-start gap-3 pt-4">
                <Button
                  type="submit"
                  size="touch"
                  loading={submitting}
                  disabled={!supabaseReady}
                  className="font-semibold xl:min-h-12"
                >
                  ยอมรับและเริ่มทำแบบทดสอบ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="touch"
                  className="xl:min-h-12"
                  onClick={() => setDeclineConfirmOpen(true)}
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
      </main>
    </div>
  );
}
