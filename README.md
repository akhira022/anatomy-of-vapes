# Anatomy of Vapes / ส่องไส้ในบุหรี่ไฟฟ้า

เว็บแอปการศึกษาแบบ interactive (มือถือเป็นหลัก) ให้สำรวจโมเดลบุหรี่ไฟฟ้า 3D ทำแบบทดสอบก่อน–หลังเรียน และดูพัฒนาการคะแนน

## เอกสารสำหรับเรียนรู้โปรเจกต์

เริ่มจากคู่มือนี้:

| เอกสาร | เนื้อหา |
|--------|---------|
| **[docs/PROJECT-GUIDE.md](./docs/PROJECT-GUIDE.md)** | **ขั้นตอนทั้งหมด:** คิดผลิตภัณฑ์ → UX/UI → หน้าต่าง → Database → Deploy |
| [docs/STUDY-GUIDE-v0.2.0.md](./docs/STUDY-GUIDE-v0.2.0.md) | ไล่โค้ด, journey, workflow, บัคที่เคยเจอ |
| [docs/SETUP.md](./docs/SETUP.md) | ตั้งค่า Supabase + checklist ทดสอบ |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | ประวัติเวอร์ชัน |
| [PRODUCT.md](./PRODUCT.md) | บริบทผลิตภัณฑ์ |
| [DESIGN.md](./DESIGN.md) | Design system |

## Tech stack (สรุป)

Next.js 16 · React 19 · Tailwind CSS 4 · Zustand · Three.js / R3F · Supabase · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

เปิด [http://localhost:3001](http://localhost:3001)

ทดสอบบนมือถือใน Wi‑Fi เดียวกัน:

```bash
npm run dev:mobile
```

ตั้งฐานข้อมูลและ deploy ตาม [docs/SETUP.md](./docs/SETUP.md) และ [docs/PROJECT-GUIDE.md](./docs/PROJECT-GUIDE.md) ขั้นที่ 8 และ 11

## Learner flow

`/` → `/register` หรือ `/login` → `/pretest` → `/anatomy` → `/posttest` → `/result`

แอดมิน: `/admin/login` → `/admin`
