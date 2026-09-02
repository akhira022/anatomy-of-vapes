# Anatomy of Vapes / ส่องไส้ในบุหรี่ไฟฟ้า

เว็บแอปการศึกษาแบบ interactive (มือถือเป็นหลัก) ให้สำรวจโมเดลบุหรี่ไฟฟ้า 3D ทำแบบทดสอบก่อน–หลังเรียน และดูพัฒนาการคะแนน

## เอกสารสำหรับเรียนรู้โปรเจกต์

เริ่มจากคู่มือนี้:

| เอกสาร | เนื้อหา |
|--------|---------|
| **[docs/PROJECT-GUIDE.md](./docs/PROJECT-GUIDE.md)** | **ขั้นตอนทั้งหมด:** คิดผลิตภัณฑ์ → UX/UI → หน้าต่าง → Database → Deploy |
| [docs/GIT.md](./docs/GIT.md) | **ฝึกใช้ Git:** status / add / commit / push สำหรับโปรเจกต์นี้ |
| [docs/STUDY-GUIDE-v0.2.0.md](./docs/STUDY-GUIDE-v0.2.0.md) | ไล่โค้ด, journey, workflow, บัคที่เคยเจอ |
| [docs/SETUP.md](./docs/SETUP.md) | ตั้งค่า Supabase + checklist ทดสอบ |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | ประวัติเวอร์ชัน |
| **[docs/research/](./docs/research/)** | **เอกสารวิจัย / รายงานโครงงาน** |
| [PRODUCT.md](./PRODUCT.md) | บริบทผลิตภัณฑ์ |
| [DESIGN.md](./DESIGN.md) | Design system |

## เอกสารวิจัย

โครงร่างรายงานวิจัยสำหรับโปรเจกต์นี้ (ปวช.–ปวส.) อยู่ในโฟลเดอร์ [`docs/research/`](./docs/research/)

| บท | ไฟล์ |
|----|------|
| สารบัญและแผนที่บทเรียน | [docs/research/README.md](./docs/research/README.md) |
| บทที่ 1 บทนำ | [docs/research/chapter-01-introduction.md](./docs/research/chapter-01-introduction.md) |
| บทที่ 2 ทบทวนวรรณกรรม | [docs/research/chapter-02-literature-review.md](./docs/research/chapter-02-literature-review.md) |
| บทที่ 3 วิธีดำเนินการ | [docs/research/chapter-03-methodology.md](./docs/research/chapter-03-methodology.md) |
| บทที่ 4–5 | รอข้อมูลผลจริง / สรุปหลังเก็บข้อมูล |

เนื้อหาบทเรียนในแอป (แหล่งความจริงของ RAG): [`data/chapters.ts`](./data/chapters.ts)

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
