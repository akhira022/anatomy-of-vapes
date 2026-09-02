# คู่มือ Git พื้นฐาน — Anatomy of Vapes

เอกสารนี้สำหรับ **ฝึกและเรียนรู้** การใช้ Git กับโปรเจกต์นี้ (Windows / PowerShell)  
ไม่ใช่คู่มือ Git ครบทุกคำสั่ง — โฟกัสงานจริงที่เจอบ่อย: ดูสถานะ → เลือกไฟล์ → commit → (ถ้าพร้อม) push

อ่านคู่กับ: [PROJECT-GUIDE.md](./PROJECT-GUIDE.md) · [SETUP.md](./SETUP.md) · [CHANGELOG.md](./CHANGELOG.md)

---

## 1. Git คืออะไร (สั้นมาก)

| คำ | ความหมาย |
|----|----------|
| **Repository (repo)** | โฟลเดอร์โปรเจกต์ที่ Git ติดตามประวัติ |
| **Working tree** | ไฟล์บนเครื่องที่คุณแก้ตอนนี้ |
| **Staging (index)** | “ตะกร้า” ไฟล์ที่เลือกไว้จะใส่ใน commit ถัดไป |
| **Commit** | จุดบันทึกประวัติ (snapshot) พร้อมข้อความอธิบาย |
| **Branch** | สายงานแยก (โปรเจกต์นี้ใช้ `cursor/thai-mobile-learner-ux`) |
| **Remote (`origin`)** | สำเนาบน GitHub / Cursor remote |
| **Push** | ส่ง commit จากเครื่องขึ้น remote |

```text
แก้ไฟล์ → git add (ใส่ตะกร้า) → git commit (บันทึก) → git push (ขึ้น remote)
```

---

## 2. ก่อนเริ่มทุกครั้ง

เปิดเทอร์มินัลที่โฟลเดอร์โปรเจกต์:

```powershell
cd C:\Users\kill6\anatomy-of-vapes
```

เช็คว่าอยู่ branch ไหน และมีอะไรค้าง:

```powershell
git status
git branch -vv
git log -5 --oneline
```

ความหมายคร่าวๆ ของ `git status`:

| ข้อความ | แปลว่า |
|---------|--------|
| `Changes not staged for commit` | แก้แล้ว แต่ยังไม่ใส่ตะกร้า |
| `Changes to be committed` | อยู่ใน staging พร้อม commit |
| `Untracked files` | ไฟล์ใหม่ที่ Git ยังไม่เคยติดตาม |
| `Your branch is ahead of 'origin/...' by N commits` | มี commit ในเครื่องที่ยังไม่ push |

---

## 3. ดูว่าเปลี่ยนอะไรบ้าง

```powershell
# สรุปไฟล์
git status --short

# รายละเอียดบรรทัดที่แก้ (ยังไม่ stage)
git diff

# รายละเอียดที่อยู่ใน staging แล้ว
git diff --staged
```

ตัวย่อใน `git status --short`:

| สัญลักษณ์ | ความหมาย |
|-----------|----------|
| ` M` | แก้แล้ว ยังไม่ stage |
| `M ` | staged แล้ว |
| `??` | ไฟล์ใหม่ยังไม่ track |
| `A ` | ไฟล์ใหม่ที่ stage แล้ว |

---

## 4. เลือกไฟล์ใส่ commit (`git add`)

### แบบที่แนะนำสำหรับโปรเจกต์นี้

เพิ่มเฉพาะงานแอป (อย่าใช้ `git add -A` ถ้ายังไม่ชิน — เพราะอาจติดโฟลเดอร์เครื่องมือ AI):

```powershell
git add app components lib docs data scripts types PRODUCT.md package.json package-lock.json README.md DESIGN.md
```

หรือทีละไฟล์:

```powershell
git add app/anatomy/page.tsx
git add docs/CHANGELOG.md
```

### ถ้าเผลอ `git add -A` แล้วติดโฟลเดอร์ที่ไม่ต้องการ

เอาออกจาก staging (ไฟล์บนดิสก์ไม่ถูกลบ):

```powershell
git reset HEAD .claude .cursor .gemini .impeccable
```

แล้วรัน `git status` อีกรอบ

### สิ่งที่ **ห้าม** commit

| อย่าง | เหตุผล |
|-------|--------|
| `.env.local` | มี secret / API key (ถูก ignore ใน `.gitignore` อยู่แล้ว) |
| `.claude/` `.cursor/` `.gemini/` `.impeccable/` | เครื่องมือ AI ส่วนตัว ไม่ใช่โค้ดแอป |
| `node_modules/` | ติดตั้งใหม่ด้วย `npm install` |

ไฟล์ตัวอย่าง env ที่ commit ได้: **เฉพาะ** `.env.example` (ไม่มี key จริง)

---

## 5. บันทึกประวัติ (`git commit`)

ตรวจ staging ก่อน:

```powershell
git status
```

Commit:

```powershell
git commit -m "Add a11y, chat streaming, and large-screen learner layout."
```

