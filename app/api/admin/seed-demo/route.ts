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

const bodySchema = z.object({
  count: z.number().int().min(1).max(50),
});

const NICKNAMES = [
  "ต้นไม้",
  "ฟ้าใส",
  "น้ำหวาน",
  "ข้าวหอม",
  "เดือนเพ็ญ",
  "สายลม",
  "ดาวเหนือ",
  "ก้อนเมฆ",
  "แสงอรุณ",
  "ใบไม้",
  "ทะเล",
  "ภูเขา",
  "รุ้งกินน้ำ",
  "ดาวตก",
  "สายฝน",
] as const;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function demoNickname(index: number) {
  const base = pick(NICKNAMES);
  const tag = String(index + 1).padStart(2, "0");
  const name = `${base}${tag}`;
  return name.length <= 20 ? name : `เดโม${tag}`;
}

export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const synced = await ensureAdminAllowlist(auth.accessToken, auth.user.email);
  if ("error" in synced) {
    return NextResponse.json({ error: synced.error }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "เลือกจำนวน 1–50 รายการ" },
      { status: 400 }
    );
  }

  const { count } = parsed.data;
  const db = adminDbClient(auth.accessToken);
  const created: { userId: string; nickname: string; pre: number; post: number }[] =
    [];

  for (let i = 0; i < count; i++) {
    const userId = crypto.randomUUID();
    const nickname = demoNickname(i);
    const grade = pick(gradeOptions);
    const ageRange = pick(ageRangeOptions);
    const pre = randomInt(0, 4);
    const post = Math.min(5, pre + randomInt(0, 3));

    const { error: userError } = await db.from("users").insert({
      id: userId,
      nickname,
      grade,
      age_range: ageRange,
      user_type: "guest",
      email: null,
    });

    if (userError) {
      return NextResponse.json(
        {
          error: adminWriteDeniedMessage(userError.message, userError.code),
          created: created.length,
        },
        { status: 400 }
      );
    }

    const { error: consentError } = await db.from("consent").insert({
      user_id: userId,
      accepted: true,
    });

    if (consentError) {
      await db.from("users").delete().eq("id", userId);
      return NextResponse.json(
        {
          error: adminWriteDeniedMessage(
            consentError.message,
            consentError.code
          ),
          created: created.length,
        },
        { status: 400 }
      );
    }

    const { error: resultError } = await db.from("quiz_results").insert({
      user_id: userId,
      pre_score: pre,
      post_score: post,
      pre_total: 5,
      post_total: 5,
      flow_type: "full",
    });

    if (resultError) {
      await db.from("users").delete().eq("id", userId);
      return NextResponse.json(
        {
          error: adminWriteDeniedMessage(resultError.message, resultError.code),
          created: created.length,
        },
        { status: 400 }
      );
    }

    created.push({ userId, nickname, pre, post });
  }

  return NextResponse.json({
    ok: true,
    created: created.length,
    samples: created.slice(0, 5),
  });
}
