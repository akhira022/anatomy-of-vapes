import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DbGrade = "ป.4" | "ป.5" | "ป.6" | "ม.1" | "ม.2" | "ม.3";

export interface DbUser {
  id: string;
  nickname: string;
  grade: DbGrade;
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
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return client;
}
