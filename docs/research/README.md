# เอกสารวิจัย Anatomy of Vapes

โฟลเดอร์นี้เก็บร่างรายงานวิจัย/โครงงานในรูปแบบปวช.–ปวส. สำหรับโปรเจกต์ **Anatomy of Vapes / ส่องไส้ในบุหรี่ไฟฟ้า**

## สารบัญ

| บท | ไฟล์ | สถานะ |
|----|------|--------|
| บทที่ 1 บทนำ | [chapter-01-introduction.md](./chapter-01-introduction.md) | ร่างครบ |
| บทที่ 2 ทบทวนวรรณกรรม | [chapter-02-literature-review.md](./chapter-02-literature-review.md) | ร่างครบ |
| บทที่ 3 วิธีดำเนินการ | [chapter-03-methodology.md](./chapter-03-methodology.md) | ร่างครบ |
| บทที่ 4 ผลการวิจัย | — | รอข้อมูลผู้ใช้จริงจาก Supabase |
| บทที่ 5 สรุปและข้อเสนอแนะ | — | ทำหลังบทที่ 4 |

## เนื้อหาบทเรียนในแอป (แหล่งความจริง)

เนื้อหา 3 บทที่ใช้ในแอปและคลังความรู้ RAG อยู่ใน

- [`data/chapters.ts`](../../data/chapters.ts)

เชื่อมกับ

- [`data/hotspots.ts`](../../data/hotspots.ts) — จุดสำรวจบนโมเดล 3D
- [`data/quiz-questions.ts`](../../data/quiz-questions.ts) — แบบทดสอบก่อน–หลัง
- [`data/myths.ts`](../../data/myths.ts) — ความเข้าใจผิด vs ข้อเท็จจริง
- [`data/sources.ts`](../../data/sources.ts) — แหล่งอ้างอิง

## แผนที่บทเรียนสั้นๆ

| บท | หัวข้อ | Hotspot | คำถาม |
|----|--------|---------|-------|
| 1 | นิโคตินและสมองวัยรุ่น | `hs-nicotine` | pre/post 1–2 |
| 2 | น้ำยา คอยล์ และสารพิษ | `hs-pg-vg`, `hs-formaldehyde`, `hs-acrolein` | pre/post 3–4 |
| 3 | แบตเตอรี่ โลหะ และความปลอดภัย | `hs-lithium` | pre/post 5 |

## วิธีส่งออกเป็น Word / PDF

1. เปิดไฟล์ `.md` ใน VS Code / Cursor หรือเครื่องมือ Markdown อื่น
2. ส่งออกเป็น PDF ด้วยส่วนขยาย Markdown PDF หรือพิมพ์จากพรีวิวแล้วเลือก Save as PDF
3. หากต้องส่งเป็น Word: เปิดด้วย Pandoc เช่น

```bash
pandoc docs/research/chapter-01-introduction.md -o chapter-01.docx
```

แนะนำให้รวมหน้าปก บทคัดย่อ และบรรณานุกรมตามแบบฟอร์มของสถานศึกษาเมื่อส่งจริง

## รายการอ้างอิงรวม (จาก data/sources.ts)

1. WHO — Tobacco: E-cigarettes (Q&A) — https://www.who.int/news-room/questions-and-answers/item/tobacco-e-cigarettes  
2. CDC — About E-Cigarettes (Vapes) — https://www.cdc.gov/tobacco/e-cigarettes/about.html  
3. American Cancer Society — E-cigarettes and Vaping — https://www.cancer.org/cancer/risk-prevention/tobacco/e-cigarettes-vaping.html  
4. American Lung Association — Dangerous Vape Ingredients — https://www.lung.org/blog/dangerous-vape-ingredients  
5. กรมควบคุมโรค — https://ddc.moph.go.th/  
6. สสส. — https://www.thaihealth.or.th/  
7. พ.ร.บ.ควบคุมผลิตภัณฑ์ยาสูบ พ.ศ. 2560 / อย. — https://www.fda.moph.go.th/  
8. กรมศุลกากร — https://www.customs.go.th/  

เอกสารประกอบในโปรเจกต์: `PRODUCT.md`, `docs/PROJECT-GUIDE.md`, `docs/Anatomy_of_Vapes_SDD_v1.pdf`

## หมายเหตุสำคัญ

- ข้อความด้านสุขภาพเป็นการสรุปเพื่อการศึกษา ควรให้หน่วยงานพันธมิตรตรวจทานก่อนใช้ในแคมเปญทางการ
- อย่าใส่สถิติที่ไม่มีแหล่งอ้างอิงลงในรายงาน
- หลังแก้ `data/chapters.ts` หรือไฟล์ความรู้ที่เกี่ยวข้อง ให้รัน `npm run build:knowledge` เพื่ออัปเดตดัชนีแชท
