/**
 * ผลต่อร่างกายแบบก่อน/หลังสูบ — ข้อความเรียบเรียงจาก health-effects.ts,
 * glossary.ts และ myths.ts เท่านั้น ห้ามเพิ่มข้ออ้างที่ไม่มีในข้อมูลต้นทาง
 */

/** จุดบนรูปร่างกาย เรียงจากบนลงล่าง */
export type BodyOrgan = "brain" | "oral" | "lungs" | "heart";

export interface BodyImpactEntry {
  id: string;
  title: string;
  /** ชื่อสั้นสำหรับป้ายบนรูปร่างกาย */
  shortTitle: string;
  badge: string;
  beforeLabel: string;
  afterLabel: string;
  beforeText: string;
  afterText: string;
  summary: string;
  mythBust: string;
  sourceIds: string[];
  hotspotId: string;
  /** ไม่มีค่าเมื่อหัวข้อไม่ได้ผูกกับอวัยวะ เช่น การแก้ความเชื่อผิด */
  organ?: BodyOrgan;
}

export const bodyImpacts: BodyImpactEntry[] = [
  {
    id: "impact-brain",
    title: "สมองและการเสพติด",
    shortTitle: "สมอง",
    badge: "นิโคติน",
    organ: "brain",
    beforeLabel: "ก่อนสูบ",
    afterLabel: "หลังสูบ",
    beforeText:
      "สมองวัยรุ่นกำลังพัฒนาเรื่องความจำ สมาธิ การเรียนรู้ และการควบคุมอารมณ์",
    afterText:
      "นิโคตินรบกวนพัฒนาการเหล่านี้ และนิโคตินรูปแบบเกลือดูดซึมเร็ว ทำให้อยากกลับมาใช้ซ้ำ",
    summary:
      "การได้รับนิโคตินซ้ำๆ ในวัยรุ่นเพิ่มความเสี่ยงเสพติด และอาจกระทบการเรียน อารมณ์ และการนอน",
    mythBust: "ลองครั้งเดียวก็อาจเป็นจุดเริ่มของวงจรการใช้ซ้ำ",
    sourceIds: ["acs-ecig", "ddc-thai", "who-ecig"],
    hotspotId: "hs-nicotine",
  },
  {
    id: "impact-oral",
    title: "ช่องปากและฟัน",
    shortTitle: "ช่องปาก",
    badge: "ช่องปาก",
    organ: "oral",
    beforeLabel: "ก่อนสูบ",
    afterLabel: "หลังสูบ",
    beforeText: "เยื่อบุในปากและเหงือกไม่ถูกละอองไอและนิโคตินสัมผัสซ้ำ",
    afterText:
      "ละอองไอ สารเคมี และนิโคตินสัมผัสเยื่อบุในปากโดยตรง อาจทำให้ปากแห้งและระคายเคืองเหงือก",
    summary:
      "การใช้บุหรี่ไฟฟ้าอาจเกี่ยวข้องกับปากแห้ง ระคายเคืองเหงือก และความเสี่ยงต่อสุขภาพช่องปาก",
    mythBust: "ไม่ทำให้ฟันเหลืองเหมือนบุหรี่มวน ก็ไม่ได้แปลว่าปลอดภัยต่อเหงือก",
    sourceIds: ["cdc-ecig", "acs-ecig"],
    hotspotId: "hs-nicotine",
  },
  {
    id: "impact-lungs",
    title: "ปอดและทางเดินหายใจ",
    shortTitle: "ปอด",
    badge: "ละอองไอ",
    organ: "lungs",
    beforeLabel: "ก่อนสูบ",
    afterLabel: "หลังสูบ",
    beforeText: "ทางเดินหายใจรับอากาศได้โล่ง เยื่อบุไม่ถูกระคายเคือง",
    afterText:
      "ละอองไอและสารจากการทำความร้อนน้ำยา เช่น อะโครลีน ระคายเคืองปอด ทำให้ไอ แน่นหน้าอก หรือหายใจลำบาก",
    summary:
      "ปอดไม่ได้ถูกออกแบบมาให้รับสารเคมีจากการเผาน้ำยาเป็นประจำ",
    mythBust: "สิ่งที่สูดเข้าไปคือละอองฝอย ไม่ใช่ไอน้ำบริสุทธิ์",
    sourceIds: ["cdc-ecig", "lung-ingredients", "who-ecig"],
    hotspotId: "hs-acrolein",
  },
  {
    id: "impact-heart",
    title: "หัวใจและหลอดเลือด",
    shortTitle: "หัวใจ",
    badge: "หัวใจ",
    organ: "heart",
    beforeLabel: "ก่อนสูบ",
    afterLabel: "หลังสูบ",
    beforeText: "หัวใจเต้นและความดันเลือดอยู่ในระดับปกติของร่างกาย",
    afterText:
      "นิโคตินและสารในละอองไออาจเกี่ยวข้องกับอัตราการเต้นของหัวใจ ความดัน และความเสี่ยงต่อระบบหัวใจและหลอดเลือด",
    summary:
      "ข้อมูลระยะยาวยังศึกษาต่อเนื่อง แต่การเริ่มใช้ตั้งแต่อายุน้อยเพิ่มความเสี่ยงที่ไม่จำเป็น",
    mythBust: "ไม่ควรถือว่าการใช้ในวัยรุ่นปลอดภัยต่อหัวใจ",
    sourceIds: ["acs-ecig", "cdc-ecig", "who-ecig"],
    hotspotId: "hs-nicotine",
  },
  {
    id: "impact-vs-cigarette",
    title: "เทียบกับบุหรี่มวน",
    shortTitle: "เทียบบุหรี่มวน",
    badge: "ความเชื่อผิด",
    beforeLabel: "ความเชื่อ",
    afterLabel: "ความจริง",
    beforeText: "บุหรี่ไฟฟ้าปลอดภัยกว่าบุหรี่มวนเสมอ จึงลองได้",
    afterText:
      "องค์ประกอบต่างจากควันบุหรี่มวน แต่ยังมีนิโคตินและสารพิษ และความเสี่ยงระยะยาวยังศึกษาอยู่",
    summary:
      "โดยเฉพาะวัยรุ่นที่ไม่เคยสูบมาก่อน ไม่ควรเริ่มใช้",
    mythBust: "“ต่างจากบุหรี่มวน” ไม่ได้แปลว่า “ปลอดภัย”",
    sourceIds: ["who-ecig", "cdc-ecig"],
    hotspotId: "hs-formaldehyde",
  },
];

