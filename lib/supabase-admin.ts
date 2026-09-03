import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase";

const PLACEHOLDER_KEYS = new Set(["", "your-service-role-key"]);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

/** True when a real service-role key is configured (server-only). */
export function isSupabaseAdminConfigured(): boolean {
  if (!isSupabaseConfigured()) return false;
  if (!serviceRoleKey) return false;
  if (PLACEHOLDER_KEYS.has(serviceRoleKey)) return false;
  if (serviceRoleKey.startsWith("your-")) return false;
  return true;
}

let adminClient: SupabaseClient | null = null;

/** Server-only Supabase client that bypasses RLS. Never import into client components. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
