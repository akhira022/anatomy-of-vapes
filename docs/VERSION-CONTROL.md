# คู่มือ Version Control (Git) — Anatomy of Vapes / ส่องไส้ใน

**สำหรับ:** การศึกษา / ฝึกเขียนโค้ดต่อจากโปรเจกต์นี้  
**เครื่องมือหลัก:** Git + GitHub  
**Repository:** `https://github.com/akhira022/anatomy-of-vapes`  
**สาขาหลักของเวอร์ชันศึกษา:** `cursor/thai-mobile-learner-ux`  
**แท็กเวอร์ชันอ้างอิง:** `v0.2.0`  

เอกสารคู่กัน: [STUDY-GUIDE-v0.2.0.md](./STUDY-GUIDE-v0.2.0.md) · [CHANGELOG.md](./CHANGELOG.md) · [SETUP.md](./SETUP.md) · [GLOSSARY.md](./GLOSSARY.md)

---

## 0. เอกสารนี้สอนอะไร

หลังอ่านและฝึกตามคู่มือ คุณควรทำได้:

1. อธิบายได้ว่า Version Control ช่วยอะไรในโปรเจกต์นี้
2. clone / ดูสถานะ / commit / push / pull ได้
3. สร้างสาขา (branch) เพื่อทดลองแก้โค้ดโดยไม่ทำลายงานหลัก
4. อ่านประวัติ commit และเทียบกับแท็ก `v0.2.0`
5. รู้ว่าไฟล์ไหนห้าม commit (โดยเฉพาะ `.env.local`)

> ไม่จำเป็นต้องจำทุกคำสั่ง — สำคัญคือเข้าใจ **ทำไม** แล้วค่อยเปิดคู่มือนี้ตอนใช้งานจริง

---

## 1. Version Control คืออะไร (ภาษาบ้าน ๆ)

**Version Control** = ระบบเก็บประวัติการเปลี่ยนแปลงของโค้ด

ลองนึกภาพสมุดบันทึกที่:

- แต่ละหน้า = หนึ่ง **commit** (ชุดการแก้ที่มีข้อความอธิบาย)
- แต่ละเส้นเรื่องย่อย = หนึ่ง **branch** (สาขาทดลอง)
- ฉบับพิมพ์ที่ตั้งชื่อชัด เช่น “ฉบับนักเรียนมือถือ” = หนึ่ง **tag** (เช่น `v0.2.0`)
- สำเนาบนอินเทอร์เน็ตที่ทีมใช้ร่วมกัน = **remote** บน GitHub (`origin`)

ในโปรเจกต์นี้ Git ช่วยให้:

| สถานการณ์ | ทำไมต้องมี Git |
|-----------|----------------|
| แก้ 3D แล้วพัง | ย้อนกลับ commit เก่าได้ |
| คนหนึ่งแก้ควิซ คนหนึ่งแก้ UI | แยกสาขาแล้วรวมทีหลัง |
| อยากดูโค้ดตอนปล่อย v0.2.0 | checkout แท็ก `v0.2.0` |
| ศึกษาว่าแก้บัค iPhone fullscreen ยังไง | อ่านประวัติ commit / CHANGELOG |

---

## 2. คำศัพท์ที่เจอบ่อยใน repo นี้

> คำศัพท์ทั้งโปรเจกต์ (ผลิตภัณฑ์, 3D, Supabase, โฟลเดอร์ ฯลฯ) อยู่ที่ **[GLOSSARY.md](./GLOSSARY.md)** — ด้านล่างเน้นคำ Git ที่ใช้ในคู่มือนี้

