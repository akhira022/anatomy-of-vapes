/** Safari/WebKit: "TypeError: Load failed" — Chrome: "Failed to fetch" */
export function isNetworkFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("load failed") ||
    m.includes("failed to fetch") ||
    m.includes("fetch failed") ||
    m.includes("networkerror") ||
    m.includes("network request failed") ||
    m.includes("could not resolve") ||
    m.includes("enotfound") ||
    m.includes("getaddrinfo")
  );
}

export function networkFailureMessage(): string {
  return "เชื่อมต่อฐานข้อมูลไม่ได้ — ตรวจ Wi‑Fi/VPN หรือ URL ใน .env.local (Supabase อาจถูก pause/ลบ)";
}

export function offlineSessionMessage(): string {
  return "โหมดออฟไลน์ — บันทึกในเครื่องนี้เท่านั้น (ยังเชื่อม Supabase ไม่ได้)";
}

export function errorMessage(err: unknown): string {
  if (err instanceof TypeError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

export function normalizeDbError(err: unknown): string {
  const raw = errorMessage(err);
  if (isNetworkFailure(raw)) return networkFailureMessage();
  return raw;
}
