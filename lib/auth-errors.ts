/** Map Supabase auth errors to Thai messages. */
export function authErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  if (lower.includes("user already registered")) {
    return "อีเมลนี้ถูกใช้แล้ว";
  }
  if (lower.includes("password should be at least")) {
    return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  }
  if (lower.includes("unable to validate email")) {
    return "รูปแบบอีเมลไม่ถูกต้อง";
  }
  if (lower.includes("too many requests")) {
    return "ลองใหม่อีกครั้งในอีกสักครู่";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจการเชื่อมต่ออินเทอร์เน็ต";
  }
  return "เข้าสู่ระบบไม่สำเร็จ — ลองใหม่อีกครั้ง";
}

/** @deprecated Use authErrorMessage */
export const adminAuthErrorMessage = authErrorMessage;
