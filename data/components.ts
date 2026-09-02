/**
 * ส่วนประกอบโครงสร้างของบุหรี่ไฟฟ้า — แยกจากสารพิษใน hotspots
 * meshName เชื่อมกับโมเดล 3D (mouthpiece / coilTank / battery)
 */

export type ComponentMeshName = "mouthpiece" | "coilTank" | "battery";

export interface DeviceComponent {
  id: string;
  label: string;
  meshName?: ComponentMeshName;
  function: string;
  risks: string;
  advice: string;
  hotspotId?: string;
  sourceIds: string[];
  keywords: string[];
}

export const components: DeviceComponent[] = [
  {
    id: "comp-mouthpiece",
    label: "ปากสูบ",
    meshName: "mouthpiece",
    function:
      "ส่วนที่ผู้ใช้วางปากเพื่อสูดละอองไอเข้าสู่ปากและทางเดินหายใจ",
    risks:
      "เป็นทางเข้าหลักของนิโคตินและสารเคมีในไอ รวมถึงสารตกค้างจากน้ำยาและคอยล์",
    advice:
      "แม้ดูเป็นแค่ชิ้นพลาสติกหรือโลหะ แต่เป็นจุดที่สารพิษเข้าสู่ร่างกายโดยตรง",
    hotspotId: "hs-nicotine",
    sourceIds: ["cdc-ecig", "ddc-thai"],
    keywords: ["ปากสูบ", "mouthpiece", "ปาก", "สูด", "ดึง"],
  },
  {
    id: "comp-coil",
    label: "คอยล์",
    meshName: "coilTank",
    function:
      "ลวดทำความร้อนที่ทำให้น้ำยากลายเป็นละอองไอเมื่อกดหรือสูด",
    risks:
      "ความร้อนสูงอาจสร้างสารพิษ เช่น ฟอร์มาลดีไฮด์และอะโครลีน และอาจปล่อยอนุภาคโลหะปนในไอ",
    advice:
      "คอยล์เสื่อมหรือร้อนจัดไม่ได้แปลว่าแค่กลิ่นไหม้ — อาจเพิ่มสารอันตรายในไอที่สูด",
    hotspotId: "hs-formaldehyde",
    sourceIds: ["cdc-ecig", "lung-ingredients"],
    keywords: ["คอยล์", "coil", "ลวด", "ความร้อน", "ทำความร้อน"],
  },
  {
    id: "comp-tank",
    label: "แทงก์น้ำยา",
    meshName: "coilTank",
    function:
      "ช่องเก็บน้ำยาที่มีพีจี/วีจี นิโคติน และสารแต่งกลิ่น ก่อนถูกคอยล์ทำให้เป็นไอ",
    risks:
      "น้ำยาอาจมีนิโคตินเข้มข้น สารแต่งกลิ่น และสิ่งปนเปื้อน การรั่วหรือกลืนน้ำยาโดยไม่ตั้งใจอันตรายมาก",
    advice:
      "อย่าคิดว่าน้ำยาเป็นแค่ของเหลวหอมๆ — สูดเข้าปอดและสัมผัสผิว/ปากต่างจากการกิน",
    hotspotId: "hs-pg-vg",
    sourceIds: ["cdc-ecig", "lung-ingredients"],
    keywords: ["แทงก์", "ถังน้ำยา", "tank", "น้ำยา", "cartridge"],
  },
  {
    id: "comp-battery",
    label: "แบตเตอรี่",
    meshName: "battery",
    function:
      "แหล่งพลังงานลิเธียมที่จ่ายไฟให้คอยล์และแผงวงจรทำงาน",
    risks:
      "อาจรั่ว ร้อนจัด หรือระเบิดได้หากชาร์จผิดวิธี ใช้สายไม่มาตรฐาน หรืออุปกรณ์ชำรุด",
    advice:
      "รูปลักษณ์ทันสมัยไม่ได้ลดความเสี่ยงแบตเตอรี่ — อย่าชาร์จทิ้งไว้โดยไม่ดูแล",
    hotspotId: "hs-lithium",
    sourceIds: ["cdc-ecig", "ddc-thai"],
    keywords: ["แบต", "แบตเตอรี่", "battery", "ลิเธียม", "ชาร์จ"],
  },
  {
    id: "comp-circuit",
    label: "แผงวงจร",
    meshName: "battery",
    function:
      "ควบคุมการจ่ายไฟ การเปิด-ปิด และการทำงานของคอยล์ในอุปกรณ์",
    risks:
      "หากชำรุดอาจทำงานผิดปกติ ร้อนเกิน หรือทำให้แบตเตอรี่เสี่ยงมากขึ้น",
    advice:
      "อุปกรณ์ที่ตก เปียก หรือแกะเองมีความเสี่ยงสูงกว่าที่เห็น",
    hotspotId: "hs-lithium",
    sourceIds: ["cdc-ecig"],
    keywords: ["แผงวงจร", "วงจร", "chip", "board", "ควบคุม"],
  },
  {
    id: "comp-disposable",
    label: "พอตใช้แล้วทิ้ง",
    function:
      "บุหรี่ไฟฟ้าแบบครบชุด (แบต + น้ำยา + คอยล์) ที่ออกแบบให้ใช้จนหมดแล้วทิ้ง ไม่เติมน้ำยา",
    risks:
      "มักมีนิโคตินสูง พกง่าย ดึงดูดเยาวชน และกลายเป็นขยะอิเล็กทรอนิกส์ที่มีแบตลิเธียม",
    advice:
      "ความสะดวกของแบบใช้แล้วทิ้งไม่ได้แปลว่าปลอดภัยกว่า — ทั้งสุขภาพและสิ่งแวดล้อมได้รับผลกระทบ",
    sourceIds: ["cdc-ecig", "ddc-thai", "thaihealth"],
    keywords: [
      "พอตใช้แล้วทิ้ง",
      "disposable",
      "ทิ้ง",
      "ครบชุด",
      "พอททิ้ง",
    ],
  },
];

export function getComponentById(id: string) {
  return components.find((c) => c.id === id) ?? null;
}
