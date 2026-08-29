/** หมวดเนื้อหาใน knowledge base สำหรับ RAG */
export type KnowledgeCategory =
  | "ส่วนประกอบ"
  | "ผลเสีย"
  | "กฎหมาย"
  | "ความเชื่อผิด"
  | "ทักษะชีวิต"
  | "ทั่วไป";

export type KnowledgeChunkType =
  | "hotspot"
  | "myth"
  | "quiz"
  | "law"
  | "faq"
  | "source"
  | "glossary"
  | "component"
  | "health"
  | "refusal"
  | "app"
  | "chapter";

/** ชิ้นส่วนความรู้สำหรับ retrieval */
export interface KnowledgeChunk {
  id: string;
  type: KnowledgeChunkType;
  title: string;
  content: string;
  category: KnowledgeCategory;
  hotspotId?: string;
  sourceIds: string[];
  keywords: string[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  score: number;
}

export interface KnowledgeIndex {
  version: number;
  generatedAt: string;
  chunkCount: number;
  chunks: KnowledgeChunk[];
}
