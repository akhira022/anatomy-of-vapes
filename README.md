# Anatomy of Vapes (ส่องไส้ในบุหรี่ไฟฟ้า)

**Anatomy of Vapes** เป็นเว็บแอปพลิเคชันสื่อการเรียนรู้เชิงโต้ตอบ (Interactive 3D Learning Web Application) ที่ออกแบบมาเพื่อสร้างความตระหนักรู้เกี่ยวกับอันตรายและสารพิษซ่อนแอบภายในบุหรี่ไฟฟ้า โดยนำเสนอผ่านโมเดล 3 มิติ เพื่อให้ผู้เรียนสามารถสำรวจส่วนประกอบ โครงสร้าง และผลกระทบต่อสุขภาพได้อย่างเห็นภาพและน่าสนใจ

---

## Key Features (ฟีเจอร์หลัก)

* **Interactive 3D Model:** สำรวจโครงสร้างภายในของบุหรี่ไฟฟ้าแบบ 3D หมุน ซูม และกดดูจุด Hotspot สารพิษ (เช่น Nicotine, Formaldehyde, Acrolein, PG/VG)
* **Gamified Quiz System:** ระบบแบบทดสอบวัดความรู้ก่อนเรียน (Pre-test) และหลังเรียน (Post-test) พร้อม Progress Bar และคำนวณคะแนนพัฒนาการแบบเรียลไทม์
* **PDPA & Registration:** ระบบลงทะเบียนและยินยอมข้อตกลงการใช้งานข้อมูลส่วนบุคคลตามมาตรฐาน PDPA
* **Result & Evaluation Summary:** หน้าสรุปผลการเรียนรู้ เปรียบเทียบคะแนน Pre-test และ Post-test พร้อมการประเมินดาวและระดับความเข้าใจ
* **Modern UI/UX Design:** ดีไซน์โทนมืด (Dark Mode) เน้นความทันสมัย ลื่นไหล และรองรับการแสดงผลทุกอุปกรณ์ (Responsive Design)

---

## User Flow (ลำดับการใช้งาน)

1. **Landing Page:** หน้าแรกแนะนำระบบและแสดงโมเดล 3D แบบโต้ตอบ
2. **PDPA Registration:** กรอกข้อมูลเบื้องต้น (ชื่อเล่น/ระดับชั้น) และยินยอมนโยบายความเป็นส่วนตัว
3. **Pre-test Quiz:** แบบทดสอบวัดความรู้พื้นฐานก่อนเรียนจำนวน 5 ข้อ
4. **Anatomy 3D Exploration:** สำรวจจุด Hotspot สารพิษ 5 จุดบนโมเดล 3D
5. **Post-test Quiz:** แบบทดสอบวัดความรู้หลังเรียนจำนวน 5 ข้อ
6. **Result Page:** แสดงผลลัพธ์การเรียนรู้และการเปรียบเทียบคะแนน

---

## Tech Stack (เทคโนโลยีที่ใช้)

* **Frontend Framework:** Next.js / React
* **Styling:** Tailwind CSS, Aceternity UI / Magic UI
* **3D Integration:** Spline / Three.js
* **Icons & Animation:** Lucide Icons, Framer Motion

---

## Getting Started (การติดตั้งและเริ่มต้นใช้งาน)

```bash
git clone https://github.com/akhira022/anatomy-of-vapes.git
cd anatomy-of-vapes
git checkout cursor/thai-mobile-learner-ux
npm install
npm run dev
```

เปิด [http://localhost:3001](http://localhost:3001) — ตั้งค่า Supabase ตาม [docs/SETUP.md](./docs/SETUP.md)

---

## เอกสารสำหรับศึกษา

| เอกสาร | เนื้อหา |
|--------|---------|
| [docs/STUDY-GUIDE-v0.2.0.md](./docs/STUDY-GUIDE-v0.2.0.md) | คู่มือศึกษาโปรเจกต์ทั้งระบบ (v0.2.0) |
| [docs/GLOSSARY.md](./docs/GLOSSARY.md) | อธิบายศัพท์ที่เจอในโปรเจกต์ |
| [docs/VERSION-CONTROL.md](./docs/VERSION-CONTROL.md) | สอนใช้ Git / Version Control กับ repo นี้ |
| [docs/SETUP.md](./docs/SETUP.md) | ตั้งค่า Supabase และ env |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | ประวัติเวอร์ชันและบัคที่แก้แล้ว |
