/** ตรวจคำตอบที่รั่ว reasoning หรือปนอังกฤษมากเกินไป */
export function isLowQualityAnswer(text: string): boolean {
  const answer = text.trim();
  if (!answer) return true;

  const leakPatterns = [
    /thinking process/i,
    /analyze user input/i,
    /here'?s a thinking/i,
    /\bformulate response\b/i,
    /\bcheck context\b/i,
    /^\s*1\.\s*analyze/i,
    /\bdraft:\s/i,
    /user safety:/i,
  ];
  if (leakPatterns.some((pattern) => pattern.test(answer))) return true;

  if (!/[\u0E00-\u0E7F]/.test(answer) && answer.length > 3) return true;

  const latinWords = answer.match(/[a-zA-Z]{3,}/g) ?? [];
  const thaiChars = answer.match(/[\u0E00-\u0E7F]/g) ?? [];
  if (latinWords.length > 6 && latinWords.length * 4 > thaiChars.length) {
    return true;
  }

  return false;
}

/** ทำความสะอาดคำตอบก่อนส่งให้ผู้ใช้ */
export function postprocessAnswer(text: string): string {
  let answer = text.trim();

  // ลบอีโมจิ
  answer = answer.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}]/gu,
    ""
  );

  // ลบ markdown ตัวหนา/เอียง
  answer = answer.replace(/\*\*([^*]+)\*\*/g, "$1");
  answer = answer.replace(/\*([^*]+)\*/g, "$1");

  const replacements: Array<[RegExp, string]> = [
    [/\blungs\b/gi, "ปอด"],
    [/\bcoil\b/gi, "คอยล์"],
    [/\bmay\b/gi, "อาจ"],
    [/\s{2,}/g, " "],
  ];

  for (const [pattern, replacement] of replacements) {
    answer = answer.replace(pattern, replacement);
  }

  answer = answer.replace(/\n{3,}/g, "\n\n");

  return answer.trim();
}
