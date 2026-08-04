export interface MythFact {
  id: string;
  myth: string;
  fact: string;
}

export const myths: MythFact[] = [
  {
    id: "myth-water-vapor",
    myth: "บุหรี่ไฟฟ้าเป็นแค่ไอน้ำ",
    fact: "ไอจากบุหรี่ไฟฟ้ามีนิโคตินและสารเคมีหลายชนิด ไม่ใช่ไอน้ำบริสุทธิ์",
  },
  {
    id: "myth-food-safe",
    myth: "พีจีและวีจีใช้ในอาหารได้ จึงปลอดภัยเมื่อสูด",
    fact: "การกินกับการสูดเข้าปอดต่างกัน การสูดอาจระคายเคืองทางเดินหายใจ",
  },
  {
    id: "myth-safer",
    myth: "บุหรี่ไฟฟ้าปลอดภัยกว่าบุหรี่มวนเสมอ",
    fact: "ยังมีสารพิษและความเสี่ยงต่อสุขภาพ โดยเฉพาะในวัยรุ่นที่เพิ่งเริ่มใช้",
  },
  {
    id: "myth-tech-safe",
    myth: "อุปกรณ์ไฮเทคจึงไม่มีอันตราย",
    fact: "แบตเตอรี่และโลหะหนักยังมีความเสี่ยงด้านความปลอดภัย",
  },
];

export function getMythById(id: string | undefined) {
  if (!id) return null;
  return myths.find((m) => m.id === id) ?? null;
}
