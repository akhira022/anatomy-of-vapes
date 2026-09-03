import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-api-auth";
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

  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured(),
    serviceRoleConfigured: isSupabaseAdminConfigured(),
    adminEmailHint,
    adminUserEmail: auth.user.email ?? null,
    adminRole:
      (typeof auth.user.app_metadata?.role === "string" &&
        auth.user.app_metadata.role) ||
      (typeof auth.user.user_metadata?.role === "string" &&
        auth.user.user_metadata.role) ||
      null,
    canWriteViaServiceRole: isSupabaseAdminConfigured(),
    canWriteViaJwtRole:
      auth.user.app_metadata?.role === "admin" ||
      auth.user.user_metadata?.role === "admin",
  });
}
