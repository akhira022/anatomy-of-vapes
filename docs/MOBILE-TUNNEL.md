# ทดสอบบนมือถือ — LAN และ Cloudflare Tunnel

ใช้เมื่ออยากเปิดเว็บ `anatomy-of-vapes` จากมือถือตอนพัฒนา (dev)

**พอร์ตที่ใช้:** `3001` (พอร์ต `3000` มักชนกับโปรแกรมอื่น เช่น Grafana)

---

## วิธีที่แนะนำ: Cloudflare Tunnel

ใช้ได้แม้มือถือกับ PC **ไม่ได้อยู่ Wi‑Fi เดียวกัน** และไม่ต้องเปิด Windows Firewall

### 1. เปิด dev server

ในเทอร์มินัลที่ 1:

```bash
npm run dev:mobile
```

หรือถ้าเซิร์ฟเวอร์รันอยู่แล้วที่พอร์ต 3001 ข้ามขั้นนี้ได้

ตรวจว่าเปิดได้บนเครื่องนี้:

```text
http://localhost:3001
```

### 2. เปิด tunnel

ในเทอร์มินัลที่ 2:

```bash
npm run tunnel
```

คำสั่งนี้รัน `cloudflared` ชี้ไปที่ `http://127.0.0.1:3001`

### 3. คัดลอกลิงก์

ในล็อกของ tunnel จะมีบรรทัดประมาณ:

```text
https://xxxx-xxxx-xxxx.trycloudflare.com
```

เปิดลิงก์นี้บนมือถือ (Safari / Chrome) ได้ทันที — ใช้เน็ตมือถือก็ได้

> ทุกครั้งที่ปิดแล้วเปิด tunnel ใหม่ ลิงก์จะเปลี่ยน

### 4. ปิดเมื่อทดสอบจบ

- กด `Ctrl+C` ที่เทอร์มินัล tunnel
- กด `Ctrl+C` ที่เทอร์มินัล `dev:mobile` (ถ้าต้องการหยุดเซิร์ฟเวอร์ด้วย)

หรือปิดโปรเซส:

```powershell
taskkill /F /IM cloudflared.exe
```

---

## วิธีสำรอง: LAN ใน Wi‑Fi เดียวกัน

ใช้เมื่อ Firewall อนุญาตพอร์ต 3001 แล้ว และมือถือกับ PC อยู่เครือข่ายเดียวกัน

```bash
npm run dev:mobile
```

ดู URL ในคอนโซล หรือรันแยก:

```bash
npm run mobile:url
```

ตัวอย่าง: `http://192.168.1.6:3001`

### ถ้ามือถือเปิดไม่ได้

1. ปิด VPN บนมือถือ/PC
2. ตรวจว่า Wi‑Fi เดียวกัน (ไม่ใช่ Guest Wi‑Fi ที่แยกเครือข่าย)
3. Windows Firewall → อนุญาต Node.js หรือเปิดพอร์ต **3001** TCP ขาเข้า (ต้องรันเป็น Administrator)
4. ถ้ายังไม่ได้ → ใช้ **Cloudflare Tunnel** ด้านบนแทน

---

## สคริปต์ที่เกี่ยวข้อง

| คำสั่ง | ความหมาย |
|--------|----------|
| `npm run dev` | Next.js ที่พอร์ต 3001 (localhost) |
| `npm run dev:mobile` | bind `0.0.0.0` + พิมพ์ URL LAN |
| `npm run mobile:url` | แสดง URL LAN อย่างเดียว |
| `npm run tunnel` | Cloudflare quick tunnel → `127.0.0.1:3001` |

---

## Config ที่ต้องมีอยู่แล้ว

ใน `next.config.ts` ต้องอนุญาต origin ของ tunnel / LAN ไม่งั้นมือถือโหลด `/_next` ไม่ครบ:

```ts
allowedDevOrigins: [
  "192.168.1.6",          // ปรับเป็น IP Wi‑Fi จริงของเครื่องถ้าเปลี่ยน
  "*.trycloudflare.com",
  "*.loca.lt",
]
```

ถ้า IP Wi‑Fi เปลี่ยน รัน `npm run mobile:url` แล้วเพิ่ม IP ใหม่เข้า `allowedDevOrigins` แล้วรีสตาร์ท `dev:mobile`

---

## หมายเหตุ

- Tunnel แบบ quick (`trycloudflare.com`) ไม่รับประกัน uptime — ใช้ทดสอบชั่วคราวเท่านั้น
- Production ควร deploy ขึ้น Vercel แล้วให้มือถือเปิด URL จริง (ดู [SETUP.md](./SETUP.md) § Deploy)
- หน้าแรกบนมือถือจะไม่โหลดโมเดล 3D หนัก (~16MB) — ไปโหลดตอนหน้า `/anatomy`
