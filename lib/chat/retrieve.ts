import { getKnowledgeChunks } from "@/lib/knowledge/build-chunks";
import type { KnowledgeChunk, RetrievedChunk } from "@/types/knowledge";

const DEFAULT_TOP_K = 5;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  กฎหมาย: [
    "กฎหมาย",
    "ผิดกฎ",
    "โทษ",
    "ปรับ",
    "จำคุก",
    "ขาย",
    "โฆษณา",
    "20 ปี",
    "เยาวชน",
    "โรงเรียน",
    "อย.",
    "นำเข้า",
    "สั่ง",
    "ต่างประเทศ",
    "ศุลกากร",
  ],
  ความเชื่อผิด: [
    "ความเชื่อ",
    "จริงไหม",
    "ปลอดภัยไหม",
    "ไอน้ำ",
    "ปลอดภัยกว่า",
    "myth",
  ],
  ส่วนประกอบ: [
    "ส่วนประกอบ",
    "ชิ้นส่วน",
    "คอยล์",
    "coil",
    "แบต",
    "ปากสูบ",
    "แทงก์",
    "pod",
    "พอต",
    "หน้าที่",
  ],
  ผลเสีย: [
    "อันตราย",
    "ผลเสีย",
    "สุขภาพ",
    "นิโคติน",
    "สารพิษ",
    "ปอด",
    "สมอง",
    "มะเร็ง",
    "เสพติด",
  ],
  ทักษะชีวิต: [
    "เพื่อน",
    "ชวน",
    "ปฏิเสธ",
    "กดดัน",
    "ล้อ",
    "กลั่นแกล้ง",
    "ช่วยเพื่อน",
    "ผู้ปกครอง",
  ],
};

const APP_QUERY_WORDS = [
  "แอป",
  "แอพ",
  "ใช้ยังไง",
  "วิธีใช้",
  "pretest",
  "posttest",
  "pdpa",
  "โมเดล 3d",
  "ลงทะเบียน",
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,.!?;:()"'[\]{}]+/)
    .filter((token) => token.length > 1);
}

function countTokenMatches(queryTokens: string[], target: string): number {
  const normalizedTarget = normalizeText(target);
  let score = 0;

  for (const token of queryTokens) {
    if (normalizedTarget.includes(token)) {
      score += 1;
    }
  }

  return score;
}

/** จับคู่ keyword ภาษาไทยที่ไม่มีเว้นวรรค — ถ้าคำถามมี keyword ให้คะแนน */
function countKeywordInQuery(query: string, keywords: string[]): number {
  const normalizedQuery = normalizeText(query);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword.length < 2) continue;
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += normalizedKeyword.length >= 4 ? 3 : 2;
    }
  }

  return score;
}

function isLikelyGlossaryQuery(query: string): boolean {
  const normalized = normalizeText(query);
  return (
    normalized.includes("คืออะไร") ||
    normalized.includes("หมายถึง") ||
    normalized.includes("แปลว่า") ||
    normalized.length <= 24
  );
}

function isAppQuery(query: string): boolean {
  const normalized = normalizeText(query);
  return APP_QUERY_WORDS.some((word) => normalized.includes(word));
}

function detectCategoryBoost(
  query: string
): Partial<Record<KnowledgeChunk["category"], number>> {
  const normalizedQuery = normalizeText(query);
  const boosts: Partial<Record<KnowledgeChunk["category"], number>> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matched = keywords.some((keyword) =>
      normalizedQuery.includes(keyword)
    );
    if (matched) {
      boosts[category as KnowledgeChunk["category"]] = 2;
    }
  }

  if (
    ["สั่ง", "ต่างประเทศ", "นำเข้า", "ศุลกากร"].some((word) =>
      normalizedQuery.includes(word)
    )
  ) {
    boosts["กฎหมาย"] = (boosts["กฎหมาย"] ?? 0) + 3;
  }

  if (
    ["เพื่อน", "ชวน", "ปฏิเสธ", "ล้อ", "กลั่นแกล้ง"].some((word) =>
      normalizedQuery.includes(word)
    )
  ) {
    boosts["ทักษะชีวิต"] = (boosts["ทักษะชีวิต"] ?? 0) + 3;
  }

  return boosts;
}

function scoreChunk(chunk: KnowledgeChunk, query: string): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return 0;
  }

  const keywordScore =
    countTokenMatches(queryTokens, chunk.keywords.join(" ")) * 3 +
    countKeywordInQuery(query, chunk.keywords) * 2;
  const titleScore =
    countTokenMatches(queryTokens, chunk.title) * 2 +
    countKeywordInQuery(query, [chunk.title]);
  const contentScore = countTokenMatches(queryTokens, chunk.content);
  const categoryBoost = detectCategoryBoost(query)[chunk.category] ?? 0;

  let typeBoost = 0;
  if (chunk.type === "faq") typeBoost += 1;
  if (
    chunk.type === "law" &&
    (query.includes("กฎ") ||
      query.includes("โทษ") ||
      query.includes("สั่ง") ||
      query.includes("นำเข้า"))
  ) {
    typeBoost += 2;
  }
  if (chunk.type === "hotspot" && query.includes("คอยล์")) {
    typeBoost -= 1;
  }
  if (chunk.type === "glossary" && isLikelyGlossaryQuery(query)) {
    typeBoost += 2;
  }
  if (chunk.type === "refusal" && chunk.category === "ทักษะชีวิต") {
    if (
      ["เพื่อน", "ชวน", "ปฏิเสธ", "ยืม", "แชร์"].some((word) =>
        query.includes(word)
      )
    ) {
      typeBoost += 3;
    }
  }
  if (chunk.type === "app" && isAppQuery(query)) {
    typeBoost += 4;
  }
  if (chunk.type === "component" && query.includes("ส่วนประกอบ")) {
    typeBoost += 2;
  }
  if (
    chunk.type === "health" &&
    ["ปอด", "หัวใจ", "สมอง", "ฟัน", "คนรอบข้าง"].some((word) =>
      query.includes(word)
    )
  ) {
    typeBoost += 2;
  }

  return keywordScore + titleScore + contentScore + categoryBoost + typeBoost;
}

export interface RetrieveOptions {
  topK?: number;
  minScore?: number;
}

/** Hybrid keyword retrieval — เลือก chunks ที่เกี่ยวข้องกับคำถาม */
export function retrieveKnowledge(
  query: string,
  options: RetrieveOptions = {}
): RetrievedChunk[] {
  const topK = options.topK ?? DEFAULT_TOP_K;
  const minScore = options.minScore ?? 1;
  const chunks = getKnowledgeChunks();

  const ranked = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, query),
    }))
    .filter((chunk) => chunk.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return chunks
      .filter((chunk) => chunk.type === "faq" || chunk.type === "law")
      .slice(0, 3)
      .map((chunk) => ({ ...chunk, score: 0 }));
  }

  return ranked.slice(0, topK);
}

export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      return [
        `[${index + 1}] ${chunk.title} (${chunk.category})`,
        chunk.content,
        `แหล่งอ้างอิง: ${chunk.sourceIds.join(", ") || "—"}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

/** hotspot ที่เกี่ยวข้องมากที่สุดจากผล retrieval */
export function pickPrimaryHotspotId(
  chunks: RetrievedChunk[]
): string | undefined {
  const withHotspot = chunks.find((chunk) => chunk.hotspotId);
  return withHotspot?.hotspotId;
}
