# อภิธานศัพท์โปรเจกต์ — Anatomy of Vapes / ส่องไส้ใน

**สำหรับ:** การศึกษา / อ่านโค้ดและเอกสารให้เข้าใจศัพท์เดียวกัน  
**เอกสารคู่กัน:** [STUDY-GUIDE-v0.2.0.md](./STUDY-GUIDE-v0.2.0.md) · [VERSION-CONTROL.md](./VERSION-CONTROL.md) · [SETUP.md](./SETUP.md) · [CHANGELOG.md](./CHANGELOG.md)

เอกสารนี้อธิบายคำที่เจอบ่อยใน repo นี้ ตามความหมายที่ใช้จริงในโปรเจกต์ (ไม่ใช่พจนานุกรมทั่วไป)

---

## วิธีใช้

1. เจอคำในโค้ด / README / STUDY-GUIDE ที่ไม่คุ้น → ค้นในหน้านี้ (Ctrl/Cmd+F)
2. อยากเข้าใจ flow ทั้งก้อน → อ่านหมวด **ผลิตภัณฑ์และผู้ใช้** + **Learner flow**
3. อยากเข้าใจ Git → อ่านหมวด **Version Control** หรือเปิด [VERSION-CONTROL.md](./VERSION-CONTROL.md)

---

## 1. ผลิตภัณฑ์และผู้ใช้

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **Anatomy of Vapes** | ชื่อผลิตภัณฑ์ภาษาอังกฤษของเว็บเรียนรู้ 3D เกี่ยวกับบุหรี่ไฟฟ้า | README, PRODUCT.md |
| **ส่องไส้ใน / ส่องไส้ในบุหรี่ไฟฟ้า** | ชื่อเรียกภาษาไทย / framing ของผลิตภัณฑ์ | README, STUDY-GUIDE |
| **Learner** | ผู้เรียน — กลุ่มหลัก ใช้มือถือ เดิน flow ลงทะเบียน→ควิซ→3D→ผล | ทั้งแอปฝั่งผู้ใช้ |
| **Admin** | ผู้ดูแล/นักวิจัยที่ดูสถิติและ Export CSV ที่ `/admin` | `app/admin/*` |
| **Facilitator / Teacher** | ผู้จัดกิจกรรมพาผู้เรียนเข้าเว็บ (มักผ่าน QR) — ไม่ใช่ role ในระบบแยกต่างหาก | PRODUCT.md |
| **Mobile-first** | ออกแบบและทดสอบโดยยึดมือถือเป็นหลัก | PRODUCT.md, STUDY-GUIDE |
| **PDPA** | พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล — ผู้เรียนต้องยินยอมก่อนเก็บข้อมูลการเรียน | `/register`, ตาราง `consent` |
| **Consent** | การยินยอม PDPA; ใน state คือ `consentAccepted` | `store/useQuizStore.ts`, `consent` table |
| **Nickname** | ชื่อเล่นผู้เรียน (ไม่ใช้ email ฝั่ง learner) | `/register`, `/login` |
| **Grade** | ระดับการศึกษาที่เลือกตอนลงทะเบียน (ชนิด `Grade` ใน `types`) | `types/index.ts`, ฟอร์มสมัคร |
| **QR** | ลิงก์เข้าเว็บผ่านคิวอาร์ (บริบทห้องเรียน/แคมเปญ) | PRODUCT.md, README |
| **MVP** | ขอบเขตเวอร์ชันปัจจุบันที่ยืนยันแล้วว่ามี — สิ่งนอก MVP อย่าสมมติว่ามี | PRODUCT.md |
| **Improvement** | พัฒนาการคะแนน (post − pre หรือค่าที่คำนวณใน DB) | หน้า result, `quiz_results` |
| **Evidence-based learning** | หลักการวัดความรู้ก่อน–หลัง ไม่ใช่แค่ดูเนื้อหา | PRODUCT.md |

---

