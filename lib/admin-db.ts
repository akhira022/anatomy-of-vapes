import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export function adminUserClient(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Prefer service-role client; otherwise the caller's JWT client. */
export function adminDbClient(accessToken: string): SupabaseClient {
  return getSupabaseAdmin() ?? adminUserClient(accessToken);
}

/**
 * Sync NEXT_PUBLIC_ADMIN_EMAIL into app_config when the signed-in user matches.
 * Enables is_admin() / write RPCs without service role or Auth role metadata.
 * When service role is configured, sync failure is non-fatal (writes use service role).
 */
export async function ensureAdminAllowlist(
  accessToken: string,
  userEmail: string | null | undefined
): Promise<{ ok: true } | { error: string }> {
  const hint = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  const email = userEmail?.trim().toLowerCase();
  if (!hint || !email || hint !== email) {
    return { ok: true };
  }

  const db = adminUserClient(accessToken);
  const { error } = await db.rpc("sync_admin_email", { p_email: hint });
  if (error) {
    if (isSupabaseAdminConfigured()) {
      return { ok: true };
    }
    if (
      error.message.includes("sync_admin_email") ||
      error.code === "PGRST202" ||
      error.message.includes("Could not find the function")
    ) {
      return {
        error:
          "ยังไม่ได้รัน migration 009 — รัน supabase/migrations/009_admin_allowlist_writes.sql ใน Supabase SQL Editor",
      };
    }
    return { error: error.message };
  }
  return { ok: true };
}

export function adminWriteDeniedMessage(message: string, code?: string) {
  if (
    message.includes("permission") ||
    message.includes("forbidden") ||
    code === "42501"
  ) {
    return "ไม่มีสิทธิ์แก้ไข — ตรวจว่า NEXT_PUBLIC_ADMIN_EMAIL ตรงกับอีเมลที่ล็อกอิน และรัน migration 009 (หรือตั้ง SUPABASE_SERVICE_ROLE_KEY / role=admin)";
  }
  if (
    message.includes("sync_admin_email") ||
    message.includes("admin_update_learner") ||
    message.includes("admin_delete") ||
    code === "PGRST202"
  ) {
    return "ยังไม่ได้รัน migration 009 — รัน supabase/migrations/009_admin_allowlist_writes.sql ใน Supabase SQL Editor";
  }
  return message;
}
