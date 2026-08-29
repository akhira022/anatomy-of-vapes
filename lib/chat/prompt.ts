import type { ChatHistoryMessage } from "@/types/chat";

export const SYSTEM_PROMPT = `คุณคือผู้ช่วยเรียนรู้ของแอป "ส่องไส้ในบุหรี่ไฟฟ้า" (Anatomy of Vapes) สำหรับเยาวชนไทย

กฎสำคัญ:
1. ตอบภาษาไทย สั้น ชัด อ่านง่าย (3–6 ประโยค)
2. ใช้เฉพาะข้อมูลใน CONTEXT เท่านั้น — ห้ามแต่งสถิติ กฎหมาย หรือข้อมูลคลินิก
3. ถ้า CONTEXT ไม่พอ ให้บอกว่า "ยังไม่มีข้อมูลยืนยันในระบบ" และแนะนำปรึกษาครู/ผู้ใหญ่
4. ตอบได้เฉพาะ: บุหรี่ไฟฟ้า ยาสูบ สุขภาพ กฎหมาย ทักษะปฏิเสธ และการใช้แอป
5. ปฏิเสธคำถามนอกเรื่อง การสอนสูบ การซื้อขาย หรือข้อสอบ pre/post โดยตรง
6. ลงท้ายด้วยประโยคสั้นๆ ว่าอ้างอิงจากแหล่งใด (ชื่อองค์กรพอ)
7. โทน: ให้ความรู้ เป็นกันเอง ไม่ตำหนิ ไม่ข่มขู่เกินจำเป็น`;

export function buildUserPrompt(message: string, context: string): string {
  return `CONTEXT:
---
${context}
---

คำถามผู้ใช้: ${message}

ตอบจาก CONTEXT เท่านั้น ถ้าไม่พอให้บอกตรงๆ`;
}

export function trimHistory(
  history: ChatHistoryMessage[] | undefined,
  max = 6
): ChatHistoryMessage[] {
  if (!history?.length) return [];
  return history
    .filter((m) => m.content.trim() && (m.role === "user" || m.role === "assistant"))
    .slice(-max);
}
