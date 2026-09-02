export interface GuardResult {
  allowed: boolean;
  refused?: boolean;
  reason?: string;
  response?: string;
}

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY = 6;

const BLOCKED_PATTERNS = [
  /คำตอบข้อ\s*[1-5]/i,
  /\b(pre|post)[\s-]?test\b/i,
  /เฉลย.*ข้อ/i,
  /ข้อ\s*[1-5].*ตอบ/i,
  /ซื้อ.*(ยา|น้ำยา|pod|พอต)/i,
  /วิธี.*(สูบ|ใช้).*บุหรี่/i,
  /แนะนำ.*(ยี่ห้อ|รุ่น).*บุหรี่/i,
];

const OFF_TOPIC_HINT =
  "ขออภัย ผู้ช่วยนี้ตอบได้เฉพาะเรื่องบุหรี่ไฟฟ้า ยาสูบ สุขภาพ และกฎหมายที่เกี่ยวข้องเท่านั้น ลองถามเรื่องส่วนประกอบ ผลเสีย หรือกฎหมายดูนะ";

const GREETING_RESPONSE =
  "สวัสดี! ผมเป็นผู้ช่วยเรียนรู้เรื่องบุหรี่ไฟฟ้า ถามได้เลยเรื่องส่วนประกอบ ผลต่อสุขภาพ กฎหมาย หรือวิธีปฏิเสธเพื่อนชวนสูบ";

const SHORT_HINT =
  "ลองถามเรื่องบุหรี่ไฟฟ้า สุขภาพ กฎหมาย หรือทักษะปฏิเสธเพื่อนดูนะ";

const QUIZ_REFUSAL =
  "ผู้ช่วยไม่เฉลยคำตอบแบบทดสอบก่อน/หลังเรียนโดยตรง ลองสำรวจโมเดล 3D หรือถามเรื่องความรู้ทั่วไปแทนนะ";

const TOPIC_KEYWORDS = [
  "บุหรี่",
  "ไฟฟ้า",
  "vape",
  "ecig",
  "พอต",
  "pod",
  "นิโคติน",
  "nicotine",
  "ยาสูบ",
  "สูบ",
  "ไอ",
  "aerosol",
  "คอยล์",
  "coil",
  "แบต",
  "น้ำยา",
  "กฎหมาย",
  "โทษ",
  "สุขภาพ",
  "ปอด",
  "เยาวชน",
  "เพื่อน",
  "แอป",
  "pretest",
  "posttest",
  "pdpa",
  "3d",
  "โมเดล",
  "salt",
  "ซอล",
];

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function isGreeting(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > 40) return false;
  return (
    /^(สวัสดี|หวัดดี)/i.test(trimmed) ||
    /^(hello|hi|hey)\b/i.test(trimmed) ||
    /^(ดีครับ|ดีค่ะ|ดีจ้า|ดีคับ)$/.test(trimmed)
  );
}

function isGlossaryQuery(text: string): boolean {
  return /คืออะไร|หมายถึง|แปลว่า|ความหมาย/.test(text);
}

export function guardChatInput(
  message: string,
  historyLength = 0
): GuardResult {
  const trimmed = message.trim();

  if (!trimmed) {
    return {
      allowed: false,
      reason: "empty",
      response: "กรุณาพิมพ์คำถามก่อนนะ",
    };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: "too_long",
      response: `คำถามยาวเกินไป (สูงสุด ${MAX_MESSAGE_LENGTH} ตัวอักษร)`,
    };
  }

  if (historyLength > MAX_HISTORY) {
    return {
      allowed: false,
      reason: "history_limit",
      response: "ประวัติแชทยาวเกินไป ลองเริ่มคำถามใหม่นะ",
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      const isQuiz =
        /คำตอบข้อ|pretest|posttest|เฉลย/i.test(trimmed);
      return {
        allowed: false,
        refused: true,
        reason: isQuiz ? "quiz" : "blocked",
        response: isQuiz ? QUIZ_REFUSAL : OFF_TOPIC_HINT,
      };
    }
  }

  const normalized = normalize(trimmed);
  const hasTopic = TOPIC_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );

  if (!hasTopic) {
    if (isGreeting(trimmed)) {
      return {
        allowed: false,
        reason: "greeting",
        response: GREETING_RESPONSE,
      };
    }

    if (isGlossaryQuery(trimmed)) {
      return { allowed: true };
    }

    if (trimmed.length > 12) {
      return {
        allowed: false,
        refused: true,
        reason: "off_topic",
        response: OFF_TOPIC_HINT,
      };
    }

    return {
      allowed: false,
      reason: "short_off_topic",
      response: SHORT_HINT,
    };
  }

  return { allowed: true };
}