## 2. Learner flow และ state

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **Flow / User journey** | ลำดับหน้าที่ผู้เรียนต้องเดิน | STUDY-GUIDE §5 |
| **Phase (`AppPhase`)** | ขั้นของเครื่องสถานะผู้เรียน: `registration` → `pretest` → `anatomy` → `posttest` → `result` | `types/index.ts`, `lib/phase.ts` |
| **Phase gate** | กติกาห้ามข้ามขั้น (เช่น ยังไม่จบ pretest ห้ามเข้า anatomy) | `hooks/useRequirePhase.ts` |
| **Pretest** | แบบทดสอบก่อนเรียน 5 ข้อ; route `/pretest` | `app/pretest`, `QuizType` |
| **Posttest** | แบบทดสอบหลังเรียน 5 ข้อ; route `/posttest` | `app/posttest` |
| **Anatomy** | หน้าสำรวจโมเดล 3D + hotspot; route `/anatomy` | `app/anatomy` |
| **Result** | หน้าสรุปคะแนน pre/post และบันทึกผล | `app/result` |
| **Registration** | ขั้นลงทะเบียน (ชื่อเล่น + ระดับชั้น + PDPA) | `/register`, phase `registration` |
| **Session** | สถานะการเรียนค้างในเบราว์เซอร์ของผู้เรียนคนนั้น | Zustand persist |
| **Persist** | การเก็บ state ลง `localStorage` ให้รีเฟรชแล้วยังอยู่ | `zustand/middleware` ใน store |
| **Zustand** | ไลบรารี state ฝั่ง client ที่โปรเจกต์ใช้ | `store/useQuizStore.ts` |
| **`useQuizStore`** | store หลักของ learner (ตัวตน, คะแนน, phase, hotspot) | `store/useQuizStore.ts` |
| **`visitedHotspots`** | รายการ id จุดสารพิษที่สำรวจแล้ว — ต้องครบถึงไป posttest ได้ | store |
| **`resultSaved`** | ธงว่าบันทึกคะแนนลง DB แล้ว (กันบันทึกซ้ำ) | store, `lib/db.ts` |
| **`resetProgress`** | ล้างความคืบหน้าควิซ แต่เก็บตัวตนผู้เรียน | store |
| **`logout`** | ล้างทั้งตัวตนและความคืบหน้า | store |
| **Review mode** | หลังอยู่ใน phase `result` แล้วยังกลับดู `/anatomy` ได้โดยไม่รีเซ็ตผลที่บันทึกแล้ว | STUDY-GUIDE, anatomy |
| **Retake** | ทางเลือกผู้เรียนเก่า: ทำแบบทดสอบใหม่ (คู่กับ review) | UI หน้าแรก / returning learner |
| **Happy path** | เส้นทางใช้งานปกติที่สำเร็จตลอดโดยไม่มี error | STUDY-GUIDE §11 |
| **Stepper** | UI แสดงขั้นความคืบหน้าใน flow | `components/layout` |

---

## 3. ควิซและเนื้อหา

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **QuizEngine** | คอมโพเนนต์ควบคุมการตอบควิซทีละข้อ | `components/quiz/QuizEngine.tsx` |
| **`QuizQuestion`** | โครงสร้างคำถามหนึ่งข้อ | `types/index.ts`, `data/quiz-questions.ts` |
| **`QuizAnswer`** | คำตอบที่ผู้เรียนเลือก (เก็บใน store / DB) | types, store |
| **`QuizType`** | ชนิดควิซ: `"pretest"` \| `"posttest"` | `types/index.ts` |
| **`preScore` / `postScore`** | คะแนนรวมก่อนเรียน / หลังเรียน | store, หน้า result |
| **Hotspot** | จุดบนโมเดล 3D ที่แตะแล้วเปิดข้อมูลสารพิษ | `data/hotspots.ts`, anatomy |
| **HotspotList** | รายการจุดสำรวจสำรองเมื่อแตะบนโมเดลยาก (มือถือ) | components hotspot |
| **Popup** | หน้าต่างรายละเอียดเมื่อเลือก hotspot | `components/popup` / hotspot UI |
| **Myth vs fact** | รูปแบบเนื้อหาใน hotspot: ความเชื่อผิด vs ข้อเท็จจริง | ข้อมูล hotspot / PRODUCT |
| **Toxin** | สารพิษที่สอนผ่าน hotspot (เช่น nicotine, formaldehyde) | `data/hotspots.ts` |
| **Chapter** | บท/ตอนใน state (`currentChapter`) — ใช้คู่กับ flow เนื้อหา | store |

---

