"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppRouter } from "@/hooks/useAppRouter";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminSession } from "@/lib/auth-roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useAppRouter();
  const isLogin = pathname === "/admin/login";
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    if (isLogin || !isSupabaseConfigured()) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const onAdminRoute = pathname.startsWith("/admin");

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && onAdminRoute) {
        router.replace("/admin/login");
        return;
      }
      if (session && onAdminRoute && !isAdminSession(session)) {
        void supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }
      setAdminEmail(session?.user.email ?? null);
    });
  }, [isLogin, pathname, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  const logout = async () => {
    const supabase = getSupabase();
    await supabase?.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/admin"
            className="font-heading text-sm font-bold text-textPrimary hover:text-primary"
          >
            Anatomy of Vapes — ผู้ดูแล
          </Link>
          {adminEmail ? (
            <p className="truncate text-xs text-textSecondary">{adminEmail}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="ออกจากระบบ"
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
