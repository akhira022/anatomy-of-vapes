import {
  getSupabase,
  isSupabaseConfigured,
  type DbAgeRange,
  type DbFlowType,
  type DbGrade,
  type DbQuizType,
  type DbUserType,
} from "@/lib/supabase";
import {
  isNetworkFailure,
  normalizeDbError,
  offlineSessionMessage,
} from "@/lib/db-errors";
import type { QuizAnswer } from "@/types";

async function runDb<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    return { error: normalizeDbError(err) };
  }
}

export async function createUser(input: {
  nickname: string;
  grade: DbGrade;
  email?: string;
  id?: string;
  ageRange?: DbAgeRange;
  userType?: DbUserType;
}): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { id: `local-${crypto.randomUUID()}` };
  }

  const result = await runDb(async () => {
    const id = input.id ?? crypto.randomUUID();
    const { error } = await supabase.from("users").insert({
      id,
      nickname: input.nickname,
      grade: input.grade,
      user_type: input.userType ?? "member",
      ...(input.email ? { email: input.email.trim().toLowerCase() } : {}),
      ...(input.ageRange ? { age_range: input.ageRange } : {}),
    });

    if (error) throw new Error(error.message);
    return { id };
  });

  if (result && typeof result === "object" && "error" in result) {
    if (isNetworkFailure(result.error)) {
      return { id: `local-${crypto.randomUUID()}` };
    }
    return result;
  }

  return result as { id: string };
}

export type LearnerProfile = {
  id: string;
  nickname: string;
  grade: DbGrade;
  email?: string | null;
  ageRange?: DbAgeRange | null;
  userType?: DbUserType;
};

async function mapLearnerRpcRow(
  row: Record<string, unknown> | null | undefined
): Promise<LearnerProfile | null> {
  if (!row?.id) return null;
  return {
    id: row.id as string,
    nickname: row.nickname as string,
    grade: row.grade as DbGrade,
    email: (row.email as string | null | undefined) ?? null,
    ageRange: (row.age_range as DbAgeRange | null | undefined) ?? null,
    userType: (row.user_type as DbUserType | undefined) ?? "member",
  };
}

