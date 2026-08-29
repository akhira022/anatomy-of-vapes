import { appGuides } from "@/data/app-guide";
import { components } from "@/data/components";
import { faqs } from "@/data/faq";
import { glossary } from "@/data/glossary";
import { healthEffects } from "@/data/health-effects";
import { hotspots } from "@/data/hotspots";
import { laws } from "@/data/laws";
import { myths } from "@/data/myths";
import {
  posttestQuestions,
  pretestQuestions,
} from "@/data/quiz-questions";
import { refusalSkills } from "@/data/refusal-skills";
import { contentSources } from "@/data/sources";
import type { KnowledgeChunk, KnowledgeIndex } from "@/types/knowledge";

/** keywords ที่ผู้ใช้พิมพ์จริง — ไม่ใช้ชื่อ mesh */
const HOTSPOT_KEYWORDS: Record<string, string[]> = {
  "hs-nicotine": ["นิโคติน", "nicotine", "เสพติด", "สมอง", "วัยรุ่น", "นิค"],
  "hs-pg-vg": ["PG", "VG", "พีจี", "วีจี", "น้ำยา", "ตัวทำละลาย"],
  "hs-formaldehyde": [
    "ฟอร์มาลดีไฮด์",
    "formaldehyde",
    "สารก่อมะเร็ง",
    "คอยล์ร้อน",
  ],
  "hs-acrolein": ["อะโครลีน", "acrolein", "ระคายเคือง", "ปอด", "ไอ"],
  "hs-lithium": [
    "แบต",
    "แบตเตอรี่",
    "ลิเธียม",
    "โลหะหนัก",
    "ระเบิด",
    "ชาร์จ",
  ],
};

function uniqueKeywords(...lists: string[][]): string[] {
  return [...new Set(lists.flat().map((word) => word.trim()).filter(Boolean))];
}

function joinParts(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join("\n");
}

function hotspotCategory(
  classification: string
): KnowledgeChunk["category"] {
  if (classification.includes("สารเสพติด") || classification.includes("สารก่อมะเร็ง")) {
    return "ผลเสีย";
  }
  if (classification.includes("ความเสี่ยงทางกายภาพ")) {
    return "ส่วนประกอบ";
  }
  return "ผลเสีย";
}

