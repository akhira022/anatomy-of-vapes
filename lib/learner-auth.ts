import { authErrorMessage } from "@/lib/auth-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function signUpLearner(
  email: string,
  password: string
): Promise<
  | { userId: string; needsEmailConfirmation: boolean }
  | { error: string }
> {
  if (!isSupabaseConfigured()) {
    return { error: "การสมัครด้วยอีเมลต้องเชื่อมต่อ Supabase" };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { role: "learner" },
    },
  });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  if (!data.user) {
    return { error: "ลงทะเบียนไม่สำเร็จ" };
  }

  return {
    userId: data.user.id,
    needsEmailConfirmation: !data.session,
  };
}

export async function signInLearner(
  email: string,
  password: string
): Promise<{ userId: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "การเข้าสู่ระบบด้วยอีเมลต้องเชื่อมต่อ Supabase" };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: authErrorMessage(error.message) };
  }

  if (!data.user) {
    return { error: "เข้าสู่ระบบไม่สำเร็จ" };
  }

  return { userId: data.user.id };
}

export async function signOutLearner(): Promise<void> {
  const supabase = getSupabase();
  await supabase?.auth.signOut();
}
