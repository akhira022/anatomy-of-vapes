import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-api-auth";
import {
  adminDbClient,
  adminWriteDeniedMessage,
  ensureAdminAllowlist,
} from "@/lib/admin-db";
import { ageRangeOptions, gradeOptions } from "@/lib/validations";

export const runtime = "nodejs";

const updateSchema = z.object({
  nickname: z.string().trim().min(2).max(20).optional(),
  grade: z.enum(gradeOptions).optional(),
  age_range: z.enum(ageRangeOptions).nullable().optional(),
  email: z.string().trim().optional(),
  pre_score: z.number().int().min(0).optional(),
  post_score: z.number().int().min(0).optional(),
  pre_total: z.number().int().min(1).optional(),
  post_total: z.number().int().min(0).optional(),
  result_id: z.string().uuid().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const synced = await ensureAdminAllowlist(auth.accessToken, auth.user.email);
  if ("error" in synced) {
    return NextResponse.json({ error: synced.error }, { status: 400 });
  }

  const { id: userId } = await params;
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: "รหัสผู้ใช้ไม่ถูกต้อง" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (data.email !== undefined) {
    const trimmed = data.email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: "อีเมลไม่ถูกต้อง" }, { status: 400 });
    }
  }

  const db = adminDbClient(auth.accessToken);
  const { error } = await db.rpc("admin_update_learner", {
    p_user_id: userId,
    p_nickname: data.nickname ?? null,
    p_grade: data.grade ?? null,
    p_age_range: data.age_range ?? null,
    p_clear_age_range: data.age_range === null,
    p_email: data.email?.trim() ?? null,
    p_set_email: data.email !== undefined,
    p_result_id: data.result_id ?? null,
    p_pre_score: data.pre_score ?? null,
    p_post_score: data.post_score ?? null,
    p_pre_total: data.pre_total ?? null,
    p_post_total: data.post_total ?? null,
  });

  if (error) {
    return NextResponse.json(
      { error: adminWriteDeniedMessage(error.message, error.code) },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const synced = await ensureAdminAllowlist(auth.accessToken, auth.user.email);
  if ("error" in synced) {
    return NextResponse.json({ error: synced.error }, { status: 400 });
  }

  const { id: userId } = await params;
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ error: "รหัสผู้ใช้ไม่ถูกต้อง" }, { status: 400 });
  }

  const db = adminDbClient(auth.accessToken);
  const { error } = await db.rpc("admin_delete_learner", {
    p_user_id: userId,
  });
  if (error) {
    return NextResponse.json(
      { error: adminWriteDeniedMessage(error.message, error.code) },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