/** รวมทุกแหล่งความรู้เป็น chunks สำหรับ RAG */
export function buildKnowledgeChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  for (const hotspot of hotspots) {
    chunks.push({
      id: `chunk-${hotspot.id}`,
      type: "hotspot",
      title: hotspot.label,
      content: joinParts([
        hotspot.description,
        `ประเภท: ${hotspot.classification}`,
        `พบใน: ${hotspot.foundIn}`,
        `ผลกระทบต่อสุขภาพ: ${hotspot.healthEffects}`,
        `คำแนะนำ: ${hotspot.advice}`,
        `ระดับความเสี่ยง: ${hotspot.dangerLevel}`,
      ]),
      category: hotspotCategory(hotspot.classification),
      hotspotId: hotspot.id,
      sourceIds: ["who-ecig", "cdc-ecig", "ddc-thai"],
      keywords: uniqueKeywords(
        HOTSPOT_KEYWORDS[hotspot.id] ?? [],
        [hotspot.label, hotspot.classification],
        hotspot.label.split(/\s+/)
      ),
    });
  }

  for (const component of components) {
    chunks.push({
      id: `chunk-${component.id}`,
      type: "component",
      title: component.label,
      content: joinParts([
        `หน้าที่: ${component.function}`,
        `ความเสี่ยง: ${component.risks}`,
        `คำแนะนำ: ${component.advice}`,
        component.meshName ? `ชิ้นส่วนบนโมเดล 3D: ${component.meshName}` : undefined,
      ]),
      category: "ส่วนประกอบ",
      hotspotId: component.hotspotId,
      sourceIds: component.sourceIds,
      keywords: uniqueKeywords(
        component.keywords,
        [component.label, component.meshName ?? ""]
      ),
    });
  }

  for (const entry of glossary) {
    chunks.push({
      id: `chunk-${entry.id}`,
      type: "glossary",
      title: entry.term,
      content: joinParts([
        `คำศัพท์: ${entry.term}`,
        entry.aliases.length > 0
          ? `เรียกอีกอย่าง: ${entry.aliases.join(", ")}`
          : undefined,
        entry.definition,
      ]),
      category: entry.category,
      hotspotId: entry.hotspotId,
      sourceIds: entry.sourceIds,
      keywords: uniqueKeywords(
        entry.keywords,
        [entry.term, ...entry.aliases]
      ),
    });
  }

  for (const health of healthEffects) {
    chunks.push({
      id: `chunk-${health.id}`,
      type: "health",
      title: health.title,
      content: joinParts([health.summary, health.detail]),
      category: "ผลเสีย",
      hotspotId: health.hotspotId,
      sourceIds: health.sourceIds,
      keywords: uniqueKeywords(health.keywords, [health.title]),
    });
  }

  for (const skill of refusalSkills) {
    chunks.push({
      id: `chunk-${skill.id}`,
      type: "refusal",
      title: skill.situation,
      content: joinParts([
        `สถานการณ์: ${skill.situation}`,
        `เคล็ดลับ: ${skill.tips.join(" ")}`,
        `ตัวอย่างประโยค: ${skill.examplePhrases.join(" / ")}`,
      ]),
      category: "ทักษะชีวิต",
      sourceIds: skill.sourceIds,
      keywords: uniqueKeywords(skill.keywords, ["ปฏิเสธ", "ทักษะชีวิต"]),
    });
  }

  for (const guide of appGuides) {
    chunks.push({
      id: `chunk-${guide.id}`,
      type: "app",
      title: guide.title,
      content: guide.content,
      category: "ทั่วไป",
      sourceIds: [],
      keywords: uniqueKeywords(guide.keywords, ["แอป", "ส่องไส้"]),
    });
  }

  for (const myth of myths) {
    chunks.push({
      id: `chunk-${myth.id}`,
      type: "myth",
      title: `ความเชื่อผิด: ${myth.myth}`,
      content: joinParts([
        `ความเชื่อผิด: ${myth.myth}`,
        `ข้อเท็จจริง: ${myth.fact}`,
      ]),
      category: "ความเชื่อผิด",
      sourceIds: ["who-ecig", "cdc-ecig", "thaihealth"],
      keywords: uniqueKeywords(
        myth.myth.split(/\s+/),
        myth.fact.split(/\s+/).slice(0, 8),
        ["ความเชื่อผิด", "myth", "fact"]
      ),
    });
  }

  const quizQuestions = [...pretestQuestions, ...posttestQuestions];
  const seenQuizContent = new Set<string>();

  for (const question of quizQuestions) {
    if (!question.explanation || seenQuizContent.has(question.explanation)) {
      continue;
    }
    seenQuizContent.add(question.explanation);

    chunks.push({
      id: `chunk-${question.id}-explain`,
      type: "quiz",
      title: question.question,
      content: joinParts([
        `คำถาม: ${question.question}`,
        `คำอธิบาย: ${question.explanation}`,
      ]),
      category: question.chapter === 3 ? "ส่วนประกอบ" : "ผลเสีย",
      sourceIds: ["who-ecig", "cdc-ecig", "ddc-thai"],
      keywords: uniqueKeywords(
        question.question.split(/\s+/).slice(0, 10),
        [`บทที่ ${question.chapter}`, "แบบทดสอบ", "quiz"]
      ),
    });
  }

  for (const law of laws) {
    chunks.push({
      id: `chunk-${law.id}`,
      type: "law",
      title: law.title,
      content: joinParts([
        law.summary,
        law.detail,
        law.penalty ? `โทษ/ผลทางกฎหมาย: ${law.penalty}` : undefined,
        `ตรวจทานล่าสุด: ${law.lastReviewed}`,
      ]),
      category: "กฎหมาย",
      sourceIds: [law.sourceId],
      keywords: uniqueKeywords(law.keywords, [law.category, law.title]),
    });
  }

  for (const faq of faqs) {
    chunks.push({
      id: `chunk-${faq.id}`,
      type: "faq",
      title: faq.question,
      content: joinParts([`คำถาม: ${faq.question}`, `คำตอบ: ${faq.answer}`]),
      category: faq.category,
      hotspotId: faq.hotspotId,
      sourceIds: faq.sourceIds,
      keywords: uniqueKeywords(faq.keywords, [faq.category]),
    });
  }

  for (const source of contentSources) {
    chunks.push({
      id: `chunk-source-${source.id}`,
      type: "source",
      title: source.title,
      content: joinParts([
        `องค์กร: ${source.org}`,
        `หมายเหตุ: ${source.notes}`,
        `ลิงก์: ${source.url}`,
      ]),
      category: "ทั่วไป",
      sourceIds: [source.id],
      keywords: uniqueKeywords(
        [source.org, source.title],
        source.notes.split(/\s+/).slice(0, 8)
      ),
    });
  }

  return chunks;
}

export function buildKnowledgeIndex(): KnowledgeIndex {
  const chunks = buildKnowledgeChunks();
  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    chunks,
  };
}

let cachedChunks: KnowledgeChunk[] | null = null;

/** โหลด chunks แบบ cache ใน memory (ใช้ใน API route) */
export function getKnowledgeChunks(): KnowledgeChunk[] {
  if (!cachedChunks) {
    cachedChunks = buildKnowledgeChunks();
  }
  return cachedChunks;
}

/** ใช้ตอนทดสอบ/rebuild เพื่อบังคับโหลดใหม่ */
export function clearKnowledgeChunkCache() {
  cachedChunks = null;
}

export function getSourceById(sourceId: string) {
  return contentSources.find((source) => source.id === sourceId) ?? null;
}
