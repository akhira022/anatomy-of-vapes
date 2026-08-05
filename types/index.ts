/** ระดับการศึกษา */
export type Grade =
  | "มัธยมศึกษาตอนต้น"
  | "มัธยมศึกษาตอนปลาย"
  | "ปวช"
  | "ปวส"
  | "นักศึกษา"
  | "อื่นๆ";

/** ข้อมูลผู้ใช้ */
export interface User {
  id?: string;
  nickname: string;
  grade: Grade;
  createdAt?: string;
}

/** ประเภทแบบทดสอบ */
export type QuizType = "pretest" | "posttest";

/** ตัวเลือกคำตอบ */
export interface QuizOption {
  id: string;
  label: string;
  text: string;
}

/** คำถามแบบทดสอบ */
export interface QuizQuestion {
  id: string;
  chapter: number;
  type: QuizType;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
}

/** คำตอบที่ผู้ใช้เลือก */
export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

/** ผลคะแนนแบบทดสอบ */
export interface QuizResult {
  userId?: string;
  nickname: string;
  grade: Grade;
  preScore: number;
  postScore: number;
  preTotal: number;
  postTotal: number;
  preAnswers: QuizAnswer[];
  postAnswers: QuizAnswer[];
  completedAt: string;
}

/** พิกัด 3D บนโมเดล */
export interface HotspotPosition {
  x: number;
  y: number;
  z: number;
}

/** ข้อมูล Hotspot บนโมเดล 3D */
export interface HotspotData {
  id: string;
  chapter: number;
  label: string;
  description: string;
  position: HotspotPosition;
  /** ชื่อ mesh/part บนโมเดล (ถ้ามี) */
  meshName?: string;
  /** รูปประกอบ */
  imageUrl?: string;
}

/** สถานะ flow ของแอป */
export type AppPhase =
  | "registration"
  | "pretest"
  | "anatomy"
  | "posttest"
  | "result";
