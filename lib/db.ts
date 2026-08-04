import { getSupabase, isSupabaseConfigured, type DbGrade } from "@/lib/supabase";

export async function createUser(input: {
  nickname: string;
  grade: DbGrade;
}): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: `local-${crypto.randomUUID()}` };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ nickname: input.nickname, grade: input.grade })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "ไม่สามารถบันทึกผู้ใช้ได้" };
  }
  return { id: data.id as string };
}

export async function saveConsent(
  userId: string,
  accepted: boolean
): Promise<{ ok: true } | { error: string }> {
  if (userId.startsWith("local-") || !isSupabaseConfigured()) {
    return { ok: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("consent").insert({
    user_id: userId,
    accepted,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function saveQuizResult(input: {
  userId: string;
  preScore: number;
  postScore: number;
  preTotal?: number;
  postTotal?: number;
}): Promise<{ id: string } | { error: string }> {
  if (input.userId.startsWith("local-") || !isSupabaseConfigured()) {
    return { id: `local-result-${crypto.randomUUID()}` };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { id: `local-result-${crypto.randomUUID()}` };
  }

  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      user_id: input.userId,
      pre_score: input.preScore,
      post_score: input.postScore,
      pre_total: input.preTotal ?? 5,
      post_total: input.postTotal ?? 5,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "ไม่สามารถบันทึกผลคะแนนได้" };
  }
  return { id: data.id as string };
}

export interface AdminResultRow {
  id: string;
  user_id: string;
  nickname: string;
  grade: string;
  pre_score: number;
  post_score: number;
  improvement: number;
  pre_total: number;
  post_total: number;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  avgPreScore: number;
  avgPostScore: number;
  avgImprovement: number;
  results: AdminResultRow[];
}

export async function getAdminStats(): Promise<
  AdminStats | { error: string }
> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase" };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "กรุณาเข้าสู่ระบบผู้ดูแล" };
  }

  const { count: totalUsers, error: usersError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (usersError) return { error: usersError.message };

  const { data: plain, error: plainError } = await supabase
    .from("quiz_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (plainError || !plain) {
    return { error: plainError?.message ?? "โหลดผลคะแนนไม่สำเร็จ" };
  }

  const userIds = [...new Set(plain.map((r) => r.user_id as string))];
  const { data: users } = await supabase
    .from("users")
    .select("id, nickname, grade")
    .in("id", userIds);

  const userMap = new Map(
    (users ?? []).map((u) => [u.id as string, u as { id: string; nickname: string; grade: string }])
  );

  const rows: AdminResultRow[] = plain.map((r) => {
    const u = userMap.get(r.user_id as string);
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      nickname: u?.nickname ?? "-",
      grade: u?.grade ?? "-",
      pre_score: r.pre_score as number,
      post_score: r.post_score as number,
      improvement: r.improvement as number,
      pre_total: (r.pre_total as number) ?? 5,
      post_total: (r.post_total as number) ?? 5,
      created_at: r.created_at as string,
    };
  });

  return summarize(totalUsers ?? 0, rows);
}

function summarize(totalUsers: number, results: AdminResultRow[]): AdminStats {
  const n = results.length || 1;
  const avgPreScore =
    results.reduce((s, r) => s + (r.pre_score / r.pre_total) * 100, 0) /
    (results.length ? n : 1);
  const avgPostScore =
    results.reduce((s, r) => s + (r.post_score / r.post_total) * 100, 0) /
    (results.length ? n : 1);
  const avgImprovement =
    results.reduce((s, r) => s + r.improvement, 0) / (results.length ? n : 1);

  return {
    totalUsers,
    avgPreScore: results.length ? Math.round(avgPreScore) : 0,
    avgPostScore: results.length ? Math.round(avgPostScore) : 0,
    avgImprovement: results.length ? Math.round(avgImprovement * 10) / 10 : 0,
    results,
  };
}
