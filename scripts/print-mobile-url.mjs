import os from "node:os";

const port = process.env.PORT ?? process.env.npm_config_port ?? "3001";

/** Prefer typical home Wi‑Fi; skip virtual / VPN adapters when possible. */
const skipName = /virtualbox|vmware|vethernet|hyper-v|loopback|wsl|docker|hamachi|tailscale|zerotier/i;

const urls = [];

for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
  if (!addrs || skipName.test(name)) continue;
  for (const addr of addrs) {
    if (addr.family !== "IPv4" || addr.internal) continue;
    urls.push({ name, url: `http://${addr.address}:${port}` });
  }
}

console.log("");
console.log("📱 ทดสอบบนมือถือ (Wi‑Fi เดียวกับเครื่องนี้):");
console.log("");

if (urls.length === 0) {
  console.log("  ไม่พบ IP ในเครือข่าย — เปิด Wi‑Fi แล้วรันคำสั่งนี้อีกครั้ง");
} else {
  for (const { name, url } of urls) {
    console.log(`  ${name.padEnd(24)} ${url}`);
  }
  const pick =
    urls.find((u) => /wi-?fi|wlan|wireless/i.test(u.name)) ?? urls[0];
  console.log("");
  console.log(`  → เปิดในมือถือ: ${pick.url}`);
}

console.log("");
console.log("  ถ้าเปิดไม่ได้: ปิด VPN บนมือถือ/PC และอนุญาต Windows Firewall พอร์ต", port);
console.log("  รัน dev server: npm run dev:mobile");
console.log("");
