# Anatomy of Vapes — Supabase setup

คู่มือขั้นตอนทั้งโปรเจกต์ (UX/UI → หน้า → DB → Deploy): **[PROJECT-GUIDE.md](./PROJECT-GUIDE.md)**

## Checklist (โปรเจกต์ใหม่)

1. [ ] สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) (แนะนำ region Singapore)
2. [ ] คัดลอก **Project URL** + **anon public key** จาก Settings → API
3. [ ] ใส่ค่าใน `.env.local` (คัดลอกจาก `.env.example` ถ้ายังไม่มี)
4. [ ] รัน SQL ทั้งไฟล์ `supabase/migrations/001_init.sql` ใน SQL Editor
5. [ ] รัน SQL `supabase/migrations/005_learner_rpcs.sql` (login ด้วยชื่อเล่น + กันบันทึกคะแนนซ้ำ — สำคัญ)
6. [ ] Authentication → Users → Add user (email/password) สำหรับแอดมิน
7. [ ] รีสตาร์ท `npm run dev` แล้วทดสอบ checklist ด้านล่าง

> หมายเหตุ: แอปเขียนข้อมูลด้วย anon key แบบ insert + UUID จากฝั่ง client (ไม่ใช้ SELECT) จึงไม่ต้องเปิดสิทธิ์อ่านตารางให้ผู้เรียน

อย่า commit `.env.local` และอย่าใส่ **service role key** ในโค้ดฝั่ง client

## 1. Environment

```bash
cp .env.example .env.local
```

แก้ไขค่าจริง:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

ค่า placeholder (`your-project.supabase.co` / `your-anon-key`) จะถือว่ายังไม่ได้ตั้งค่า — แอปจะทำงานแบบ local fallback จนกว่าจะใส่ key จริง

ตัวเลือกเพิ่มเติม:

- `SUPABASE_SERVICE_ROLE_KEY` — ใช้เฉพาะเครื่องมือฝั่งเซิร์ฟเวอร์ (ห้ามเปิดใน browser)
- `NEXT_PUBLIC_ADMIN_EMAIL` — hint ใน UI แอดมิน
- `NEXT_PUBLIC_GA_ID` — Google Analytics 4

## 2. Database

**วิธีที่แนะนำ:** เปิด SQL Editor ใน Dashboard → วางทั้งไฟล์ `supabase/migrations/001_init.sql` → Run

**ทางเลือก (CLI):** ตั้ง `DATABASE_URL` จาก Settings → Database → Connection string แล้วรัน:

```bash
npm install -D pg
node scripts/apply-supabase-migration.mjs
```

สคริปต์จะรันไฟล์ใน `supabase/migrations/` ตามลำดับชื่อไฟล์ (รวม `004_fix_grants.sql`)

**ถ้าเจอ `permission denied for table users`:** รันเฉพาะ `004_fix_grants.sql` ใน SQL Editor ทันที — มักเกิดหลัง `revoke` จาก `public` โดยไม่ได้ grant กลับให้ `anon` / `service_role`

สร้าง:

- `users` — ชื่อเล่น + ระดับการศึกษา
- `consent` — PDPA
- `quiz_results` — คะแนน pre/post + `improvement` (generated)
- `quiz_answers` — คำตอบรายข้อ (pretest/posttest)
- RLS: anon/authenticated **INSERT** ได้; authenticated **SELECT** ได้
- view `admin_results` (`security_invoker = true`) สำหรับแดชบอร์ด
- `find_learner_by_nickname` (migration `002`) — ให้ผู้เรียน login ด้วยชื่อเล่นเดิม

## 3. Admin auth

1. ใน Supabase Auth สร้างผู้ใช้ email/password สำหรับแอดมิน
2. เข้าสู่ระบบที่ `/admin/login`

## 4. ทดสอบว่าใช้ได้

1. [ ] เปิด `/admin` — ไม่ควรเห็นหน้า “ยังไม่ได้ตั้งค่า Supabase”
2. [ ] ไป `/register` → กรอกชื่อเล่น + ระดับชั้น + ยอมรับ PDPA
3. [ ] ทำ pretest → anatomy → posttest → หน้า result บันทึกสำเร็จ (ไม่มี toast error)
4. [ ] กลับหน้าหลักแล้วเห็น “ดำเนินการต่อ” / “ออกจากระบบ” โดยไม่ต้องลงทะเบียนใหม่
5. [ ] Logout แล้ว login ที่ `/login` ด้วยชื่อเล่นเดิมได้
6. [ ] ใน Table Editor เห็นแถวใน `users`, `consent`, `quiz_results`, `quiz_answers`
7. [ ] Login `/admin/login` แล้วเห็นสถิติ + ตารางผล
8. [ ] กด Export CSV ได้

## 5. Placeholders to replace later

- Quiz copy: `data/quiz-questions.ts`
- Hotspot copy: `data/hotspots.ts`
- Myth vs Fact: `data/myths.ts`
- 3D model parts: `public/models/mouthpiece.glb`, `coilTank.glb`, `battery.glb` (loaded in `components/three/VapeModel.tsx`)

## 5.1 ทดสอบบนมือถือจริง

คู่มือเต็ม (LAN + Cloudflare Tunnel): **[MOBILE-TUNNEL.md](./MOBILE-TUNNEL.md)**

### แนะนำ — Cloudflare Tunnel (ข้าม Firewall ได้)

เทอร์มินัล 1:

```bash
npm run dev:mobile
```

เทอร์มินัล 2:

```bash
npm run tunnel
```

เปิดลิงก์ `https://….trycloudflare.com` ที่พิมพ์ในคอนโซลบนมือถือ

### สำรอง — LAN

1. มือถือและ PC ต่อ **Wi‑Fi เดียวกัน** (ปิด VPN ชั่วคราว)
2. รัน `npm run dev:mobile` แล้วเปิด `http://192.168.x.x:3001`

ถ้าเปิดไม่ได้: อนุญาตพอร์ต **3001** ใน Firewall หรือใช้ tunnel ด้านบน

Supabase ใช้ URL บน cloud อยู่แล้ว — ไม่ต้องแก้ `.env.local` สำหรับ LAN / tunnel

## 6. Deploy (Vercel)

1. Import the GitHub repo into Vercel
2. ใส่ env เดียวกับ `.env.local` (อย่างน้อย URL + anon key)
3. Deploy แล้วเปิด production URL / QR code
