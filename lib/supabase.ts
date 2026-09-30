import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DbGrade =
  | "มัธยมศึกษาตอนต้น"
  | "มัธยมศึกษาตอนปลาย"
  | "ปวช"
  | "ปวส"
  | "นักศึกษา"
  | "อื่นๆ";

export type DbAgeRange = "13-15" | "16-18" | "19-24" | "25+";

export type DbUserType = "member" | "guest";

export type DbFlowType = "full" | "guest";

export interface DbUser {
  id: string;
  nickname: string;
  grade: DbGrade;
  age_range?: DbAgeRange | null;
  user_type?: DbUserType;
  email?: string | null;
  created_at: string;
}

export interface DbConsent {
  id: string;
  user_id: string;
  accepted: boolean;
  created_at: string;
}

export interface DbQuizResult {
  id: string;
  user_id: string;
  pre_score: number;
  post_score: number;
  improvement: number;
  pre_total: number;
  post_total: number;
  flow_type?: DbFlowType;
  created_at: string;
}

export type DbQuizType = "pretest" | "posttest";

export interface DbQuizAnswer {
  id: string;
  quiz_result_id: string;
  quiz_type: DbQuizType;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  created_at: string;
}

const PLACEHOLDER_URLS = new Set([
  "",
  "https://your-project.supabase.co",
  "https://YOUR-PROJECT-REF.supabase.co",
]);

const PLACEHOLDER_KEYS = new Set(["", "your-anon-key"]);

/** Retired project host still stored in the Vercel production env. */
const RETIRED_SUPABASE_HOST = "crpgtvruybetzmjilgvl.supabase.co";
const CURRENT_SUPABASE_URL = "https://xbjzdfstiosxcthxusxv.supabase.co";

/** Use the current project when Vercel still points at the retired host. */
export function resolveSupabaseUrl(raw?: string | null): string | undefined {
  const url = raw?.trim();
  if (!url) return undefined;
  try {
    if (new URL(url).host === RETIRED_SUPABASE_HOST) return CURRENT_SUPABASE_URL;
  } catch {
    return url;
  }
  return url;
}

const supabaseUrl = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (PLACEHOLDER_URLS.has(supabaseUrl)) return false;
  if (supabaseUrl.includes("YOUR-PROJECT-REF")) return false;
  if (PLACEHOLDER_KEYS.has(supabaseAnonKey)) return false;
  if (supabaseAnonKey.startsWith("your-")) return false;
  return true;
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return client;
}
