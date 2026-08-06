"use client";

import { useState } from "react";
import { useAppRouter } from "@/hooks/useAppRouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "@/lib/validations";

export default function AdminLoginPage() {
  const router = useAppRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    if (!isSupabaseConfigured()) {
      toast.error("ยังไม่ได้ตั้งค่า Supabase — ใส่ env แล้วลองใหม่");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error("เชื่อมต่อ Supabase ไม่สำเร็จ");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("เข้าสู่ระบบสำเร็จ");
      router.replace("/admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AppNavbar title="Admin Login" showBack backHref="/" />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          เข้าสู่ระบบผู้ดูแล
        </h1>
        <p className="mt-2 text-sm text-textSecondary">
          ใช้บัญชี Supabase Auth ที่สร้างไว้ในโปรเจกต์
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              className="h-11 rounded-xl"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-error">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 rounded-xl"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-error">{errors.password.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-2xl font-semibold"
          >
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </main>
    </div>
  );
}
