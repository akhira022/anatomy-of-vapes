import {
  getSupabase,
  isSupabaseConfigured,
  type DbGrade,
  type DbQuizType,
} from "@/lib/supabase";
import type { QuizAnswer } from "@/types";

export async function createUser(input: {
  nickname: string;
  grade: DbGrade;
}): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: `local-${crypto.randomUUID()}` };
  }

  // Client-generated id avoids INSERT…RETURNING which needs SELECT grant on anon.
  const id = crypto.randomUUID();
  const { error } = await supabase.from("users").insert({
    id,
    nickname: input.nickname,
    grade: input.grade,
  });

  if (error) {
    return { error: error.message };
  }
  return { id };
}

export async function findUserByNickname(
  nickname: string
): Promise<
  | { id: string; nickname: string; grade: DbGrade }
  | { error: string }
  | null
> {
  const trimmed = nickname.trim();
  if (!trimmed) return null;

  if (!isSupabaseConfigured()) {
    return {
      error:
        "โหมดออฟไลน์ — session ถูกเก็บในเครื่องนี้แล้ว หากออกจากระบบแล้วให้ลงทะเบียนใหม่",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const { data, error } = await supabase.rpc("find_learner_by_nickname", {
    p_nickname: trimmed,
  });

  if (error) {
    if (
      error.message.includes("find_learner_by_nickname") ||
      error.code === "PGRST202"
    ) {
      return {
        error:
          "ยังไม่ได้รัน migration login — รัน supabase/migrations/005_learner_rpcs.sql",
      };
    }
    return { error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) return null;

  return {
    id: row.id as string,
    nickname: row.nickname as string,
    grade: row.grade as DbGrade,
  };
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

function mapAnswers(
  quizResultId: string,
  quizType: DbQuizType,
  answers: QuizAnswer[]
) {
  return answers.map((a) => ({
    quiz_result_id: quizResultId,
    quiz_type: quizType,
    question_id: a.questionId,
    selected_option_id: a.selectedOptionId,
    is_correct: a.isCorrect,
  }));
}

export async function hasQuizResult(
  userId: string
): Promise<boolean | { error: string }> {
  if (userId.startsWith("local-") || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("learner_has_quiz_result", {
    p_user_id: userId,
  });

  if (error) {
    if (
      error.message.includes("learner_has_quiz_result") ||
      error.code === "PGRST202"
    ) {
      // RPC not installed yet — allow save rather than blocking the learner flow.
      return false;
    }
    return { error: error.message };
  }

  return Boolean(data);
}

export async function saveQuizResult(input: {
  userId: string;
  preScore: number;
  postScore: number;
  preTotal?: number;
  postTotal?: number;
  preAnswers?: QuizAnswer[];
  postAnswers?: QuizAnswer[];
}): Promise<{ id: string; skipped?: boolean } | { error: string }> {
  if (input.userId.startsWith("local-") || !isSupabaseConfigured()) {
    return { id: `local-result-${crypto.randomUUID()}` };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { id: `local-result-${crypto.randomUUID()}` };
  }

  const alreadySaved = await hasQuizResult(input.userId);
  if (typeof alreadySaved === "object" && "error" in alreadySaved) {
    return alreadySaved;
  }
  if (alreadySaved === true) {
    return { id: "already-saved", skipped: true };
  }

  const resultId = crypto.randomUUID();
  const { error } = await supabase.from("quiz_results").insert({
    id: resultId,
    user_id: input.userId,
    pre_score: input.preScore,
    post_score: input.postScore,
    pre_total: input.preTotal ?? 5,
    post_total: input.postTotal ?? 5,
  });

  if (error) {
    return { error: error.message };
  }

  const answerRows = [
    ...mapAnswers(resultId, "pretest", input.preAnswers ?? []),
    ...mapAnswers(resultId, "posttest", input.postAnswers ?? []),
  ];

  if (answerRows.length > 0) {
    const { error: answersError } = await supabase
      .from("quiz_answers")
      .insert(answerRows);

    if (answersError) {
      return { error: answersError.message };
    }
  }

  return { id: resultId };
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

  const { data: rows, error: resultsError } = await supabase
    .from("admin_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (resultsError || !rows) {
    return { error: resultsError?.message ?? "โหลดผลคะแนนไม่สำเร็จ" };
  }

  const results: AdminResultRow[] = rows.map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    nickname: (r.nickname as string) ?? "-",
    grade: (r.grade as string) ?? "-",
    pre_score: r.pre_score as number,
    post_score: r.post_score as number,
    improvement: r.improvement as number,
    pre_total: (r.pre_total as number) ?? 5,
    post_total: (r.post_total as number) ?? 5,
    created_at: r.created_at as string,
  }));

  return summarize(totalUsers ?? 0, results);
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
