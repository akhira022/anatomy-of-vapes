/**
 * Record a short website preview walkthrough to docs/video/.
 * Requires: dev server on http://localhost:3001 and Playwright Chromium.
 *
 * Usage: node scripts/record-preview.mjs
 */
import { chromium } from "playwright";
import { mkdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3001";
const OUT_DIR = "docs/video";
const OUT_FILE = "website-preview.webm";
const VIEWPORT = { width: 1280, height: 720 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PRE_ANSWERS = ["pre-1", "pre-2", "pre-3", "pre-4", "pre-5"].map(
  (id, index) => ({
    questionId: id,
    selectedOptionId: `${id}-${["b", "b", "b", "b", "b"][index]}`,
    isCorrect: true,
  })
);

const HOTSPOT_IDS = [
  "hs-nicotine",
  "hs-pg-vg",
  "hs-formaldehyde",
  "hs-acrolein",
  "hs-lithium",
];

function makeQuizState(overrides = {}) {
  return {
    state: {
      userId: "preview-demo",
      nickname: "น้องมิ้น",
      email: "preview@demo.local",
      grade: "ม.2",
      consentAccepted: true,
      preScore: 5,
      postScore: 5,
      preAnswers: PRE_ANSWERS,
      postAnswers: PRE_ANSWERS.map((a) => ({
        ...a,
        questionId: a.questionId.replace("pre", "post"),
        selectedOptionId: a.selectedOptionId.replace("pre", "post"),
      })),
      currentPhase: "anatomy",
      currentChapter: 1,
      visitedHotspots: [],
      resultSaved: false,
      ...overrides,
    },
    version: 0,
  };
}

async function smoothScroll(page, distance, steps = 24) {
  await page.evaluate(
    async ({ distance: total, steps: count }) => {
      const step = total / count;
      for (let i = 0; i < count; i += 1) {
        window.scrollBy(0, step);
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
    },
    { distance, steps }
  );
}

async function seedQuizState(page, state) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((payload) => {
    localStorage.setItem("anatomy-of-vapes-quiz", JSON.stringify(payload));
  }, state);
}

async function hideDevUi(page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-dev-tools-button],
      [data-nextjs-toast],
      #__next-build-watcher { display: none !important; }
    `,
  });
}

async function waitForHeroModel(page) {
  await page
    .getByText("กำลังโหลดโมเดล", { exact: false })
    .waitFor({ state: "hidden", timeout: 90_000 })
    .catch(() => {});
  await sleep(1200);
}

async function recordLanding(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await hideDevUi(page);
  await waitForHeroModel(page);
  await sleep(1800);
  await smoothScroll(page, 900);
  await sleep(1200);
  await smoothScroll(page, 900);
  await sleep(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(1400);
}

async function recordRegister(page) {
  await page.getByRole("link", { name: "ลงทะเบียนเรียน" }).first().click();
  await page.waitForURL("**/register");
  await sleep(1600);
  await smoothScroll(page, 420);
  await sleep(1200);
}

async function recordAnatomy(page) {
  await seedQuizState(page, makeQuizState({ currentPhase: "anatomy" }));
  await page.goto(`${BASE_URL}/anatomy`, { waitUntil: "networkidle" });
  await hideDevUi(page);
  await waitForHeroModel(page);
  await sleep(1500);

  await page.getByRole("group", { name: "โหมดการดูโมเดล" }).getByRole("button", { name: "ทั้งชิ้น" }).click();
  await sleep(1200);
  await page.getByRole("group", { name: "โหมดการดูโมเดล" }).getByRole("button", { name: "แยกชิ้นส่วน" }).click();
  await sleep(1200);

  for (const label of ["นิโคติน", "PG/VG", "ฟอร์มาลดีไฮด์"]) {
    const item = page
      .locator('section[aria-labelledby="hotspot-list-heading"]')
      .getByRole("button", { name: new RegExp(label) })
      .first();
    if (await item.isVisible().catch(() => false)) {
      await item.click();
      await sleep(2200);
      const close = page.getByRole("button", { name: "ปิด" }).first();
      if (await close.isVisible().catch(() => false)) {
        await close.click();
        await sleep(600);
      }
    }
  }

  const canvas = page.locator("canvas").first();
  if (await canvas.isVisible().catch(() => false)) {
    const box = await canvas.boundingBox();
    if (box) {
      const cx = box.x + box.width * 0.5;
      const cy = box.y + box.height * 0.5;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx + 120, cy - 40, { steps: 18 });
      await page.mouse.up();
      await sleep(1200);
    }
  }
}

async function recordChat(page) {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await hideDevUi(page);
  await waitForHeroModel(page);
  await page.getByRole("button", { name: "เปิดผู้ช่วยเรียนรู้" }).click();
  await sleep(1000);

  const prompt = page
    .getByRole("button", { name: /นิโคติน|บุหรี่ไฟฟ้ามีส่วนประกอบ|ไอจากบุหรี่ไฟฟ้า/ })
    .first();
  if (await prompt.isVisible().catch(() => false)) {
    await prompt.click();
    await sleep(12_000);
  } else {
    await page.getByPlaceholder(/พิมพ์|ถาม/).fill("นิโคตินอันตรายอย่างไร");
    await page.keyboard.press("Enter");
    await sleep(12_000);
  }
}

async function recordResult(page) {
  await seedQuizState(
    page,
    makeQuizState({
      currentPhase: "result",
      visitedHotspots: HOTSPOT_IDS,
      resultSaved: true,
      preScore: 3,
      postScore: 5,
    })
  );
  await page.goto(`${BASE_URL}/result`, { waitUntil: "networkidle" });
  await hideDevUi(page);
  await sleep(1800);
  await smoothScroll(page, 500);
  await sleep(1600);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, OUT_FILE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: {
      dir: OUT_DIR,
      size: VIEWPORT,
    },
    locale: "th-TH",
    colorScheme: "dark",
  });

  const page = await context.newPage();

  try {
    await recordLanding(page);
    await recordRegister(page);
    await recordAnatomy(page);
    await recordChat(page);
    await recordResult(page);
    await sleep(1200);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (!video) {
      throw new Error("Playwright did not produce a video artifact.");
    }

    const tempPath = await video.path();
    try {
      await unlink(outPath);
    } catch {
      /* first run */
    }
    await rename(tempPath, outPath);
    console.log(`Preview saved to ${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
