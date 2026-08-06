import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnv(path) {
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i)] = v;
  }
  return out;
}

const env = loadEnv(".env.local");
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 20,
});

if (error) {
  console.log("ADMIN_AUTH: FAIL", error.message);
  process.exit(1);
}

console.log("ADMIN_AUTH: count=", data.users.length);
for (const u of data.users) {
  console.log(
    "-",
    u.email || "(no email)",
    "confirmed=",
    Boolean(u.email_confirmed_at),
    "id=",
    u.id.slice(0, 8) + "..."
  );
}
