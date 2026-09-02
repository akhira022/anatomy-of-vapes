import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { probeDirectGemini } from "../lib/chat/providers/direct-gemini";
import { probeOpenRouter } from "../lib/chat/providers/openrouter-gemini";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  console.log("=== Gemini Doctor ===\n");

  if (!geminiKey && !openRouterKey) {
    console.log("ไม่พบ GEMINI_API_KEY หรือ OPENROUTER_API_KEY ใน .env.local");
    process.exit(1);
  }

  if (geminiKey) {
    console.log(`GEMINI_API_KEY: ตั้งแล้ว (${geminiKey.slice(0, 6)}...)`);
    const result = await probeDirectGemini(geminiKey);
    if (result.ok) {
      console.log(`✓ Google Gemini ใช้งานได้ (model: ${result.model})`);
    } else {
      console.log(`✗ Google Gemini ล้มเหลว (model: ${result.model})`);
      console.log(`  ${result.message}`);
      if (result.message.includes("denied access")) {
        console.log("\n  แนวทางแก้ (Google project ถูก block):");
        console.log("  1. เปิด https://aistudio.google.com/apikey");
        console.log("  2. สร้าง project ใหม่ + API key ใหม่");
        console.log("  3. ยืนยันเบอร์โทร + เปิด 2FA ใน Google Account");
        console.log("  4. ตรวจ banner ที่ AI Studio / Cloud Console");
        console.log("  5. ถ้ายังไม่ได้ ลองเปิด billing หรือติดต่อ Google Support");
        console.log("\n  ทางเลือกชั่วคราว: ใช้ OpenRouter (ดูด้านล่าง)");
      }
    }
  } else {
    console.log("GEMINI_API_KEY: ไม่ได้ตั้ง");
  }

  console.log("");

  if (openRouterKey) {
    console.log(`OPENROUTER_API_KEY: ตั้งแล้ว (${openRouterKey.slice(0, 8)}...)`);
    const result = await probeOpenRouter();
    if (result.ok) {
      console.log(`✓ OpenRouter ใช้งานได้ (model: ${result.model})`);
    } else {
      console.log(`✗ OpenRouter ล้มเหลว (model: ${result.model})`);
      console.log(`  ${result.message}`);
    }
  } else {
    console.log("OPENROUTER_API_KEY: ไม่ได้ตั้ง");
    console.log("  ทางเลือก: สมัคร https://openrouter.ai/keys");
    console.log("  แล้วใส่ใน .env.local:");
    console.log("  OPENROUTER_API_KEY=sk-or-...");
    console.log("  OPENROUTER_MODEL=google/gemini-3.6-flash  # optional");
  }

  console.log("");
}

void main();
