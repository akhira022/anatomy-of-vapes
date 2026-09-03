import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-api-auth";
import {
  adminDbClient,
  adminWriteDeniedMessage,
  ensureAdminAllowlist,
} from "@/lib/admin-db";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** Delete a quiz result row (answers cascade). Learner profile remains. */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const synced = await ensureAdminAllowlist(auth.accessToken, auth.user.email);
  if ("error" in synced) {
    return NextResponse.json({ error: synced.error }, { status: 400 });
  }

  const { id: resultId } = await params;
  if (!z.string().uuid().safeParse(resultId).success) {
    return NextResponse.json({ error: "รหัสผลคะแนนไม่ถูกต้อง" }, { status: 400 });
  }

  const db = adminDbClient(auth.accessToken);
  const { error } = await db.rpc("admin_delete_result", {
    p_result_id: resultId,
  });
  if (error) {
    return NextResponse.json(
      { error: adminWriteDeniedMessage(error.message, error.code) },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