/** หัวข้อที่กดได้บนรูปร่างกาย เรียงตามตำแหน่งจากหัวลงล่าง */
export const bodyOrganImpacts = bodyImpacts.filter(
  (item): item is BodyImpactEntry & { organ: BodyOrgan } => Boolean(item.organ)
);

export function getBodyOrganImpact(organ: string | null | undefined) {
  if (!organ) return undefined;
  return bodyOrganImpacts.find((item) => item.organ === organ);
}

/** ตัวอย่างบนหน้าแรก — สมองเห็นผลเสพติดชัดที่สุด */
export const bodyImpactLandingSample = bodyOrganImpacts[0];

export const bodyImpactMyth = bodyImpacts.find(
  (item) => item.id === "impact-vs-cigarette"
);

/** ข้อความสั้นเรื่องไอมือสอง จาก health-effects.ts ไม่ใช่อวัยวะบนร่าง */
export const bodyImpactSecondhand = {
  title: "คนรอบข้างและไอมือสอง",
  short: "คนรอบข้าง",
  text: "ละอองไอจากบุหรี่ไฟฟ้าอาจส่งผลต่อคนรอบข้าง โดยเฉพาะในรถ ห้องนอน หรือพื้นที่ปิด",
};

export const bodyImpactClosing =
  "บุหรี่ไฟฟ้าไม่เท่าบุหรี่มวน แต่ไม่แปลว่าปลอดภัย โดยเฉพาะคนที่ยังไม่เคยสูบ";
