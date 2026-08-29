"use client";

import { useState } from "react";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { adminAuthErrorMessage } from "@/lib/admin-auth-errors";
import { isAdminSession } from "@/lib/auth-roles";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "@/lib/validations";

export default function AdminLoginPage() {
  const router = useAppRouter();
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    setAuthError(null);

    if (!supabaseReady) {
      setAuthError(
        "ยังไม่ได้ตั้งค่า Supabase — คัดลอก .env.example เป็น .env.local แล้วใส่ URL และ anon key"
      );
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setAuthError("เชื่อมต่อ Supabase ไม่สำเร็จ");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const message = adminAuthErrorMessage(error.message);
        setAuthError(message);
        toast.error(message);
        return;
      }

      if (!isAdminSession(data.session)) {
        await supabase.auth.signOut();
        const message = "บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล";
        setAuthError(message);
        toast.error(message);
        return;
      }

      toast.success("เข้าสู่ระบบสำเร็จ");
      router.replace("/admin");
    } catch {
      const message = adminAuthErrorMessage("network");
      setAuthError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="เข้าสู่ระบบผู้ดูแล" showBack backHref="/" />
      <main id="main-content" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          เข้าสู่ระบบผู้ดูแล
        </h1>
        <p className="mt-2 text-sm text-textSecondary">
          ใช้บัญชี Supabase Auth ที่สร้างไว้ในโปรเจกต์
        </p>

        {!supabaseReady ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-textPrimary"
          >
            ยังไม่ได้ตั้งค่า Supabase — คัดลอก{" "}
            <code className="text-xs">.env.example</code> เป็น{" "}
            <code className="text-xs">.env.local</code> ใส่ URL/anon key จริง
            แล้วรัน SQL ใน{" "}
            <code className="text-xs">supabase/migrations/001_init.sql</code>
          </div>
        ) : null}

        {authError ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"
          >
            {authError}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
        >
          <FormField
            id="email"
            label="อีเมล"
            required
            error={errors.email?.message}
          >
            <Input
              type="email"
              autoComplete="username"
              className="h-11 rounded-lg"
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
              autoComplete="current-password"
              className="h-11 rounded-lg"
              {...register("password")}
            />
          </FormField>
          <Button
            type="submit"
            size="touch"
            loading={submitting}
            disabled={!supabaseReady}
            className="w-full font-semibold"
          >
            เข้าสู่ระบบ
          </Button>
        </form>
      </main>
    </div>
  );
}
