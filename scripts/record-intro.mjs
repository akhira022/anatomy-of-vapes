/**
 * Record a short (~25–35s) intro clip for presentations.
 * Usage: node scripts/record-intro.mjs
 */
import { chromium } from "playwright";
import { mkdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:3001";
const OUT_DIR = "docs/video";
const OUT_FILE = "website-intro.webm";
const VIEWPORT = { width: 1280, height: 720 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HOTSPOT_IDS = [
  "hs-nicotine",
  "hs-pg-vg",
  "hs-formaldehyde",
  "hs-acrolein",
  "hs-lithium",
];

const PRE_ANSWERS = ["pre-1", "pre-2", "pre-3", "pre-4", "pre-5"].map((id) => ({
  questionId: id,
  selectedOptionId: `${id}-b`,
  isCorrect: true,
}));

function makeQuizState(overrides = {}) {
  return {
    state: {
      userId: "intro-demo",
      nickname: "น้องมิ้น",
      email: "intro@demo.local",
      grade: "ม.2",
      consentAccepted: true,
      preScore: 2,
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

const TITLE_HTML = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(229,57,53,0.22), transparent 70%),
        #080808;
      color: #fff;
      font-family: system-ui, sans-serif;
      text-align: center;
      padding: 2rem;
    }
    .eyebrow {
      margin: 0 0 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.28em;
      color: #e53935;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3.25rem);
      line-height: 1.05;
    }
    .subtitle {
      margin: 0.85rem 0 0;
      font-size: clamp(1.1rem, 2.5vw, 1.5rem);
      color: #d4d4d8;
      font-weight: 500;
    }
    .tagline {
      margin: 1.25rem 0 0;
      font-size: 1rem;
      color: #a1a1aa;
    }
  </style>
</head>
<body>
  <div>
    <p class="eyebrow">ANATOMY OF VAPES</p>
    <h1 id="title"></h1>
    <p class="subtitle" id="subtitle"></p>
    <p class="tagline" id="tagline"></p>
  </div>
  <script>
    const params = new URLSearchParams(location.search);
    document.getElementById('title').textContent = params.get('title') || '';
    document.getElementById('subtitle').textContent = params.get('subtitle') || '';
    const tagline = params.get('tagline');
    if (tagline) document.getElementById('tagline').textContent = tagline;
  </script>
</body>
</html>`;

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

async function showTitle(page, { title, subtitle, tagline, durationMs }) {
  const url = `data:text/html;charset=utf-8,${encodeURIComponent(
    TITLE_HTML.replace(
      "id=\"title\"></h1>",
      `id="title">${title}</h1>`
    )
      .replace(
        "id=\"subtitle\"></p>",
        `id="subtitle">${subtitle}</p>`
      )
      .replace(
        tagline
          ? "id=\"tagline\"></p>"
          : "<p class=\"tagline\" id=\"tagline\"></p>",
        tagline ? `id="tagline">${tagline}</p>` : ""
      )
  )}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await sleep(durationMs);
}

async function waitForModel(page, timeout = 25_000) {
  await page
    .getByText("กำลังโหลดโมเดล", { exact: false })
    .waitFor({ state: "hidden", timeout })
    .catch(() => {});
  await sleep(400);
}

async function seedQuizState(page, state) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((payload) => {
    localStorage.setItem("anatomy-of-vapes-quiz", JSON.stringify(payload));
  }, state);
}

async function dragCanvas(page) {
  const canvas = page.locator("canvas").first();
  if (!(await canvas.isVisible().catch(() => false))) return;
  const box = await canvas.boundingBox();
  if (!box) return;
  const cx = box.x + box.width * 0.52;
  const cy = box.y + box.height * 0.48;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 130, cy - 25, { steps: 12 });
  await page.mouse.up();
}

async function recordIntro(page) {
  await showTitle(page, {
    title: "Anatomy of Vapes",
    subtitle: "ส่องไส้ในบุหรี่ไฟฟ้า",
    tagline: "เรียนรู้ผ่านโมเดล 3D · แบบทดสอบ · AI ผู้ช่วย",
    durationMs: 2200,
  });

  await seedQuizState(page, makeQuizState({ currentPhase: "anatomy" }));
  await page.goto(`${BASE_URL}/anatomy`, { waitUntil: "domcontentloaded" });
  await hideDevUi(page);
  await waitForModel(page);

  await page
    .getByRole("group", { name: "โหมดการดูโมเดล" })
    .getByRole("button", { name: "แยกชิ้นส่วน" })
    .click();
  await sleep(500);
  await dragCanvas(page);
  await sleep(600);

  const nicotine = page
    .locator('section[aria-labelledby="hotspot-list-heading"]')
    .getByRole("button", { name: /นิโคติน/ })
    .first();
  if (await nicotine.isVisible().catch(() => false)) {
    await nicotine.click();
    await sleep(1400);
    await page.getByRole("button", { name: "ปิด" }).first().click().catch(() => {});
    await sleep(300);
  }

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await hideDevUi(page);
  await waitForModel(page, 12_000);
  await page.getByRole("button", { name: "เปิดผู้ช่วยเรียนรู้" }).click();
  await sleep(400);
  const prompt = page
    .getByRole("button", { name: /นิโคติน|ไอจากบุหรี่ไฟฟ้า/ })
    .first();
  if (await prompt.isVisible().catch(() => false)) {
    await prompt.click();
    await sleep(4200);
  }

  await seedQuizState(
    page,
    makeQuizState({
      currentPhase: "result",
      visitedHotspots: HOTSPOT_IDS,
      resultSaved: true,
      preScore: 2,
      postScore: 5,
    })
  );
  await page.goto(`${BASE_URL}/result`, { waitUntil: "domcontentloaded" });
  await hideDevUi(page);
  await sleep(1400);

  await showTitle(page, {
    title: "วัดผลการเรียนรู้ได้จริง",
    subtitle: "Pretest → สำรวจ 3D → Posttest",
    tagline: "เริ่มเรียนรู้วันนี้",
    durationMs: 2000,
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, OUT_FILE);

  const warmBrowser = await chromium.launch({ headless: true });
  const warmPage = await warmBrowser.newPage();
  await seedQuizState(warmPage, makeQuizState({ currentPhase: "anatomy" }));
  await warmPage.goto(`${BASE_URL}/anatomy`, { waitUntil: "domcontentloaded" });
  await waitForModel(warmPage, 45_000);
  await warmBrowser.close();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
    locale: "th-TH",
    colorScheme: "dark",
  });

  const page = await context.newPage();

  try {
    await recordIntro(page);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (!video) throw new Error("No video artifact produced.");

    const tempPath = await video.path();
    try {
      await unlink(outPath);
    } catch {
      /* first run */
    }
    await rename(tempPath, outPath);
    console.log(`Intro saved to ${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
