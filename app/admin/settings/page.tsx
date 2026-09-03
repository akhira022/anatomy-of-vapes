"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Settings2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  fetchAdminSettings,
  type AdminSettingsInfo,
} from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const RESULTS_LIMIT_KEY = "aov-admin-results-limit";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        ok
          ? "bg-success/15 text-success"
          : "bg-warning/15 text-warning"
      )}
    >
      {ok ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <XCircle className="size-3.5" />
      )}
      {label}
    </span>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<AdminSettingsInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultsLimit, setResultsLimit] = useState(() => {
    if (typeof window === "undefined") return 50;
    const stored = window.localStorage.getItem(RESULTS_LIMIT_KEY);
    const n = Number(stored);
    return n === 25 || n === 50 || n === 100 || n === 200 ? n : 50;
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminSettings();
    if ("error" in result) {
      setError(result.error);
      setInfo(null);
    } else {
      setInfo(result);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchAdminSettings();
      if (cancelled) return;
      if ("error" in result) {
        setError(result.error);
        setInfo(null);
      } else {
        setInfo(result);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveLimit = (n: number) => {
    setResultsLimit(n);
    window.localStorage.setItem(RESULTS_LIMIT_KEY, String(n));
  };

  const canWrite = Boolean(
    info?.canWriteViaServiceRole || info?.canWriteViaJwtRole
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            render={<Link href="/admin?tab=results" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="size-4" />
            กลับแดชบอร์ด
          </Button>
          <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-textPrimary">
            <Settings2 className="size-5" />
            การตั้งค่าผู้ดูแล
          </h1>
          <p className="mt-1 text-sm text-textSecondary">
            สถานะระบบ สิทธิ์เขียนข้อมูล และการแสดงผลตาราง
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="touch"
          onClick={() => void load()}
        >
          <RefreshCw className="size-4" />
          รีเฟรช
        </Button>
      </div>

      {!isSupabaseConfigured() ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="font-heading font-semibold text-textPrimary">
            ยังไม่ได้ตั้งค่า Supabase
          </p>
          <p className="mt-2 text-sm text-textSecondary">
            ใส่ URL และ anon key ใน `.env.local` แล้วรีสตาร์ทเซิร์ฟเวอร์ —
            ดูรายละเอียดใน `docs/SETUP.md`
          </p>
        </section>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-3 text-textSecondary">
          <LoadingSpinner size="md" label="กำลังโหลดการตั้งค่า" />
          <span className="text-sm">กำลังโหลดการตั้งค่า…</span>
        </div>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="font-medium text-error">{error}</p>
          <Button
            type="button"
            className="mt-3"
            size="touch"
            onClick={() => void load()}
          >
            ลองใหม่
          </Button>
        </section>
      ) : null}

      {info ? (
        <>
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-textPrimary">
              บัญชีผู้ดูแล
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-textSecondary">อีเมลที่เข้าสู่ระบบ</dt>
                <dd className="font-medium text-textPrimary">
                  {info.adminUserEmail ?? "—"}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-textSecondary">บทบาทใน Auth</dt>
                <dd className="font-medium text-textPrimary">
                  {info.adminRole ?? "ไม่ระบุ (ใช้ allowlist อีเมล)"}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="text-textSecondary">อีเมลแอดมินใน env</dt>
                <dd className="font-medium text-textPrimary">
                  {info.adminEmailHint ?? "ไม่ได้ตั้ง NEXT_PUBLIC_ADMIN_EMAIL"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-textPrimary">
              สถานะระบบ
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill
                ok={info.supabaseConfigured}
                label={
                  info.supabaseConfigured
                    ? "Supabase พร้อม"
                    : "Supabase ยังไม่พร้อม"
                }
              />
              <StatusPill
                ok={info.serviceRoleConfigured}
                label={
                  info.serviceRoleConfigured
                    ? "Service role พร้อม"
                    : "ยังไม่มี service role"
                }
              />
              <StatusPill
                ok={canWrite}
                label={canWrite ? "แก้ไข/ลบได้" : "ยังเขียนข้อมูลไม่ได้"}
              />
            </div>

            {!canWrite ? (
              <div className="mt-4 flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-textPrimary">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <div className="space-y-1">
                  <p className="font-medium">ยังแก้/ลบข้อมูลบนเซิร์ฟเวอร์ไม่ได้</p>
                  <p className="text-textSecondary">
                    เลือกอย่างน้อยหนึ่งอย่าง: ใส่{" "}
                    <code className="rounded bg-surface px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
                    ใน env ฝั่งเซิร์ฟเวอร์ หรือตั้ง{" "}
                    <code className="rounded bg-surface px-1">app_metadata.role = admin</code>{" "}
                    ใน Supabase Auth แล้วรัน{" "}
                    <code className="rounded bg-surface px-1">
                      supabase/migrations/008_admin_write.sql
                    </code>
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-textSecondary">
                {info.canWriteViaServiceRole
                  ? "เขียนข้อมูลผ่าน service role (แนะนำ)"
                  : "เขียนข้อมูลผ่าน JWT role=admin ตาม RLS"}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-textPrimary">
              การแสดงผลตาราง
            </h2>
            <p className="mt-1 text-sm text-textSecondary">
              จำนวนแถวสูงสุดที่แสดงในหน้าผลคะแนน (บันทึกในเบราว์เซอร์นี้)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[25, 50, 100, 200].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => saveLimit(n)}
                  className={cn(
                    "min-h-11 rounded-lg border px-4 text-sm font-medium",
                    resultsLimit === n
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-textSecondary hover:text-textPrimary"
                  )}
                >
                  {n} แถว
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-textPrimary">
              จัดการข้อมูล
            </h2>
            <p className="mt-1 text-sm text-textSecondary">
              แก้ไขชื่อ/ชั้น/อายุ/คะแนน หรือลบผลคะแนน / ลบผู้เรียนได้จากตารางผลคะแนน
            </p>
            <Button
              render={<Link href="/admin?tab=results" />}
              nativeButton={false}
              className="mt-4"
              size="touch"
            >
              ไปที่ตารางผลคะแนน
            </Button>
          </section>
        </>
      ) : null}
    </div>
  );
}
