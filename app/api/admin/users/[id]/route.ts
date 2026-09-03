import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-api-auth";
import {
  adminDbClient,
  adminWriteDeniedMessage,
  ensureAdminAllowlist,
} from "@/lib/admin-db";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

  const serviceRole = Boolean(getSupabaseAdmin());
  const db = adminDbClient(auth.accessToken);

  // Service role bypasses RLS with direct writes. JWT path uses allowlist RPCs
  // (or RLS after migration 009 updates is_admin()).
  if (serviceRole) {
    const userPatch: Record<string, unknown> = {};
    if (data.nickname !== undefined) userPatch.nickname = data.nickname;
    if (data.grade !== undefined) userPatch.grade = data.grade;
    if (data.age_range !== undefined) userPatch.age_range = data.age_range;
    if (data.email !== undefined) {
      const trimmed = data.email.trim();
      userPatch.email = trimmed ? trimmed.toLowerCase() : null;
    }

    if (Object.keys(userPatch).length > 0) {
      const { error } = await db.from("users").update(userPatch).eq("id", userId);
      if (error) {
        return NextResponse.json(
          { error: adminWriteDeniedMessage(error.message, error.code) },
          { status: 400 }
        );
      }
    }

    if (data.result_id) {
      const resultPatch: Record<string, unknown> = {};
      if (data.pre_score !== undefined) resultPatch.pre_score = data.pre_score;
      if (data.post_score !== undefined) resultPatch.post_score = data.post_score;
      if (data.pre_total !== undefined) resultPatch.pre_total = data.pre_total;
      if (data.post_total !== undefined) resultPatch.post_total = data.post_total;

      if (Object.keys(resultPatch).length > 0) {
        const { error } = await db
          .from("quiz_results")
          .update(resultPatch)
          .eq("id", data.result_id)
          .eq("user_id", userId);
        if (error) {
          return NextResponse.json(
            { error: adminWriteDeniedMessage(error.message, error.code) },
            { status: 400 }
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  }

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

  const serviceRole = Boolean(getSupabaseAdmin());
  const db = adminDbClient(auth.accessToken);

  if (serviceRole) {
    const { error } = await db.from("users").delete().eq("id", userId);
    if (error) {
      return NextResponse.json(
        { error: adminWriteDeniedMessage(error.message, error.code) },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

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
