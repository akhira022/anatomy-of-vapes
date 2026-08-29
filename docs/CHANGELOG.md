# Changelog — Anatomy of Vapes / ส่องไส้ใน

## v0.3.0 — AI RAG Chat (2026-08-29)

ชื่อฟีเจอร์: **AI ผู้ช่วยเรียนรู้ (Knowledge Assistant)**  
คู่มือสถาปัตยกรรมเต็ม: [CHATBOT-RAG-GUIDE.md](./CHATBOT-RAG-GUIDE.md)

### สิ่งที่ได้

- RAG chatbot ภาษาไทย (101 knowledge chunks)
- Chat widget (FAB + drawer) + quick prompts + citations
- Deep link ไป hotspot 3D
- Guardrails (นอกเรื่อง / ข้อสอบ / rate limit)
- Gemini + OpenRouter + local RAG fallback
- คำสั่ง: `build:knowledge`, `test:retrieve`, `test:chat`, `doctor:gemini`

---

## v0.2.0 — Thai Mobile Learner (2026-08-06)

ชื่อเวอร์ชัน: **Thai Mobile Learner**  
แท็ก Git: `v0.2.0`  
สาขา: `cursor/thai-mobile-learner-ux`  
คู่มือศึกษาทั้งระบบ: [STUDY-GUIDE-v0.2.0.md](./STUDY-GUIDE-v0.2.0.md)  
คู่มือขั้นตอนทำเว็บตั้งแต่ต้นจน deploy: [PROJECT-GUIDE.md](./PROJECT-GUIDE.md)

เวอร์ชันนี้โฟกัสผู้เรียนไทยบนมือถือ: flow ครบ, 3D ใช้งานจริง, Supabase learner, และแก้บัคที่เจอระหว่างทดสอบบนเครื่องจริง

### สิ่งที่ได้ในเวอร์ชันนี้

- Flow ผู้เรียน: ลงทะเบียน / login → pretest → anatomy 3D → posttest → ผลลัพธ์
- UI ภาษาไทย + ธีมสว่าง/มืด
- โมเดล 3D จริง (mouthpiece / coilTank / battery) + hotspot + exploded view
- Lite 3D บนมือถือ, progress bar เปลี่ยนหน้า, loading ตอนโหลดโมเดล
- Supabase migrations + learner RPCs + บันทึกคะแนนครั้งเดียวต่อคน
- ทดสอบ LAN มือถือ (`npm run dev:mobile`)

---

### ปัญหาที่เคยเจอและแก้แล้ว

#### มือถือ / 3D / Fullscreen

| # | ปัญหา | สาเหตุ / วิธีแก้ |
|---|--------|------------------|
| 1 | 3D บนจอเล็กไม่เต็มพื้นที่ | Canvas ไม่ยืดเต็มความสูง flex → กำหนดความสูงชัด + `absolute inset-0` |
| 2 | Fullscreen แล้วแตะ hotspot ไม่ขึ้น popup | Popup อยู่นอก element ที่ fullscreen → portal เข้า fullscreen root |
| 3 | iPhone กด Fullscreen ไม่ได้ | iOS Safari ไม่รองรับ Fullscreen API บน `<div>` → CSS fullscreen fallback (`position: fixed` + ล็อกสกอลล์) |
| 4 | มือถือโหลดหน้าแรกค้าง / ช้า | Hero โหลด GLB รวมใหญ่ + Three.js → เครื่องเบาใช้พื้นหลังเบา, preload โมเดลเฉพาะหน้า anatomy |
| 5 | มือถือเปิดเว็บจาก LAN ไม่ขึ้น / ค้างที่โหลด | Next.js บล็อก `/_next` จาก IP มือถือ → `allowedDevOrigins` ใน `next.config.ts` |
| 6 | มือถือต่อ LAN ไม่ได้ทั้งที่ PC ตอบ 200 | Windows Firewall บล็อกพอร์ต → เปิด Node.js / พอร์ต 3000 หรือใช้ tunnel |
| 7 | พอร์ต 3000 ชนกับโปรแกรมอื่น | ย้าย dev ไปพอร์ตอื่นชั่วคราว / ใช้ `dev:mobile` |
| 8 | 3D กระตุกบนมือถือ | ลด DPR, ตัด Environment/shadows ใน lite mode, `frameloop="demand"`, PerformanceMonitor |