ข้อความสองบรรทัด (สั้น + อธิบายเพิ่ม):

```powershell
git commit -m "Add a11y, chat streaming, and large-screen learner layout." -m "Improves touch targets, NDJSON chat stream, and xl anatomy layout for All-in-one displays."
```

### เขียนข้อความ commit อย่างไร

- ภาษาอังกฤษสั้นๆ ก็ได้ (ทีมนี้ใช้แบบนี้บ่อย) หรือไทยก็ได้ ขอให้ชัด
- โฟกัส **ทำไม / ได้อะไร** ไม่ใช่แค่ชื่อไฟล์
- ตัวอย่างดี: `Fix admin email gate so dashboard matches Supabase user`
- ตัวอย่างไม่ดี: `update` / `fix` / `asdf`

หลัง commit:

```powershell
git status
git log -3 --oneline
```

---

## 6. ส่งขึ้น remote (`git push`) — เมื่อพร้อม

ดูว่าเครื่อง ahead กี่ commit:

```powershell
git status
```

Push branch ปัจจุบัน:

```powershell
git push -u origin HEAD
```

ครั้งถัดไปบน branch เดิม มักใช้แค่:

```powershell
git push
```

**อย่า** `push --force` ไปที่ `main` / `master` ถ้ายังไม่เข้าใจผลข้างเคียง

---

## 7. แบบฝึกหัดสั้นๆ (ทำตามลำดับ)

ทำใน repo จริงได้ แต่ถ้ากลัวพลาด ให้ฝึกตอนมีไฟล์แก้เล็กน้อย หรือถามให้ช่วยเช็ค `git status` ก่อน commit

1. รัน `git status` — อ่านว่ามี staged / unstaged อะไร
2. รัน `git diff` — ดูตัวอย่างการเปลี่ยนแปลง
3. `git add` ไฟล์แอปที่ตั้งใจ (หรือ `reset` โฟลเดอร์ AI ออกถ้าติดอยู่)
4. `git status` อีกรอบ — ยืนยันว่าไม่มี `.env.local` และไม่มี `.claude/`
5. `git commit -m "..."` — เขียนข้อความเองหนึ่งประโยค
6. `git log -3 --oneline` — เห็น commit ของตัวเองอยู่บนสุด
7. (ขั้นสูง) `git push` เมื่อพร้อมแชร์ขึ้น remote

---

## 8. คำสั่งกู้สถานการณ์ที่พบบ่อย

| ปัญหา | ทำอย่างไร |
|-------|-----------|
| ใส่ไฟล์ผิดเข้า staging | `git restore --staged <path>` หรือ `git reset HEAD <path>` |
| อยากทิ้งการแก้ในไฟล์ (ยังไม่ commit) | `git restore <path>` — **ระวัง: เสียงานที่แก้** |
| อยากดู commit เก่า | `git log --oneline` แล้ว `git show <hash>` |
| ข้อความบอก ahead of origin | มี commit ในเครื่องยังไม่ push — ใช้ `git push` เมื่อพร้อม |
| Commit แล้วอยากแก้ข้อความ commit ล่าสุด | ใช้ `git commit --amend` ได้เฉพาะเมื่อยังไม่ push และเป็น commit ของตัวเอง — ถ้าไม่แน่ใจ **อย่าใช้** สร้าง commit ใหม่แทน |

---

## 9. สถานะปกติของโปรเจกต์นี้ (อ้างอิง)

```text
Branch ทำงานหลัก:  cursor/thai-mobile-learner-ux
Branch เริ่มต้น:     master (มักไม่แตะตอนพัฒนาฟีเจอร์)
Remote:              origin
Dev URL:             http://localhost:3001
```

Flow งานที่แนะนำ:

1. แก้โค้ด / ทดสอบบน `npm run dev`
2. `git status` + `git diff`
3. `git add` เฉพาะไฟล์แอป
4. `git commit`
5. อัปเดต [CHANGELOG.md](./CHANGELOG.md) ถ้ารุ่นเปลี่ยน (ถ้ายังไม่ใส่ใน commit นั้น)
6. `git push` เมื่อพร้อม review / deploy

---

## 10. Cheat sheet

```powershell
git status
git diff
git diff --staged
git add <ไฟล์หรือโฟลเดอร์>
git reset HEAD <path>          # เอาออกจาก staging
git commit -m "ข้อความ"
git log -5 --oneline
git push -u origin HEAD
```

---

## สิ่งที่คู่มือนี้ยังไม่ครอบ

- `rebase` / `merge` ซับซ้อน
- แก้ conflict แบบละเอียด
- `cherry-pick`, `stash` ขั้นสูง
- ตั้งค่า Git config ทั้งเครื่อง

เมื่อเจอเคสพวกนี้ ให้ถามหรือค้นจากเอกสาร Git ทางการ: [git-scm.com/doc](https://git-scm.com/doc)

**บทเรียนหลัก:** ก่อนทุก commit ให้รัน `git status` แล้วถามตัวเองว่า “ไฟล์ในตะกร้าเป็นงานแอปจริงไหม และมี secret ไหม”
