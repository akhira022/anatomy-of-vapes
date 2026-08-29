"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/useAppRouter";
import {
  BarChart3,
  Download,
  RefreshCw,
  Users,
} from "lucide-react";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { StatCard } from "@/components/dashboard/StatCard";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { getAdminStats, type AdminStats } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Tab = "overview" | "results" | "export";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "ภาพรวม", icon: <BarChart3 className="size-4" /> },
  { id: "results", label: "ผลคะแนน", icon: <Users className="size-4" /> },
  { id: "export", label: "ส่งออกข้อมูล", icon: <Download className="size-4" /> },
];

export function AdminDashboard() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "results" || tabParam === "export" ? tabParam : "overview";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const setTabWithUrl = useCallback(
    (next: Tab) => {
      setTab(next);
      const query = next === "overview" ? "" : `?tab=${next}`;
      router.replace(`/admin${query}`);
    },
    [router]
  );

  useEffect(() => {
    const param = searchParams.get("tab");
    if (param === "results" || param === "export" || param === "overview") {
      setTab(param === "overview" ? "overview" : param);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const result = await getAdminStats();
    if ("error" in result) {
      setFetchError(result.error);
      setStats(null);
    } else {
      setStats(result);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col bg-background">
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 text-textSecondary">
            <LoadingSpinner size="md" label="กำลังโหลดแดชบอร์ด" />
            <span className="text-sm">กำลังโหลดแดชบอร์ด…</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-10 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          ยังไม่ได้ตั้งค่า Supabase
        </h1>
        <p className="text-sm text-textSecondary">
          คัดลอก `.env.example` เป็น `.env.local` ใส่ URL/anon key จริง
          แล้วรัน SQL ใน `supabase/migrations/001_init.sql`
          จากนั้นสร้างผู้ใช้ Auth สำหรับแอดมิน — ดูรายละเอียดใน `docs/SETUP.md`
        </p>
        <Button render={<Link href="/admin/login" />} nativeButton={false}>
          ไปหน้าเข้าสู่ระบบ
        </Button>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 py-10 text-center sm:px-6">
        <h1 className="font-heading text-xl font-bold text-textPrimary">
          โหลดข้อมูลไม่สำเร็จ
        </h1>
        <p className="text-sm text-error">{fetchError}</p>
        <Button type="button" size="touch" onClick={() => void load()}>
          <RefreshCw className="size-4" />
          ลองใหม่
        </Button>
      </div>
    );
  }

  const rows = stats?.results ?? [];

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface p-4 md:flex md:flex-col">
        <p className="font-heading text-lg font-bold text-textPrimary">
          แดชบอร์ด
        </p>
        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="เมนูแอดมิน">
          {tabs.map(({ id, label, icon }) => (
            <SideLink
              key={id}
              active={tab === id}
              onClick={() => setTabWithUrl(id)}
              icon={icon}
              label={label}
            />
          ))}
        </nav>
        <p className="mt-4 rounded-lg border border-border bg-card px-3 py-2 text-xs text-textSecondary">
          การตั้งค่าระบบ — เร็ว ๆ นี้
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-textPrimary">
              แดชบอร์ดผู้ดูแล
            </h1>
            <p className="text-sm text-textSecondary">
              สรุปผลผู้เรียน Anatomy of Vapes
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <ExportButton rows={rows} />
          </div>
        </header>

        <div
          role="tablist"
          aria-label="แท็บแดชบอร์ด"
          className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTabWithUrl(id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full px-3 py-2 text-sm",
                tab === id
                  ? "bg-primary text-white"
                  : "bg-card text-textSecondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <main id="main-content" className="flex-1 space-y-6 p-4 sm:p-6">
          {(tab === "overview" || tab === "export") && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="ผู้ใช้ทั้งหมด"
                value={`${stats?.totalUsers ?? 0}`}
                hint="คน"
                icon="users"
              />
              <StatCard
                label="ค่าเฉลี่ยก่อนเรียน"
                value={`${stats?.avgPreScore ?? 0}%`}
                icon="pre"
              />
              <StatCard
                label="ค่าเฉลี่ยหลังเรียน"
                value={`${stats?.avgPostScore ?? 0}%`}
                icon="post"
              />
              <StatCard
                label="ค่าเฉลี่ยพัฒนาการ"
                value={`${stats?.avgImprovement ?? 0}`}
                hint="คะแนน"
                icon="improve"
              />
            </div>
          )}

          {(tab === "overview" || tab === "results") && (
            <section>
              <h2 className="mb-3 font-heading text-lg font-semibold text-textPrimary">
                ผลลัพธ์ล่าสุด
              </h2>
              <ResultsTable rows={rows} />
            </section>
          )}

          {tab === "export" && (
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold text-textPrimary">
                ส่งออกข้อมูล
              </h2>
              <p className="mt-2 text-sm text-textSecondary">
                ดาวน์โหลดผลคะแนนเป็นไฟล์ CSV สำหรับวิเคราะห์ต่อ
              </p>
              <div className="mt-4">
                <ExportButton rows={rows} />
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function SideLink({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-textSecondary hover:bg-card hover:text-textPrimary"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
