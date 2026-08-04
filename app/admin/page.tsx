"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  LogOut,
  Download,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { ResultsTable } from "@/components/dashboard/ResultsTable";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Button } from "@/components/ui/button";
import { getAdminStats, type AdminStats } from "@/lib/db";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Tab = "overview" | "results" | "export";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const result = await getAdminStats();
    if ("error" in result) {
      toast.error(result.error);
      if (result.error.includes("เข้าสู่ระบบ")) {
        router.replace("/admin/login");
      }
    } else {
      setStats(result);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const logout = async () => {
    const supabase = getSupabase();
    await supabase?.auth.signOut();
    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background text-textSecondary">
        กำลังโหลดแดชบอร์ด...
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-textPrimary">
          ยังไม่ได้ตั้งค่า Supabase
        </h1>
        <p className="text-sm text-textSecondary">
          คัดลอก `.env.example` เป็น `.env.local` ใส่ URL/anon key
          แล้วรัน SQL ใน `supabase/migrations/001_init.sql`
          จากนั้นสร้างผู้ใช้ Auth สำหรับแอดมิน
        </p>
        <Button render={<Link href="/admin/login" />} nativeButton={false}>
          ไปหน้า Login
        </Button>
      </div>
    );
  }

  const rows = stats?.results ?? [];

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface p-4 md:flex md:flex-col">
        <p className="font-heading text-lg font-bold text-textPrimary">Admin</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          <SideLink
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            icon={<BarChart3 className="size-4" />}
            label="Overview"
          />
          <SideLink
            active={tab === "results"}
            onClick={() => setTab("results")}
            icon={<Users className="size-4" />}
            label="Test Results"
          />
          <SideLink
            active={tab === "export"}
            onClick={() => setTab("export")}
            icon={<Download className="size-4" />}
            label="Export Data"
          />
          <span className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-textDisabled">
            <Settings className="size-4" />
            Settings
          </span>
        </nav>
        <Button
          type="button"
          variant="outline"
          className="mt-auto rounded-xl"
          onClick={() => void logout()}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
          <div>
            <h1 className="font-heading text-xl font-bold text-textPrimary">
              Dashboard
            </h1>
            <p className="text-sm text-textSecondary">
              สรุปผลผู้เรียน Anatomy of Vapes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton rows={rows} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="ออกจากระบบ"
              onClick={() => void logout()}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {(
            [
              ["overview", "Overview"],
              ["results", "Results"],
              ["export", "Export"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                tab === id
                  ? "bg-primary text-white"
                  : "bg-card text-textSecondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <main className="flex-1 space-y-6 p-4 sm:p-6">
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
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold text-textPrimary">
                Export ข้อมูล
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
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
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