## 4. กราฟิก 3D และประสิทธิภาพมือถือ

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **Three.js** | ไลบรารี WebGL สำหรับเรนเดอร์ 3D | dependencies, `components/three` |
| **React Three Fiber (R3F)** | เขียน Three.js ด้วย React components | `@react-three/fiber` |
| **Drei** | ชุด helper ของ R3F (controls, loaders ฯลฯ) | `@react-three/drei` |
| **WebGL** | API กราฟิกในเบราว์เซอร์ที่ Three.js ใช้ | บริบท performance |
| **Canvas** | พื้นที่วาดฉาก 3D ในหน้า | `VapeScene`, Hero canvas |
| **GLB** | ไฟล์โมเดล 3D ที่โหลดในแอป | `public/models/*.glb` |
| **Mouthpiece / CoilTank / Battery** | ชิ้นส่วนโมเดล: ปากสูบ / แท็งก์คอยล์ / แบต | ไฟล์โมเดล + exploded view |
| **Exploded view** | โหมดแยกชิ้นส่วนโมเดลให้ออกจากกันเพื่อดูภายใน | anatomy UI |
| **Orbit / หมุนซูม** | การหมุนกล้องรอบโมเดลและซูมเข้าออก | controls ใน scene |
| **Lite 3D** | โหมดเบา: ลดคุณภาพกราฟิกบนเครื่องช้า/มือถือ | `usePreferLite3D` |
| **DPR (device pixel ratio)** | ความละเอียดเรนเดอร์เทียบพิกเซลจอ — ลด DPR = เบาขึ้น | lite 3D |
| **Frameloop `demand`** | เรนเดอร์ WebGL เฉพาะเมื่อต้องการ ไม่หมุนเฟรมตลอดเวลา | scene config |
| **Environment / shadows** | แสงสะท้อนสภาพแวดล้อมและเงา — มักตัดใน lite mode | Three/R3F |
| **Preload** | โหลดโมเดลล่วงหน้าเมื่อเข้าหน้า anatomy | STUDY-GUIDE performance |
| **Hero** | ส่วนหัวหน้าแรก (แบรนด์ + CTA + ภาพ/3D เบา) | `components/Hero.tsx` |
| **Fullscreen** | โหมดเต็มจอตอนสำรวจ anatomy | `lib/scene-fullscreen.ts` |
| **CSS fullscreen fallback** | ทางเลือกบน iPhone ที่ Fullscreen API ใช้กับ `<div>` ไม่ได้ — ใช้ CSS `fixed` แทน | CHANGELOG, scene-fullscreen |
| **Portal (fullscreen)** | ย้าย popup เข้า root ที่ถูก fullscreen เพื่อให้แตะได้ | CHANGELOG #2 |
| **Touch target** | พื้นที่แตะบนมือถือ — ขยายให้กดง่ายขึ้น | UI hotspot |
| **PerformanceMonitor** | ตัวช่วยปรับประสิทธิภาพฉาก 3D | R3F / scene |

---

## 5. ฟรอนต์เอนด์และสถาปัตยกรรมเว็บ

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **Next.js** | เฟรมเวิร์ก React ของแอป (เวอร์ชันใน repo มี breaking changes — อ่าน docs ใน `node_modules/next`) | `package.json`, AGENTS.md |
| **App Router** | ระบบ routing แบบโฟลเดอร์ใต้ `app/` | `app/**/page.tsx` |
| **Route** | เส้นทาง URL ของหน้า เช่น `/anatomy` | `app/` |
| **Server / Client Component** | คอมโพเนนต์ฝั่งเซิร์ฟเวอร์ vs ที่รันในเบราว์เซอร์ (`"use client"`) | ไฟล์ใน `app/`, `components/` |
| **React** | ไลบรารี UI หลัก | dependencies |
| **Tailwind CSS** | เฟรมเวิร์ก utility CSS | `tailwind.config.ts` |
| **shadcn / Base UI** | ชุดคอมโพเนนต์ UI ที่โปรเจกต์ใช้ต่อยอด | `components.json`, UI kit |
| **Framer Motion** | ไลบรารีแอนิเมชัน | motion ใน UI |
| **Hydration** | ตอน React ฝั่ง client มา “ต่อ” HTML จากเซิร์ฟเวอร์ — ต้องตรงกัน | theme fix |
| **Hydration mismatch** | HTML เซิร์ฟเวอร์กับ client ไม่ตรง (เคยเกิดที่ ThemeToggle) | CHANGELOG |
| **Theme / ThemeToggle** | ธีมมืด–สว่างและปุ่มสลับ | `components/theme`, `lib/theme.ts` |
| **`useServerInsertedHTML`** | API แทรก HTML/สคริปต์ตอน SSR (ใช้กับ theme) | layout / theme |
| **Navigation progress** | แถบโหลดตอนเปลี่ยนหน้า | `NavigationProgressBar` |
| **`useAppRouter`** | wrapper นำทางที่ช่วย UX ตอนเปลี่ยนหน้า | hooks |
| **Responsive** | ปรับเลย์เอาต์ตามขนาดจอ | ทั้งแอป |
| **LAN / `dev:mobile`** | รัน dev ให้มือถือในเครือข่ายเดียวกันเข้าได้ | `npm run dev:mobile`, SETUP |
| **`allowedDevOrigins`** | ตั้งใน Next ให้เครื่องอื่นใน LAN โหลด `/_next` ได้ | `next.config.ts` |
| **Vercel** | เป้า deploy production | PRODUCT, SETUP |
| **Environment variable (env)** | ค่าตั้งค่าภายนอกโค้ด เช่น URL/key ของ Supabase | `.env.example`, `.env.local` |
| **`.env.local`** | ไฟล์ env จริงบนเครื่อง — **ห้าม commit** | SETUP, `.gitignore` |
| **`.env.example`** | ตัวอย่าง env ที่ commit ได้ ไม่มีค่าลับ | repo root |

