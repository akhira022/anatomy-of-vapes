import type { HotspotData } from "@/types";

export interface HotspotContent extends HotspotData {
  classification: string;
  foundIn: string;
  healthEffects: string;
  advice: string;
  dangerLevel: "สูง" | "กลาง" | "ต่ำ";
  mythId?: string;
}

/** เนื้อหาจุดสำรวจบนโมเดล 3D */
export const hotspots: HotspotContent[] = [
  {
    id: "hs-nicotine",
    chapter: 1,
    label: "นิโคติน",
    description: "สารเสพติดหลักในน้ำยาบุหรี่ไฟฟ้า",
    position: { x: 0, y: 1.2, z: 0.35 },
    meshName: "mouthpiece",
    classification: "สารเสพติด",
    foundIn: "น้ำยาบุหรี่ไฟฟ้าและไอที่สูดเข้าไป",
    healthEffects: "เสพติดง่าย กระทบสมอง ความจำ และสมาธิ โดยเฉพาะในวัยรุ่น",
    advice: "หลีกเลี่ยงการทดลองใช้ เพราะติดได้เร็วแม้ในปริมาณน้อย",
    dangerLevel: "สูง",
    mythId: "myth-water-vapor",
  },
  {
    id: "hs-pg-vg",
    chapter: 2,
    label: "พีจีและวีจี",
    description: "ตัวทำละลายที่สร้างไอและรสชาติ",
    position: { x: 0.15, y: 0.35, z: 0.4 },
    meshName: "coilTank",
    classification: "ตัวทำละลาย",
    foundIn: "ส่วนประกอบหลักของน้ำยาบุหรี่ไฟฟ้า",
    healthEffects: "อาจระคายเคืองทางเดินหายใจและลำคอ",
    advice: "อย่าเชื่อว่าเป็นสารปลอดภัยเพียงเพราะใช้ในอาหารบางชนิด",
    dangerLevel: "กลาง",
    mythId: "myth-food-safe",
  },
  {
    id: "hs-formaldehyde",
    chapter: 2,
    label: "ฟอร์มาลดีไฮด์",
    description: "สารก่อมะเร็งที่อาจเกิดเมื่อความร้อนสูง",
    position: { x: -0.2, y: 0.2, z: 0.45 },
    meshName: "coilTank",
    classification: "สารก่อมะเร็ง",
    foundIn: "เกิดจากการสลายตัวของน้ำยาเมื่อคอยล์ร้อนจัด",
    healthEffects: "ระคายเคืองตา จมูก ลำคอ และเพิ่มความเสี่ยงระยะยาว",
    advice: "อย่ามองว่าบุหรี่ไฟฟ้าปลอดภัยกว่าแค่เพราะไม่มีกลิ่นฉุน",
    dangerLevel: "สูง",
    mythId: "myth-safer",
  },
  {
    id: "hs-acrolein",
    chapter: 2,
    label: "อะโครลีน",
    description: "สารพิษที่ระคายเคืองปอดรุนแรง",
    position: { x: 0.25, y: 0.05, z: 0.35 },
    meshName: "coilTank",
    classification: "สารระคายเคือง",
    foundIn: "เกิดเมื่อพีจี/วีจีถูกความร้อนสูง",
    healthEffects: "ทำลายเยื่อบุทางเดินหายใจ และกระตุ้นอาการไอ แน่นหน้าอก",
    advice: "การสูดไอเข้าปอดซ้ำๆ ไม่ใช่เรื่องเล็ก",
    dangerLevel: "สูง",
  },
  {
    id: "hs-lithium",
    chapter: 3,
    label: "ลิเธียมและโลหะหนัก",
    description: "ความเสี่ยงจากแบตเตอรี่และโลหะหนัก",
    position: { x: 0, y: -0.85, z: 0.35 },
    meshName: "battery",
    classification: "ความเสี่ยงทางกายภาพ",
    foundIn: "แบตเตอรี่ลิเธียม แผงวงจร และชิ้นส่วนโลหะ",
    healthEffects: "อาจรั่ว ระเบิด และมีโลหะหนักปนเปื้อนในไอ",
    advice: "อุปกรณ์ที่ดูทันสมัยก็อาจเป็นอันตรายได้",
    dangerLevel: "สูง",
    mythId: "myth-tech-safe",
  },
];
