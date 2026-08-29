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

interface StreamEvent {
  type: string;
  text?: string;
  citations?: unknown[];
  mode?: string;
  refused?: boolean;
  message?: string;
}

const cases: TestCase[] = [
  {
    name: "health-topic",
    message: "บุหรี่ไฟฟ้าอันตรายไหม",
    expectCitations: true,
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

async function runStreamCase() {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "บุหรี่ไฟฟ้าอันตรายไหม",
      sessionId: `test-stream-${Date.now()}`,
      stream: true,
    }),
  });

  const issues: string[] = [];
  if (!response.ok && response.status !== 429) {
    issues.push(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("ndjson") && !contentType.includes("json")) {
    issues.push(`unexpected content-type ${contentType}`);
  }

  const text = await response.text();
  const events: StreamEvent[] = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as StreamEvent;
      } catch {
        return { type: "parse-error" };
      }
    });

  const deltas = events.filter((e) => e.type === "delta");
  const hasDone = events.some((e) => e.type === "done");
  const hasMeta = events.some((e) => e.type === "meta");
  const answer = deltas.map((e) => e.text ?? "").join("");

  if (deltas.length < 1) issues.push("expected at least one delta");
  if (!hasDone) issues.push("expected done event");
  if (!hasMeta) issues.push("expected meta event");
  if (!answer.trim()) issues.push("empty streamed answer");
  if (answer.includes(ERROR_SNIPPET)) issues.push("server error message");

  const ok = issues.length === 0;
  console.log(
    `${ok ? "✓" : "✗"} stream-ndjson`,
    ok ? `(${deltas.length} deltas)` : `— ${issues.join(", ")}`
  );
  if (!ok) {
    console.log(`  preview: ${answer.slice(0, 100) || text.slice(0, 100)}`);
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
  const total = cases.length + 1;
  for (const test of cases) {
    if (await runCase(test)) passed += 1;
  }
  if (await runStreamCase()) passed += 1;

  console.log(`\n${passed}/${total} passed`);
  if (passed !== total) process.exit(1);
}

void main();
