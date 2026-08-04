import type { QuizQuestion } from "@/types";

/** Placeholder quiz content — replace with final Thai educational copy when ready */
export const pretestQuestions: QuizQuestion[] = [
  {
    id: "pre-1",
    chapter: 1,
    type: "pretest",
    question: "ควันจากบุหรี่ไฟฟ้าเป็นเพียงไอน้ำสะอาดเท่านั้น ใช่หรือไม่?",
    options: [
      { id: "pre-1-a", label: "ก", text: "ใช่ เป็นแค่น้ำบริสุทธิ์" },
      { id: "pre-1-b", label: "ข", text: "ไม่ใช่ มีสารเคมีหลายชนิด" },
      { id: "pre-1-c", label: "ค", text: "ไม่แน่ใจ" },
      { id: "pre-1-d", label: "ง", text: "ขึ้นอยู่กับรสชาติ" },
    ],
    correctOptionId: "pre-1-b",
    explanation: "ไอจากบุหรี่ไฟฟ้ามีนิโคตินและสารพิษหลายชนิด ไม่ใช่แค่น้ำ",
  },
  {
    id: "pre-2",
    chapter: 1,
    type: "pretest",
    question: "สารนิโคตินในบุหรี่ไฟฟ้าส่งผลต่อร่างกายอย่างไร?",
    options: [
      { id: "pre-2-a", label: "ก", text: "ไม่มีผลใดๆ" },
      { id: "pre-2-b", label: "ข", text: "ทำให้เสพติดและกระทบสมอง" },
      { id: "pre-2-c", label: "ค", text: "ช่วยให้สุขภาพดีขึ้น" },
      { id: "pre-2-d", label: "ง", text: "มีผลเฉพาะในผู้ใหญ่" },
    ],
    correctOptionId: "pre-2-b",
    explanation: "นิโคตินเสพติดได้และส่งผลต่อการพัฒนาสมองของวัยรุ่น",
  },
  {
    id: "pre-3",
    chapter: 2,
    type: "pretest",
    question: "Coil ในบุหรี่ไฟฟ้ามีหน้าที่อะไร?",
    options: [
      { id: "pre-3-a", label: "ก", text: "เก็บแบตเตอรี่" },
      { id: "pre-3-b", label: "ข", text: "ทำความร้อนให้ของเหลวกลายเป็นไอ" },
      { id: "pre-3-c", label: "ค", text: "กรองอากาศ" },
      { id: "pre-3-d", label: "ง", text: "วัดอุณหภูมิร่างกาย" },
    ],
    correctOptionId: "pre-3-b",
    explanation: "Coil ทำหน้าที่ทำความร้อน e-liquid จนกลายเป็นไอ",
  },
  {
    id: "pre-4",
    chapter: 2,
    type: "pretest",
    question: "สาร Formaldehyde ที่อาจเกิดจากการใช้บุหรี่ไฟฟ้าจัดอยู่ในกลุ่มใด?",
    options: [
      { id: "pre-4-a", label: "ก", text: "วิตามิน" },
      { id: "pre-4-b", label: "ข", text: "สารก่อมะเร็ง" },
      { id: "pre-4-c", label: "ค", text: "น้ำตาล" },
      { id: "pre-4-d", label: "ง", text: "เกลือแร่" },
    ],
    correctOptionId: "pre-4-b",
    explanation: "Formaldehyde เป็นสารก่อมะเร็งที่อาจเกิดเมื่อของเหลวถูกความร้อนสูง",
  },
  {
    id: "pre-5",
    chapter: 3,
    type: "pretest",
    question: "แบตเตอรี่ลิเธียมในบุหรี่ไฟฟ้ามีความเสี่ยงใด?",
    options: [
      { id: "pre-5-a", label: "ก", text: "ไม่มีอันตรายเลย" },
      { id: "pre-5-b", label: "ข", text: "อาจรั่ว ระเบิด หรือปล่อยโลหะหนัก" },
      { id: "pre-5-c", label: "ค", text: "ทำให้ฟันขาวขึ้น" },
      { id: "pre-5-d", label: "ง", text: "ช่วยบำรุงผิว" },
    ],
    correctOptionId: "pre-5-b",
    explanation: "แบตเตอรี่ลิเธียมมีความเสี่ยงด้านความปลอดภัยและโลหะหนัก",
  },
];

