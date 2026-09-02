/**
 * คำศัพท์และสแลงที่เยาวชนไทยใช้ — ช่วย RAG จับคำถามภาษาพูด
 */

import type { KnowledgeCategory } from "@/types/knowledge";

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases: string[];
  definition: string;
  category: KnowledgeCategory;
  sourceIds: string[];
  keywords: string[];
  hotspotId?: string;
}

export const glossary: GlossaryEntry[] = [
  {
    id: "gloss-pod",
    term: "พอต",
    aliases: ["pod", "หัวพอต", "พอตบุหรี่ไฟฟ้า"],
    definition:
      "คำเรียกบุหรี่ไฟฟ้าแบบหัวหรือแบบพกพาที่ใช้กันทั่วไปในกลุ่มเยาวชน อาจหมายถึงหัวน้ำยาที่เปลี่ยนได้ หรือตัวเครื่องทั้งชุด",
    category: "ส่วนประกอบ",
    sourceIds: ["cdc-ecig", "ddc-thai"],
    keywords: ["พอต", "pod", "หัวพอต", "อุปกรณ์"],
  },
  {
    id: "gloss-disposable",
    term: "พอตใช้แล้วทิ้ง",
    aliases: ["disposable", "disposable vape", "พอททิ้ง", "พอตทิ้ง"],
    definition:
      "บุหรี่ไฟฟ้าแบบครบชุดที่ใช้แล้วทิ้ง ไม่ต้องเติมน้ำยาหรือเปลี่ยนคอยล์ มักมีนิโคตินและเป็นขยะอิเล็กทรอนิกส์หลังใช้หมด",
    category: "ส่วนประกอบ",
    sourceIds: ["cdc-ecig", "ddc-thai"],
    keywords: ["ใช้แล้วทิ้ง", "disposable", "พอตทิ้ง", "ครบชุด"],
  },
  {
    id: "gloss-vape",
    term: "บุหรี่ไฟฟ้า",
    aliases: ["vape", "ecig", "e-cig", "อีซิก", "อี-ซิก", "e-cigarette"],
    definition:
      "อุปกรณ์ที่ทำความร้อนน้ำยาให้กลายเป็นละอองไอ (aerosol) เพื่อสูดเข้าปอด มักมีนิโคตินและสารเคมี ไม่ใช่ไอน้ำบริสุทธิ์",
    category: "ทั่วไป",
    sourceIds: ["who-ecig", "cdc-ecig"],
    keywords: ["บุหรี่ไฟฟ้า", "vape", "ecig", "อีซิก"],
  },
  {
    id: "gloss-salt-nic",
    term: "น้ำยาซอลนิค",
    aliases: ["salt nic", "salt nicotine", "ซอลต์นิค", "nicotine salt"],
    definition:
      "นิโคตินรูปแบบเกลือที่ดูดซึมเร็วและเสพติดง่าย มักใช้ในพอต/น้ำยาความเข้มข้นสูง โดยเฉพาะกลุ่มเยาวชน",
    category: "ผลเสีย",
    hotspotId: "hs-nicotine",
    sourceIds: ["acs-ecig", "cdc-ecig"],
    keywords: ["salt nic", "ซอลนิค", "นิโคติน", "salt nicotine"],
  },
  {
    id: "gloss-coil",
    term: "คอยล์",
    aliases: ["coil", "ลวดความร้อน", "ลวดคอยล์"],
    definition:
      "ลวดทำความร้อนในบุหรี่ไฟฟ้า ที่ทำให้น้ำยากลายเป็นละอองไอ ความร้อนสูงอาจสร้างสารพิษและปล่อยอนุภาคโลหะ",
    category: "ส่วนประกอบ",
    hotspotId: "hs-formaldehyde",
    sourceIds: ["cdc-ecig", "lung-ingredients"],
    keywords: ["คอยล์", "coil", "ลวด", "ความร้อน"],
  },
  {
    id: "gloss-eliquid",
    term: "น้ำยา",
    aliases: ["e-liquid", "e-juice", "juice", "น้ำยาบุหรี่ไฟฟ้า"],
    definition:
      "ของเหลวในบุหรี่ไฟฟ้า มักผสมพีจี/วีจี นิโคติน และสารแต่งกลิ่น เมื่อถูกความร้อนจะกลายเป็นละอองไอที่สูดเข้าปอด",
    category: "ส่วนประกอบ",
    hotspotId: "hs-pg-vg",
    sourceIds: ["cdc-ecig", "lung-ingredients"],
    keywords: ["น้ำยา", "e-liquid", "juice", "น้ำยาบุหรี่"],
  },
  {
    id: "gloss-mod",
    term: "มอด",
    aliases: ["mod", "แมงกะพรุน", "box mod"],
    definition:
      "บุหรี่ไฟฟ้าแบบปรับแต่งได้ มีแบตและกำลังไฟสูงกว่าพอตทั่วไป ความเสี่ยงด้านความร้อน สารพิษ และการชาร์จอาจสูงขึ้น",
    category: "ส่วนประกอบ",
    hotspotId: "hs-lithium",
    sourceIds: ["cdc-ecig"],
    keywords: ["มอด", "mod", "แมงกะพรุน", "box mod"],
  },
  {
    id: "gloss-aerosol",
    term: "ละอองฝอย",
    aliases: ["aerosol", "ไอ", "ควันบุหรี่ไฟฟ้า"],
    definition:
      "สิ่งที่พ่นออกจากบุหรี่ไฟฟ้า ไม่ใช่ไอน้ำบริสุทธิ์ แต่เป็นละอองฝอยที่มีนิโคติน สารเคมี และอนุภาคเล็กๆ",
    category: "ความเชื่อผิด",
    hotspotId: "hs-nicotine",
    sourceIds: ["who-ecig", "cdc-ecig"],
    keywords: ["ละอองฝอย", "aerosol", "ไอ", "ไอน้ำ"],
  },
  {
    id: "gloss-zero-nic",
    term: "นิโคตินศูนย์",
    aliases: ["0mg", "nicotine-free", "ไม่มีนิโคติน", "นิค 0"],
    definition:
      "น้ำยาที่อ้างว่าไม่มีนิโคติน ยังอาจมีสารเคมีอื่นจากการทำความร้อน และบางผลิตภัณฑ์อาจมีนิโคตินปนโดยไม่ระบุครบ",
    category: "ความเชื่อผิด",
    hotspotId: "hs-pg-vg",
    sourceIds: ["who-ecig", "cdc-ecig"],
    keywords: ["นิโคตินศูนย์", "0mg", "ไม่มีนิโคติน", "nicotine-free"],
  },
  {
    id: "gloss-refillable",
    term: "หัวเติมน้ำยา",
    aliases: ["refillable", "refillable pod", "หัวสำลัก", "หัวเติม"],
    definition:
      "หัวหรือพอตที่เติมน้ำยาเองได้ ผู้ใช้ต้องระวังปริมาณนิโคติน การรั่ว และการใช้คอยล์ที่เสื่อม",
    category: "ส่วนประกอบ",
    sourceIds: ["cdc-ecig"],
    keywords: ["เติมน้ำยา", "refillable", "หัวเติม", "หัวสำลัก"],
  },
  {
    id: "gloss-pg-vg",
    term: "พีจีและวีจี",
    aliases: ["PG", "VG", "propylene glycol", "vegetable glycerin"],
    definition:
      "ตัวทำละลายหลักในน้ำยาบุหรี่ไฟฟ้า ที่สร้างไอและพารสชาติ เมื่อสูดหรือร้อนจัดอาจระคายเคืองและแตกตัวเป็นสารพิษ",
    category: "ผลเสีย",
    hotspotId: "hs-pg-vg",
    sourceIds: ["lung-ingredients", "cdc-ecig"],
    keywords: ["พีจี", "วีจี", "PG", "VG", "ตัวทำละลาย"],
  },
  {
    id: "gloss-nicotine",
    term: "นิโคติน",
    aliases: ["nicotine", "นิค"],
    definition:
      "สารเสพติดหลักในน้ำยาบุหรี่ไฟฟ้า เสพติดได้เร็ว โดยเฉพาะสมองวัยรุ่นที่ยังพัฒนาด้านความจำ สมาธิ และการควบคุมอารมณ์",
    category: "ผลเสีย",
    hotspotId: "hs-nicotine",
    sourceIds: ["acs-ecig", "ddc-thai"],
    keywords: ["นิโคติน", "nicotine", "นิค", "เสพติด"],
  },
];

export function getGlossaryById(id: string) {
  return glossary.find((entry) => entry.id === id) ?? null;
}
