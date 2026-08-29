import type { RetrievedChunk } from "@/types/knowledge";

function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function stripLabel(line: string, label: string) {
  const pattern = new RegExp(`^${label}\\s*[:：]\\s*`);
  return line.replace(pattern, "").trim();
}

function sanitizeChunkContent(chunk: RetrievedChunk): string {
  const lines = chunk.content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (chunk.type === "faq") {
    const answer = lines.find((line) => line.startsWith("คำตอบ"));
    if (answer) return stripLabel(answer, "คำตอบ");
  }

  if (chunk.type === "glossary") {
    const definition = lines.filter(
      (line) =>
        !line.startsWith("คำศัพท์") && !line.startsWith("เรียกอีกอย่าง")
    );
    if (definition.length > 0) return definition.join(" ");
  }

  if (chunk.type === "refusal") {
    const situation = lines.find((line) => line.startsWith("สถานการณ์"));
    const tips = lines
      .filter((line) => line.startsWith("เคล็ดลับ"))
      .map((line) => stripLabel(line, "เคล็ดลับ"));
    const parts = [
      situation ? stripLabel(situation, "สถานการณ์") : "",
      ...tips,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }

  const cleaned = lines
    .map((line) =>
      line
        .replace(/^คำศัพท์\s*[:：]\s*/, "")
        .replace(/^คำถาม\s*[:：]\s*/, "")
        .replace(/^คำตอบ\s*[:：]\s*/, "")
        .replace(/^สถานการณ์\s*[:：]\s*/, "")
        .replace(/^เคล็ดลับ\s*[:：]\s*/, "")
        .replace(/^เรียกอีกอย่าง\s*[:：]\s*/, "")
    )
    .filter(Boolean);

  return cleaned.join(" ");
}

/** สรุปคำตอบจาก chunks ที่ retrieve ได้ (ใช้เมื่อ Gemini ไม่พร้อม) */
export function buildLocalAnswer(chunks: RetrievedChunk[]): string {
  if (!chunks.length) {
    return "ยังไม่มีข้อมูลยืนยันในระบบ ลองถามเรื่องส่วนประกอบ ผลเสีย หรือกฎหมายดูนะ";
  }

  const [primary, ...related] = chunks;
  const main = sanitizeChunkContent(primary);
  const parts = [main];

  const extras = related.slice(0, 2).map((chunk) => {
    const snippet = truncate(sanitizeChunkContent(chunk), 100);
    return `• ${chunk.title} — ${snippet}`;
  });

  if (extras.length > 0) {
    parts.push("", "ข้อมูลที่เกี่ยวข้อง:", ...extras);
  }

  return parts.join("\n");
}
