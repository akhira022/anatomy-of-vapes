import type { Session, User } from "@supabase/supabase-js";

function roleFromUser(user: User | null | undefined): string | null {
  if (!user) return null;
  const appRole = user.app_metadata?.role;
  if (typeof appRole === "string" && appRole.trim()) return appRole.trim();
  const userRole = user.user_metadata?.role;
  if (typeof userRole === "string" && userRole.trim()) return userRole.trim();
  return null;
}

/** True when the Supabase session belongs to an admin (not a learner). */
export function isAdminSession(session: Session | null): boolean {
  const user = session?.user;
  if (!user?.email) return false;

  const role = roleFromUser(user);
  if (role === "admin") return true;
  if (role === "learner") return false;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && user.email.toLowerCase() === adminEmail) return true;

  return false;
}
