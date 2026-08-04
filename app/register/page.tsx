"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
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
import { createUser, saveConsent } from "@/lib/db";
import {
  gradeOptions,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations";
import { useQuizStore } from "@/store/useQuizStore";
import type { Grade } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const setUser = useQuizStore((s) => s.setUser);
  const setConsentAccepted = useQuizStore((s) => s.setConsentAccepted);
  const setPhase = useQuizStore((s) => s.setPhase);
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

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
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
      <AppNavbar title="ลงทะเบียน" showBack backHref="/" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          ยินยอมและเริ่มต้น
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-textSecondary">
          กรอกชื่อเล่น เลือกระดับชั้น และยอมรับเงื่อนไข PDPA
          เพื่อเริ่มแบบทดสอบก่อนเรียน
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-1 flex-col gap-5"
        >
          <div className="space-y-2">
            <Label htmlFor="nickname">ชื่อเล่น</Label>
            <Input
              id="nickname"
              placeholder="กรอกชื่อเล่น"
              autoComplete="nickname"
              className="h-11 rounded-xl"
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
                  <SelectTrigger className="h-11 w-full rounded-xl">
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

          <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <label className="flex items-start gap-3 text-sm leading-relaxed text-textPrimary">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="mt-0.5 border-white/40 bg-transparent data-checked:border-primary data-checked:bg-primary"
                  />
                  <span>
                    ข้าพเจ้ายินยอมให้เก็บข้อมูลตาม{" "}
                    <PdpaModal /> เพื่อใช้ในการเรียนรู้และวิจัยทางการศึกษา
                  </span>
                </label>
              )}
            />
            {errors.consent ? (
              <p className="text-sm text-error">{errors.consent.message}</p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 rounded-2xl text-base font-semibold"
            >
              {submitting ? "กำลังบันทึก..." : "ยอมรับและเริ่มทำแบบทดสอบ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl text-base"
              onClick={onDecline}
            >
              ไม่ยอมรับ
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