| คำ | ความหมายสั้น | ตัวอย่างในโปรเจกต์นี้ |
|----|--------------|------------------------|
| Repository (repo) | โฟลเดอร์โปรเจกต์ที่ Git ดูแล | `anatomy-of-vapes` |
| Working tree | ไฟล์ที่คุณแก้บนเครื่องตอนนี้ | แก้ `app/anatomy/page.tsx` |
| Staging area | ไฟล์ที่เลือกจะใส่ใน commit ถัดไป | หลัง `git add` |
| Commit | จุดบันทึกประวัติพร้อมข้อความ | `Ship v0.2.0 Thai Mobile Learner…` |
| Branch | สายพัฒนาแยกจากกัน | `cursor/thai-mobile-learner-ux` |
| Tag | ป้ายชื่อเวอร์ชัน | `v0.2.0` |
| Remote | สำเนาบนเซิร์ฟเวอร์ | `origin` → GitHub |
| Clone | คัดลอก repo จาก GitHub มาเครื่อง | `git clone …` |
| Pull | ดึงงานใหม่จาก remote มาเครื่อง | `git pull` |
| Push | ส่ง commit จากเครื่องขึ้น remote | `git push` |
| Merge / PR | รวมสาขาเข้าด้วยกัน (มักผ่าน Pull Request) | รีวิวบน GitHub |
| `.gitignore` | รายการไฟล์ที่ Git ไม่ติดตาม | กัน `.env.local`, `node_modules` |
| Changelog | บันทึกสิ่งที่เปลี่ยนรายเวอร์ชัน | [CHANGELOG.md](./CHANGELOG.md) |

---

## 3. ภาพรวมการทำงานของ Git ในโปรเจกต์นี้

```text
[เครื่องคุณ]                      [GitHub: origin]
 working tree  ──git add──▶  staging
 staging       ──git commit──▶  local commits
 local commits ──git push──▶  remote branch
 remote branch ◀──git pull──  (อัปเดตจากทีม)
```

สาขาที่ควรรู้ตอนศึกษา:

| สาขา / แท็ก | บทบาท |
|-------------|--------|
| `cursor/thai-mobile-learner-ux` | สาขาหลักของเวอร์ชัน Thai Mobile Learner (v0.2.0) |
| `v0.2.0` (tag) | จุดอ้างอิงเวอร์ชันที่เอกสาร STUDY-GUIDE อธิบาย |
| สาขาย่อยเช่น `cursor/…` | งานทดลอง / ฟีเจอร์ย่อย (แยกจากสายหลัก) |

---

## 4. เตรียมเครื่องครั้งแรก

### 4.1 ติดตั้ง Git

ตรวจว่ามี Git แล้ว:

```bash
git --version
```

ถ้ายังไม่มี ติดตั้งตามระบบปฏิบัติการ (Windows: Git for Windows, macOS: `xcode-select --install` หรือ Homebrew, Linux: แพ็กเกจ `git`)

ตั้งชื่อและอีเมล (ใช้ครั้งแรกบนเครื่อง):

```bash
git config --global user.name "ชื่อของคุณ"
git config --global user.email "you@example.com"
```

### 4.2 Clone โปรเจกต์

```bash
git clone https://github.com/akhira022/anatomy-of-vapes.git
cd anatomy-of-vapes
```

ตรวจว่า remote ชี้ถูกที่:

```bash
git remote -v
```

ควรเห็น `origin` ชี้ไปที่ `github.com/akhira022/anatomy-of-vapes`

### 4.3 เลือกสาขาสำหรับศึกษา

```bash
git fetch origin
git checkout cursor/thai-mobile-learner-ux
git pull origin cursor/thai-mobile-learner-ux
```

จากนั้นติดตั้ง dependencies ตาม [README](../README.md) และตั้งค่า Supabase ตาม [SETUP.md](./SETUP.md)

---

## 5. วงจรงานประจำวัน (Daily loop)

เมื่อจะแก้โค้ดเพื่อเรียน/ทดลอง ใช้ลำดับนี้:

### ขั้นที่ 1 — ดูสถานะ

```bash
git status
```

บอกว่าไฟล์ไหนแก้แล้ว ไฟล์ไหนยังไม่ถูก track และอยู่สาขาอะไร

### ขั้นที่ 2 — ดูว่าแก้ตรงไหน

```bash
git diff
```

ดูความต่างทีละไฟล์ก่อน commit:

```bash
git diff -- path/to/file.tsx
```

### ขั้นที่ 3 — เลือกไฟล์เข้า staging

