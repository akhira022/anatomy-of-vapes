import { retrieveKnowledge } from "../lib/chat/retrieve";
import {
  buildKnowledgeChunks,
  clearKnowledgeChunkCache,
} from "../lib/knowledge/build-chunks";

clearKnowledgeChunkCache();

const samples = [
  "นิโคตินอันตรายต่อวัยรุ่นยังไง",
  "ขายบุหรี่ไฟฟ้าให้เด็กผิดกฎหมายไหม",
  "บุหรี่ไฟฟ้าพ่นไอน้ำใช่ไหม",
  "คอยล์ทำหน้าที่อะไร",
  "สั่งจากต่างประเทศได้ไหม",
  "พอตคืออะไร",
  "salt nic อันตรายไหม",
  "เพื่อนชวนสูบทำยังไง",
  "น้ำยาไม่มีนิโคตินปลอดภัยไหม",
  "แอปนี้ใช้ยังไง",
  "พอตใช้แล้วทิ้งต่างยังไง",
  "ปอดเสียจากบุหรี่ไฟฟ้าไหม",
  "ช่วยเพื่อนที่ติดพอตยังไง",
  "PDPA คืออะไรในแอปนี้",
  "ทำไมเห็นขายใน TikTok",
];

const chunks = buildKnowledgeChunks();
const byType = chunks.reduce<Record<string, number>>((acc, chunk) => {
  acc[chunk.type] = (acc[chunk.type] ?? 0) + 1;
  return acc;
}, {});

console.log(`Total chunks: ${chunks.length}`);
console.log("By type:", byType);
console.log("");

for (const query of samples) {
  const results = retrieveKnowledge(query, { topK: 3 });
  console.log(`Q: ${query}`);
  for (const result of results) {
    console.log(`  - [${result.score}] ${result.title} (${result.type})`);
  }
  console.log("");
}