export const posttestQuestions: QuizQuestion[] = [
  {
    id: "post-1",
    chapter: 1,
    type: "posttest",
    question: "หลังเรียนรู้แล้ว ข้อใดถูกต้องเกี่ยวกับไอจากบุหรี่ไฟฟ้า?",
    options: [
      { id: "post-1-a", label: "ก", text: "เป็นไอน้ำบริสุทธิ์ 100%" },
      { id: "post-1-b", label: "ข", text: "มีสารพิษและนิโคตินปนอยู่" },
      { id: "post-1-c", label: "ค", text: "ปลอดภัยกว่าอากาศปกติ" },
      { id: "post-1-d", label: "ง", text: "ไม่มีควันเลย" },
    ],
    correctOptionId: "post-1-b",
    explanation: "ไอจากบุหรี่ไฟฟ้ามีสารเคมีอันตรายหลายชนิด",
  },
  {
    id: "post-2",
    chapter: 1,
    type: "posttest",
    question: "ทำไมวัยรุ่นจึงควรหลีกเลี่ยงนิโคติน?",
    options: [
      { id: "post-2-a", label: "ก", text: "เพราะราคาถูกเกินไป" },
      { id: "post-2-b", label: "ข", text: "เพราะส่งผลต่อการพัฒนาสมองและเสพติด" },
      { id: "post-2-c", label: "ค", text: "เพราะมีสีไม่สวย" },
      { id: "post-2-d", label: "ง", text: "เพราะไม่มีรสชาติ" },
    ],
    correctOptionId: "post-2-b",
    explanation: "สมองวัยรุ่นยังพัฒนาอยู่ นิโคตินรบกวนกระบวนการนี้ได้",
  },
  {
    id: "post-3",
    chapter: 2,
    type: "posttest",
    question: "เมื่อ Coil ร้อนจัด สารใดอาจเกิดขึ้นได้?",
    options: [
      { id: "post-3-a", label: "ก", text: "ออกซิเจนบริสุทธิ์" },
      { id: "post-3-b", label: "ข", text: "Formaldehyde และ Acrolein" },
      { id: "post-3-c", label: "ค", text: "วิตามินซี" },
      { id: "post-3-d", label: "ง", text: "น้ำแร่" },
    ],
    correctOptionId: "post-3-b",
    explanation: "ความร้อนสูงสามารถสร้างสารพิษจากการสลายตัวของ e-liquid",
  },
  {
    id: "post-4",
    chapter: 2,
    type: "posttest",
    question: "PG และ VG ในน้ำยาบุหรี่ไฟฟ้าคืออะไร?",
    options: [
      { id: "post-4-a", label: "ก", text: "วิตามินในผัก" },
      { id: "post-4-b", label: "ข", text: "ตัวทำละลายที่ทำให้เกิดไอและอาจระคายเคือง" },
      { id: "post-4-c", label: "ค", text: "ชื่อของแบตเตอรี่" },
      { id: "post-4-d", label: "ง", text: "ชนิดของปากกาสูบ" },
    ],
    correctOptionId: "post-4-b",
    explanation: "Propylene Glycol และ Vegetable Glycerin เป็นฐานของ e-liquid",
  },
  {
    id: "post-5",
    chapter: 3,
    type: "posttest",
    question: "ส่วน Battery & PCB เกี่ยวข้องกับความเสี่ยงใด?",
    options: [
      { id: "post-5-a", label: "ก", text: "การระเบิด โลหะหนัก และวงจรไฟฟ้า" },
      { id: "post-5-b", label: "ข", text: "การสังเคราะห์วิตามิน" },
      { id: "post-5-c", label: "ค", text: "การกรองฝุ่น PM2.5" },
      { id: "post-5-d", label: "ง", text: "การผลิตออกซิเจน" },
    ],
    correctOptionId: "post-5-a",
    explanation: "แบตเตอรี่และแผงวงจรมีความเสี่ยงด้านความปลอดภัยและโลหะหนัก",
  },
];

export function getQuestionsByType(type: "pretest" | "posttest") {
  return type === "pretest" ? pretestQuestions : posttestQuestions;
}