เพิ่มทีละไฟล์ (แนะนำตอนเรียน — เห็นชัดว่า commit อะไร):

```bash
git add docs/VERSION-CONTROL.md
```

หรือเพิ่มทั้งชุดที่เกี่ยวข้อง:

```bash
git add app/anatomy/ components/three/
```

**อย่า** `git add .` แบบไม่ดู — อาจพาไฟล์ลับ (`.env.local`) หรือไฟล์ build เข้าไป

### ขั้นที่ 4 — Commit

```bash
git commit -m "อธิบายสั้น ๆ ว่าทำไมถึงแก้"
```

แนวทางข้อความ commit ที่อ่านง่าย (ภาษาอังกฤษหรือไทยก็ได้ แต่ให้สม่ำเสมอ):

| แบบที่ดี | แบบที่ควรเลี่ยง |
|----------|-----------------|
| `Fix iOS fullscreen hotspot popup` | `update` |
| `Add hotspot list for mobile tap` | `fix stuff` |
| `Document Git workflow for students` | `asdf` |

ดูตัวอย่างจริงใน repo:

```bash
git log --oneline -10
```

### ขั้นที่ 5 — Push (ถ้ามี remote สิทธิ์เขียน)

```bash
git push -u origin ชื่อสาขาของคุณ
```

ถ้าแค่ clone มาอ่าน/ทดลองในเครื่องเอง ยังไม่ต้อง push ก็ได้

---

## 6. การใช้ Branch อย่างปลอดภัยตอนศึกษา

### ทำไมต้องแยกสาขา

อย่าแก้ยาว ๆ บนสาขาหลักโดยตรง — ถ้าทดลองพัง จะยากต่อการเทียบกับเวอร์ชันที่ยังใช้ได้

### สร้างสาขาทดลอง

อยู่บนสาขาหลักที่อัปเดตแล้ว:

```bash
git checkout cursor/thai-mobile-learner-ux
git pull origin cursor/thai-mobile-learner-ux
git checkout -b study/my-hotspot-experiment
```

ตั้งชื่อสาขาให้อ่านรู้เรื่อง เช่น:

- `study/change-quiz-copy`
- `study/anatomy-ui-tweak`
- `fix/fullscreen-ios`

### สลับสาขา

```bash
git checkout cursor/thai-mobile-learner-ux
git checkout study/my-hotspot-experiment
```

ถ้ามีไฟล์แก้ค้างอยู่ Git อาจไม่ยอมสลับ — commit หรือ stash ก่อน:

```bash
git stash
git checkout cursor/thai-mobile-learner-ux
git stash pop
```

### ดูสาขาทั้งหมด

```bash
git branch -a
```

---

## 7. อ่านประวัติเพื่อเรียนจากโปรเจกต์จริง

### ดู commit ล่าสุด

```bash
git log --oneline -15
```

ตัวอย่างแนวทางที่เจอใน repo นี้ (ข้อความอาจต่างตามเวลา):

```text
Polish anatomy 3D explorer with labeled controls…
Let returning learners choose retake or model review.
Ship v0.2.0 Thai Mobile Learner: iPhone fullscreen…
Fix theme hydration mismatch…
```

### ดูรายละเอียด commit หนึ่งอัน

```bash
git show 6825091
```

(ใส่ hash จริงจาก `git log`)

### เทียบไฟล์ระหว่างสองจุด

```bash
git diff v0.2.0..HEAD -- docs/
```

### เปิดโค้ด ณ แท็ก v0.2.0 (อ่านอย่างเดียวแนะนำ)

สร้างสาขาชั่วคราวจากแท็ก:

```bash
git fetch --tags
git checkout -b study/from-v0.2.0 v0.2.0
```

เมื่ออ่านจบ กลับสาขาหลัก:

```bash
git checkout cursor/thai-mobile-learner-ux
```

คู่กับ [CHANGELOG.md](./CHANGELOG.md) จะเห็นว่าแต่ละบัคถูกแก้ใน commit / เวอร์ชันไหน

---

