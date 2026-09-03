import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireAdminRequest } from "@/lib/admin-api-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function userClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Params = { params: Promise<{ id: string }> };

/** Delete a quiz result row (answers cascade). Learner profile remains. */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: resultId } = await params;
  if (!z.string().uuid().safeParse(resultId).success) {
    return NextResponse.json({ error: "รหัสผลคะแนนไม่ถูกต้อง" }, { status: 400 });
  }

  const db = getSupabaseAdmin() ?? userClient(auth.accessToken);
  const { error } = await db.from("quiz_results").delete().eq("id", resultId);
  if (error) {
    return NextResponse.json(
      {
        error:
          error.message.includes("permission") || error.code === "42501"
            ? "ไม่มีสิทธิ์ลบ — ตั้งค่า SUPABASE_SERVICE_ROLE_KEY หรือใส่ role=admin ใน Auth แล้วรัน migration 008"
            : error.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