export async function findUserByEmail(
  email: string
): Promise<LearnerProfile | { error: string } | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;

  if (!isSupabaseConfigured()) {
    return { error: offlineSessionMessage() };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const result = await runDb(async () => {
    const { data, error } = await supabase.rpc("find_learner_by_email", {
      p_email: trimmed,
    });

    if (error) {
      if (isNetworkFailure(error.message)) {
        return { error: offlineSessionMessage() };
      }
      if (
        error.message.includes("find_learner_by_email") ||
        error.code === "PGRST202"
      ) {
        return {
          error:
            "ยังไม่ได้รัน migration อีเมล — รัน supabase/migrations/006_learner_email.sql",
        };
      }
      return { error: error.message };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return mapLearnerRpcRow(row as Record<string, unknown>);
  });

  if (result && "error" in result) return result;
  return result as LearnerProfile | null;
}

export async function findUserById(
  userId: string
): Promise<LearnerProfile | { error: string } | null> {
  if (!userId) return null;

  if (!isSupabaseConfigured()) {
    return { error: offlineSessionMessage() };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const result = await runDb(async () => {
    const { data, error } = await supabase.rpc("find_learner_by_id", {
      p_user_id: userId,
    });

    if (error) {
      if (isNetworkFailure(error.message)) {
        return { error: offlineSessionMessage() };
      }
      if (
        error.message.includes("find_learner_by_id") ||
        error.code === "PGRST202"
      ) {
        return {
          error:
            "ยังไม่ได้รัน migration อีเมล — รัน supabase/migrations/006_learner_email.sql",
        };
      }
      return { error: error.message };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return mapLearnerRpcRow(row as Record<string, unknown>);
  });

  if (result && "error" in result) return result;
  return result as LearnerProfile | null;
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
    return { error: offlineSessionMessage() };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const result = await runDb(async () => {
    const { data, error } = await supabase.rpc("find_learner_by_nickname", {
      p_nickname: trimmed,
    });

    if (error) {
      if (isNetworkFailure(error.message)) {
        return { error: offlineSessionMessage() };
      }
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
  });

  if (result && "error" in result) return result;
  return result as
    | { id: string; nickname: string; grade: DbGrade }
    | null
    | { error: string };
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

  const result = await runDb(async () => {
    const { error } = await supabase.from("consent").insert({
      user_id: userId,
      accepted,
    });

    if (error) {
      if (isNetworkFailure(error.message)) return { ok: true as const };
      return { error: error.message };
    }
    return { ok: true as const };
  });

  if (result && "error" in result) return result;
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

  const result = await runDb(async () => {
    const { data, error } = await supabase.rpc("learner_has_quiz_result", {
      p_user_id: userId,
    });

    if (error) {
      if (isNetworkFailure(error.message)) return false;
      if (
        error.message.includes("learner_has_quiz_result") ||
        error.code === "PGRST202"
      ) {
        return false;
      }
      throw new Error(error.message);
    }

    return Boolean(data);
  });

  if (result && typeof result === "object" && "error" in result) {
    if (isNetworkFailure(result.error)) return false;
    return result;
  }

  return result as boolean;
}

export async function saveQuizResult(input: {
  userId: string;
  preScore: number;
  postScore: number;
  preTotal?: number;
  postTotal?: number;
  preAnswers?: QuizAnswer[];
  postAnswers?: QuizAnswer[];
  flowType?: DbFlowType;
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
  const flowType = input.flowType ?? "full";
  const { error } = await supabase.from("quiz_results").insert({
    id: resultId,
    user_id: input.userId,
    pre_score: input.preScore,
    post_score: input.postScore,
    pre_total: input.preTotal ?? 5,
    post_total: input.postTotal ?? 5,
    flow_type: flowType,
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

/** Persist guest pretest-only result (no post-test). */
export async function saveGuestPretestResult(input: {
  userId: string;
  preScore: number;
  preTotal?: number;
  preAnswers?: QuizAnswer[];
}): Promise<{ id: string; skipped?: boolean } | { error: string }> {
  return saveQuizResult({
    userId: input.userId,
    preScore: input.preScore,
    postScore: 0,
    preTotal: input.preTotal ?? 5,
    postTotal: 0,
    preAnswers: input.preAnswers ?? [],
    postAnswers: [],
    flowType: "guest",
  });
}

export interface AdminResultRow {
  id: string;
  user_id: string;
  nickname: string;
  email: string | null;
  grade: string;
  age_range: string | null;
  user_type: string;
  flow_type: string;
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
    email: (r.email as string | null) ?? null,
    grade: (r.grade as string) ?? "-",
    age_range: (r.age_range as string | null) ?? null,
    user_type: (r.user_type as string) ?? "member",
    flow_type: (r.flow_type as string) ?? "full",
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
  const fullResults = results.filter((r) => r.flow_type !== "guest" && r.post_total > 0);
  const nFull = fullResults.length || 1;
  const nPre = results.length || 1;
  const avgPreScore =
    results.reduce((s, r) => s + (r.pre_score / r.pre_total) * 100, 0) /
    (results.length ? nPre : 1);
  const avgPostScore =
    fullResults.reduce((s, r) => s + (r.post_score / r.post_total) * 100, 0) /
    (fullResults.length ? nFull : 1);
  const avgImprovement =
    fullResults.reduce((s, r) => s + r.improvement, 0) /
    (fullResults.length ? nFull : 1);

  return {
    totalUsers,
    avgPreScore: results.length ? Math.round(avgPreScore) : 0,
    avgPostScore: fullResults.length ? Math.round(avgPostScore) : 0,
    avgImprovement: fullResults.length
      ? Math.round(avgImprovement * 10) / 10
      : 0,
    results,
  };
}