## 8. สิ่งที่ห้าม commit ในโปรเจกต์นี้

ไฟล์ `.gitignore` ของ repo นี้กันสิ่งสำคัญไว้แล้ว โดยเฉพาะ:

| รายการ | เหตุผล |
|--------|--------|
| `.env*` (ยกเว้น `.env.example`) | มีคีย์ Supabase / ความลับ — ห้ามขึ้น GitHub |
| `node_modules/` | ติดตั้งใหม่ด้วย `npm install` ได้ |
| `.next/` | ไฟล์ build ของ Next.js |
| `/public/models/_raw/` | ไฟล์ GLB ดิบก่อน simplify |

กฎทอง:

1. คัดลอก env จากตัวอย่างเท่านั้น: `cp .env.example .env.local`
2. ใส่ค่าจริงใน `.env.local` บนเครื่องตัวเอง
3. ก่อนทุกครั้งที่ `git add` ให้รัน `git status` ดูว่าไม่มี `.env.local`

ถ้าเผลอ stage ไฟล์ลับ:

```bash
git restore --staged .env.local
```

ถ้าเผลอ commit ไปแล้วแต่ยังไม่ push — แจ้งพี่เลี้ยง/ผู้ดูแล repo ทันที แล้วหมุนคีย์บน Supabase ใหม่

---

## 9. ดึงงานล่าสุด / แก้ conflict เบื้องต้น

### อัปเดตสาขาปัจจุบันจาก remote

```bash
git pull origin cursor/thai-mobile-learner-ux
```

หรือถ้าอยู่สาขาอื่นและอยากรวมของหลักเข้ามา:

```bash
git fetch origin
git merge origin/cursor/thai-mobile-learner-ux
```

### เมื่อเกิด conflict

Git จะบอกไฟล์ที่ชน เช่น `app/page.tsx`  
เปิดไฟล์จะเห็นเครื่องหมายประมาณ:

```text
<<<<<<< HEAD
โค้ดของคุณ
=======
โค้ดจาก remote
>>>>>>> branch-name
```

เลือกให้เหลือเวอร์ชันที่ถูกต้อง ลบเครื่องหมายออก แล้ว:

```bash
git add ไฟล์ที่แก้แล้ว
git commit -m "Resolve merge conflict in page.tsx"
```

ตอนเรียน ถ้า conflict ยาก ให้เก็บสาขาทดลองไว้ แล้วเริ่มใหม่จากสาขาหลักที่สะอาดก็ได้

---

## 10. Pull Request (PR) คืออะไร — มุมมองการศึกษา

**Pull Request** = คำขอให้รวมโค้ดจากสาขาของคุณเข้าสาขาเป้าหมาย พร้อมให้คนอื่นรีวิว

ลำดับคร่าว ๆ:

1. สร้างสาขา → แก้โค้ด → commit → push
2. เปิด PR บน GitHub (base มักเป็น `cursor/thai-mobile-learner-ux` ในบริบทเวอร์ชันนี้)
3. อธิบายว่าเปลี่ยนอะไร / ทำไม / ทดสอบยังไง
4. รอรีวิว แล้วค่อย merge

แม้จะทำงานคนเดียว การฝึกเปิด PR ช่วยให้:

- สรุปงานเป็นภาษาคนอ่านได้
- แยก “ทดลอง” กับ “พร้อมใช้” ชัดขึ้น
- มีประวัติการตัดสินใจคู่กับ commit

---

## 11. Workflow แนะนำสำหรับนักเรียนที่ใช้ repo นี้

### แบบ A — อ่านอย่างเดียว

```bash
git clone https://github.com/akhira022/anatomy-of-vapes.git
cd anatomy-of-vapes
git checkout cursor/thai-mobile-learner-ux
npm install
# ตั้ง .env.local ตาม SETUP.md
npm run dev
```

อ่าน [STUDY-GUIDE-v0.2.0.md](./STUDY-GUIDE-v0.2.0.md) คู่กับการเดิน user flow จริง

### แบบ B — ทดลองแก้เนื้อหา (ปลอดภัย)

