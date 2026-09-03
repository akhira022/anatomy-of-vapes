import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api-auth";
import { ensureAdminAllowlist } from "@/lib/admin-db";
import { isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

/** Admin settings / capability probe (no secrets returned). */
export async function GET(request: Request) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminEmailHint =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() || null;
  const userEmail = auth.user.email?.trim().toLowerCase() ?? null;
  const jwtRole =
    (typeof auth.user.app_metadata?.role === "string" &&
      auth.user.app_metadata.role) ||
    (typeof auth.user.user_metadata?.role === "string" &&
      auth.user.user_metadata.role) ||
    null;

  const synced = await ensureAdminAllowlist(auth.accessToken, auth.user.email);
  const allowlistReady = !("error" in synced);
  const allowlistError = "error" in synced ? synced.error : null;
  const emailAllowlisted = Boolean(
    adminEmailHint && userEmail && adminEmailHint === userEmail
  );

  const canWriteViaJwtRole = jwtRole === "admin";
  const canWriteViaServiceRole = isSupabaseAdminConfigured();
  const canWriteViaAllowlist = allowlistReady && emailAllowlisted;
  const canWrite =
    canWriteViaServiceRole || canWriteViaJwtRole || canWriteViaAllowlist;

  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: canWriteViaServiceRole,
    adminEmailHint,
    adminUserEmail: userEmail,
    adminRole: jwtRole,
    canWriteViaServiceRole,
    canWriteViaJwtRole,
    canWriteViaAllowlist,
    canWrite,
    allowlistError,
    migrationHint: allowlistError,
  });
}
