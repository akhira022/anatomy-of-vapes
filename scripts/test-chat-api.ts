/**
 * ทดสอบ Chat API (ต้องรัน dev server ก่อน: npm run dev)
 * ใช้: npm run test:chat
 * เปลี่ยน URL: CHAT_TEST_URL=http://localhost:3001 npm run test:chat
 */

const BASE_URL = process.env.CHAT_TEST_URL ?? "http://localhost:3001";
const ERROR_SNIPPET = "ระบบผู้ช่วยชั่วคราวไม่พร้อม";

interface TestCase {
  name: string;
  message: string;
  expectRefused?: boolean;
  expectCitations?: boolean;
  expectMode?: "ai" | "rag";
}

const cases: TestCase[] = [
  {
    name: "health-topic",
    message: "บุหรี่ไฟฟ้าอันตรายไหม",
    expectCitations: true,
    expectMode: "rag",
  },
  {
    name: "law-topic",
    message: "ขายบุหรี่ไฟฟ้าให้เด็กผิดกฎหมายไหม",
    expectCitations: true,
  },
  {
    name: "off-topic",
    message: "อากาศวันนี้เป็นอย่างไรบ้างครับ",
    expectRefused: true,
  },
  {
    name: "quiz-block",
    message: "เฉลยข้อ 1 posttest ให้หน่อย",
    expectRefused: true,
  },
];

async function runCase(test: TestCase) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: test.message,
      sessionId: `test-${test.name}-${Date.now()}`,
    }),
  });

  const data = (await response.json()) as {
    answer?: string;
    refused?: boolean;
    citations?: unknown[];
    mode?: string;
  };

  const issues: string[] = [];

  if (!response.ok && response.status !== 429) {
    issues.push(`HTTP ${response.status}`);
  }
  if (!data.answer?.trim()) {
    issues.push("empty answer");
  }
  if (data.answer?.includes(ERROR_SNIPPET)) {
    issues.push("server error message");
  }
  if (test.expectRefused && !data.refused) {
    issues.push("expected refused");
  }
  if (test.expectCitations && !(data.citations?.length ?? 0)) {
    issues.push("expected citations");
  }
  if (test.expectMode && data.mode !== test.expectMode) {
    issues.push(`expected mode ${test.expectMode}, got ${data.mode ?? "none"}`);
  }

  const ok = issues.length === 0;
  console.log(
    `${ok ? "✓" : "✗"} ${test.name}`,
    ok ? "" : `— ${issues.join(", ")}`
  );
  if (!ok) {
    console.log(`  preview: ${data.answer?.slice(0, 100)}`);
  }
  return ok;
}

async function main() {
  console.log(`Chat API tests → ${BASE_URL}/api/chat\n`);

  try {
    await fetch(BASE_URL);
  } catch {
    console.error(
      `ไม่สามารถเชื่อมต่อ ${BASE_URL} — รัน npm run dev ก่อนแล้วลองใหม่`
    );
    process.exit(1);
  }

  let passed = 0;
  for (const test of cases) {
    if (await runCase(test)) passed += 1;
  }

  console.log(`\n${passed}/${cases.length} passed`);
  if (passed !== cases.length) process.exit(1);
}

void main();