1. สร้างสาขา `study/…`
2. แก้เฉพาะไฟล์เนื้อหา เช่น `data/quiz-questions.ts` หรือ `data/hotspots.ts`
3. รันเว็บดูผล
4. commit ข้อความชัด เช่น `Update hotspot copy for nicotine`
5. (ถ้ามีสิทธิ์) push + เปิด PR

### แบบ C — เรียนจากบัคที่เคยแก้

1. อ่านตารางปัญหาใน [CHANGELOG.md](./CHANGELOG.md)
2. เลือกหัวข้อหนึ่ง เช่น iOS fullscreen
3. เปิดไฟล์ที่เกี่ยวข้อง (`lib/scene-fullscreen.ts`, hooks ที่เกี่ยว)
4. ใช้ `git log -- ไฟล์นั้น` ดูประวัติการแก้

```bash
git log --oneline -- lib/scene-fullscreen.ts
```

---

## 12. Cheat sheet คำสั่งที่ใช้บ่อย

```bash
# สถานะและประวัติ
git status
git log --oneline -20
git diff
git show <hash>

# สาขา
git branch
git branch -a
git checkout -b study/topic-name
git checkout cursor/thai-mobile-learner-ux

# บันทึกงาน
git add path/to/file
git commit -m "ข้อความสั้น ชัด"
git push -u origin study/topic-name

# อัปเดต
git fetch origin
git pull origin cursor/thai-mobile-learner-ux

# แท็กเวอร์ชัน
git fetch --tags
git checkout -b study/from-v0.2.0 v0.2.0

# ยกเลิกการแก้ที่ยังไม่ stage (ระวัง: ทิ้งงาน)
git restore path/to/file

# เอาไฟล์ออกจาก staging แต่ยังไม่ลบงาน
git restore --staged path/to/file
```

---

## 13. แบบฝึกหัดสั้น (ตรวจว่าเข้าใจ)

ทำทีละข้อ แล้วติ๊กเองได้:

1. [ ] `git clone` แล้ว `git status` รายงานว่า clean และอยู่สาขาที่คาดไว้
2. [ ] สร้างสาขา `study/hello-docs` แล้วเพิ่มบรรทัดในโน้ตส่วนตัว (หรือไฟล์ทดลอง) แล้ว commit
3. [ ] รัน `git log --oneline -5` แล้วอธิบาย commit ล่าสุดด้วยภาษาตัวเองได้ 1 ประโยค
4. [ ] checkout แท็ก `v0.2.0` บนสาขาชั่วคราว แล้วกลับมา `cursor/thai-mobile-learner-ux`
5. [ ] ตั้งใจสร้าง `.env.local` แล้วตรวจว่า `git status` **ไม่** แสดงไฟล์นี้เป็น candidate ที่จะ commit
6. [ ] ใช้ `git log --oneline -- docs/CHANGELOG.md` ดูว่าเอกสาร changelog ถูกแตะใน commit ไหนบ้าง

---

## 14. สรุปสั้นสำหรับจำ

- **Git เก็บประวัติ** — ไม่ใช่แค่สำรองไฟล์
- **Branch แยกการทดลอง** — สาขาหลักของเวอร์ชันศึกษานี้คือ `cursor/thai-mobile-learner-ux`
- **Tag ติดป้ายเวอร์ชัน** — อ่านคู่ `v0.2.0` กับ STUDY-GUIDE / CHANGELOG
- **Commit ละหนึ่งเรื่อง** — ข้อความบอก “ทำไม”
- **อย่า commit ความลับ** — `.env.local` อยู่นอก Git เสมอ
- **เรียนจากประวัติจริงได้** — `git log` / `git show` / เทียบไฟล์กับ CHANGELOG

เมื่อพร้อมลงมือแก้ฟีเจอร์จริง ให้เปิด [STUDY-GUIDE-v0.2.0.md](./STUDY-GUIDE-v0.2.0.md) ส่วนแผนที่ไฟล์ แล้วค่อยสร้างสาขา `study/…` ตาม workflow ในเอกสารนี้