#### Routing / Loading UX

| # | ปัญหา | สาเหตุ / วิธีแก้ |
|---|--------|------------------|
| 9 | เปลี่ยนหน้าแล้วไม่รู้ว่ากำลังโหลด | เพิ่ม `NavigationProgressBar` + `useAppRouter` |
| 10 | โมเดล 3D โหลดนานไม่มี feedback | เพิ่ม loading circle / `ModelLoadingOverlay` |
| 11 | `useRef is not defined` ใน VapeScene | ขาด import → แก้ import |
| 12 | Syntax error ใน `HeroVapeCanvas.tsx` | แก้ syntax หลังปรับ loading/performance |

#### Theme / Hydration

| # | ปัญหา | สาเหตุ / วิธีแก้ |
|---|--------|------------------|
| 13 | Hydration mismatch ที่ ThemeToggle | SSR กับ client อ่าน theme คนละค่า → เริ่มที่ `dark` เท่ากัน แล้ว sync หลัง mount |
| 14 | คำเตือน `<script>` tag ใน layout | ย้าย theme script ไป `useServerInsertedHTML`, GA ไป `next/script` |

#### Supabase / ข้อมูลผู้เรียน

| # | ปัญหา | สาเหตุ / วิธีแก้ |
|---|--------|------------------|
| 15 | Insert สำเร็จแต่แอปอ่านแถวกลับไม่ได้ | RLS ไม่มี SELECT ให้ anon → ใช้ client UUID ตอน insert โดยไม่พึ่ง SELECT |
| 16 | GRANT/สิทธิ์หลัง migrate ไม่ครบ | เพิ่ม `004_fix_grants.sql` |
| 17 | Login ด้วยชื่อเล่นเดิมทำไม่ได้ | เพิ่ม `002_learner_login.sql` + RPC `find_learner_by_nickname` |
| 18 | เล่นซ้ำแล้วคะแนนซ้ำลงฐานข้อมูล | `003_one_result_per_learner.sql` + ตรวจว่าเคยมีผลแล้ว |
| 19 | Grade options ไม่ตรง schema | ปรับ CHECK constraint + `DbGrade` ให้ตรงฟอร์ม |
| 20 | Checkbox PDPA กลืนกับพื้นหลัง | ขอบสีตัดกับพื้นมืดชัดขึ้น |

#### UI / Design

| # | ปัญหา | สาเหตุ / วิธีแก้ |
|---|--------|------------------|
| 21 | Hero / hierarchy อ่านยากบนมือถือ | Polish ตาม Impeccable: spacing, typography, ตัด AI slop |
| 22 | Anti-pattern grid-line background | ลบ `.bg-grid-pattern` / grid overlay ตาม audit |
| 23 | แตะ hotspot บนมือถือยาก | เพิ่ม HotspotList สำรอง + ขยาย touch target |
| 24 | ขาดทางกลับมาดูโมเดลหลังจบ | โหมดทบทวน / ปุ่มกลับ anatomy จากผลลัพธ์ |

#### คงเหลือ / นอกขอบเขตแอป

| # | สถานะ | หมายเหตุ |
|---|--------|----------|
| A | ยังแก้ในแอปไม่ได้ | `THREE.Clock` deprecated จาก `@react-three/fiber` + three.js — รอ library อัปเดต |
| B | ต้องตั้งนอกโค้ด | Vercel deploy, เนื้อหาคำถามจริง, firewall / IP LAN ตามเครื่อง |

---

### หมายเหตุสำหรับผู้พัฒนา

- ทดสอบมือถือ: `npm run dev:mobile` แล้วเปิด URL ที่พิมพ์ในคอนโซล (ดู `docs/SETUP.md` § 5.1)
- Migrations รันตามลำดับใน `supabase/migrations/`
- อย่า commit `.env.local` หรือ secret keys