---

## 6. ฐานข้อมูล Supabase และความปลอดภัย

| คำ | ความหมายในโปรเจกต์นี้ | เจอที่ไหนโดยประมาณ |
|----|------------------------|---------------------|
| **Supabase** | Backend: Postgres + Auth + API ที่แอปคุยด้วย | `lib/supabase.ts`, SETUP |
| **Postgres** | ฐานข้อมูลหลักหลัง Supabase | migrations |
| **Migration** | สคริปต์ SQL เปลี่ยน schema ตามลำดับไฟล์ | `supabase/migrations/` |
| **RLS (Row Level Security)** | นโยบายระดับแถวว่าใคร insert/select อะไรได้ | migrations, STUDY-GUIDE |
| **Anon key** | คีย์สาธารณะฝั่ง client สำหรับผู้เรียน (จำกัดสิทธิ์ด้วย RLS) | `.env`, SETUP |
| **Service role key** | คีย์สิทธิ์สูงฝั่งเซิร์ฟเวอร์ — **ห้ามใส่ใน browser** | SETUP |
| **Auth** | ระบบล็อกอินแอดมิน (email/password) | `/admin/login` |
| **RPC** | เรียกฟังก์ชัน SQL ผ่าน client แทน query ตรง | `lib/db.ts` |
| **`SECURITY DEFINER`** | ฟังก์ชัน SQL รันด้วยสิทธิ์ผู้สร้าง — ใช้ให้ learner อ่านเท่าที่จำเป็นผ่าน RPC | migrations |
| **`find_learner_by_nickname`** | RPC หาผู้เรียนจากชื่อเล่นตอน login | migration learner |
| **Client UUID** | สร้าง `id` ที่เบราว์เซอร์แล้ว insert โดยไม่พึ่ง `select` กลับ | `lib/db.ts`, STUDY-GUIDE |
| **Insert-heavy** | แบบออกแบบที่ผู้เรียนเน้นเขียนข้อมูล มากกว่าอ่านตรง ๆ | STUDY-GUIDE สรุป |
| **`users`** | ตารางผู้เรียน (id, nickname, grade) | migrations |
| **`consent`** | ตารางบันทึกการยินยอม PDPA | migrations |
| **`quiz_results`** | ตารางคะแนน pre/post (+ improvement) | migrations |
| **`quiz_answers`** | คำตอบรายข้อ | migrations |
| **`admin_results`** | view รวมผลสำหรับแอดมิน | migrations |
| **GRANT** | การให้สิทธิ์ตาราง/ฟังก์ชันแก่ role เช่น `anon` | `004_fix_grants.sql` |
| **Local fallback** | พฤติกรรมเมื่อยังไม่ใส่ Supabase key จริง — แอปยังรันได้บางส่วน | SETUP |
| **CSV export** | ดาวน์โหลดผลรวมเป็นไฟล์ CSV จากแดชบอร์ด | `lib/csv.ts`, admin |

---

## 7. Version Control (Git / GitHub)

คำละเอียดและขั้นตอนอยู่ที่ [VERSION-CONTROL.md](./VERSION-CONTROL.md) — สรุปสั้นที่นี่:

