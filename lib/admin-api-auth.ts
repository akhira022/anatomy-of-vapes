import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { isAdminSession } from "@/lib/auth-roles";
import { isSupabaseConfigured } from "@/lib/supabase";

function sessionFromUser(user: User, accessToken: string): Session {
  return {
    access_token: accessToken,
    refresh_token: "",
    expires_in: 0,
    expires_at: 0,
    token_type: "bearer",
    user,
  };
}

/**
 * Verify the request Authorization bearer token belongs to an admin.
 * Returns the user on success, or an error payload for NextResponse.json.
 */
export async function requireAdminRequest(request: Request): Promise<
  | { user: User; accessToken: string }
  | { error: string; status: number }
> {
  if (!isSupabaseConfigured()) {
    return { error: "ยังไม่ได้ตั้งค่า Supabase", status: 503 };
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match?.[1]) {
    return { error: "กรุณาเข้าสู่ระบบผู้ดูแล", status: 401 };
  }

  const accessToken = match[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    return { error: "เซสชันหมดอายุหรือไม่ถูกต้อง", status: 401 };
  }

  if (!isAdminSession(sessionFromUser(data.user, accessToken))) {
    return { error: "บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล", status: 403 };
  }

  return { user: data.user, accessToken };
}