| คำ | ความหมายสั้นในโปรเจกต์นี้ |
|----|---------------------------|
| **Version Control** | ระบบเก็บประวัติการเปลี่ยนแปลงโค้ด (ที่นี่ใช้ Git) |
| **Git** | เครื่องมือ version control บนเครื่อง |
| **GitHub** | ที่เก็บ remote ของ repo นี้ |
| **Repository (repo)** | โปรเจกต์ที่ Git ดูแล — `anatomy-of-vapes` |
| **Clone** | คัดลอก repo จาก GitHub มาเครื่อง |
| **Commit** | จุดบันทึกประวัติพร้อมข้อความ |
| **Branch** | สายพัฒนาแยก — สาขาศึกษาหลัก: `cursor/thai-mobile-learner-ux` |
| **Tag** | ป้ายเวอร์ชัน — เช่น `v0.2.0` |
| **Remote / `origin`** | สำเนาบน GitHub |
| **Push / Pull** | ส่งขึ้น remote / ดึงจาก remote |
| **Staging (`git add`)** | เลือกไฟล์เข้า commit ถัดไป |
| **Working tree** | ไฟล์ที่กำลังแก้บนเครื่อง |
| **Merge** | รวมสาขาเข้าด้วยกัน |
| **Pull Request (PR)** | คำขอบน GitHub ให้รีวิวแล้วรวมโค้ด |
| **Conflict** | ไฟล์ชนกันตอน merge ต้องเลือกรุ่น |
| **`.gitignore`** | รายการไฟล์ที่ไม่ให้ Git ติดตาม (เช่น `.env.local`, `node_modules`) |
| **Changelog** | บันทึกสิ่งที่เปลี่ยนในแต่ละเวอร์ชัน | ดู [CHANGELOG.md](./CHANGELOG.md) |
| **v0.2.0 Thai Mobile Learner** | ชื่อเวอร์ชันศึกษาปัจจุบันของเอกสารชุดนี้ |

---

## 8. ไฟล์และโฟลเดอร์ที่ถูกเรียกบ่อย

| ชื่อ | คืออะไร |
|------|---------|
| **`app/`** | หน้าและ routing (App Router) |
| **`components/`** | คอมโพเนนต์ UI / 3D / quiz |
| **`store/`** | Zustand store ของ learner |
| **`lib/`** | ตรรกะช่วย: db, phase, theme, fullscreen, csv |
| **`data/`** | เนื้อหาคำถาม hotspot myth (แก้ง่ายโดยไม่แตะ logic ลึก) |
| **`hooks/`** | React hooks (phase gate, lite 3D, fullscreen, router) |
| **`types/`** | TypeScript types กลาง |
| **`supabase/migrations/`** | SQL schema ตามลำดับ |
| **`public/models/`** | ไฟล์ GLB |
| **`docs/`** | เอกสารศึกษา SETUP / CHANGELOG / STUDY-GUIDE / VC / อภิธานนี้ |
| **`scripts/`** | สคริปต์ช่วย เช่นพิมพ์ URL มือถือ, apply migration |

---

## 9. คำย่อที่เจอบ่อย

| ย่อ | เต็ม / ความหมายสั้น |
|-----|---------------------|
| **UI / UX** | ส่วนติดต่อผู้ใช้ / ประสบการณ์การใช้งาน |
| **CTA** | Call to Action — ปุ่มชวนเริ่มเรียน ฯลฯ |
| **DB** | Database |
| **SQL** | ภาษาคิวรีฐานข้อมูล |
| **API** | ช่องทางเรียกบริการ (เช่น Supabase client) |
| **SSR** | Server-Side Rendering |
| **CSS** | ภาษาสไตล์ |
| **LAN** | เครือข่ายท้องถิ่น (Wi‑Fi เดียวกัน) |
| **iOS** | ระบบของ iPhone/iPad — เกี่ยว fullscreen fallback |
| **UUID** | รหัสเอกลักษณ์สากลของแถว/ผู้ใช้ |
| **CSV** | ไฟล์ตารางข้อความคั่นด้วยจุลภาค |
| **GLB / glTF** | ฟอร์แมตโมเดล 3D |
| **DPR** | Device Pixel Ratio |
| **RPC** | Remote Procedure Call (ฟังก์ชันบน DB) |
| **RLS** | Row Level Security |
| **PDPA** | พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล |
| **PR** | Pull Request |
| **VC** | Version Control |

---

## 10. สรุปการจำแบบกลุ่ม

1. **ผลิตภัณฑ์:** learner มือถือไทย → PDPA → pretest → anatomy/hotspot → posttest → result  
2. **สมอง client:** Zustand + phase + persist  
3. **สมอง server:** Supabase + RLS + RPC + insert ด้วย client UUID  
4. **3D:** Three/R3F + GLB + lite mode + fullscreen (iOS fallback)  
5. **Git:** branch / commit / tag `v0.2.0` — รายละเอียดใน [VERSION-CONTROL.md](./VERSION-CONTROL.md)

ถ้าเจอคำใหม่ในโค้ดที่ยังไม่มีในฉบับนี้ ให้เพิ่มแถวในหมวดที่เกี่ยวข้อง แล้วอธิบายตาม **ความหมายที่ใช้ใน repo นี้** เป็นหลัก
