/**
 * Apply all SQL files in supabase/migrations/ in filename order.
 *
 * PowerShell:
 *   $env:DATABASE_URL="postgresql://postgres.[ref]:[DB_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
 *   node scripts/apply-supabase-migration.mjs
 *
 * Get DATABASE_URL: Supabase → Project Settings → Database → Connection string (URI)
 * Prefer "Session mode" pooler URI.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const migrationsDir = resolve(root, "supabase/migrations");

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl || databaseUrl.includes("[") || databaseUrl.includes("YOUR")) {
  console.error(
    "Set DATABASE_URL to your Supabase Postgres URI (Settings → Database → Connection string)."
  );
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql files in", migrationsDir);
  process.exit(1);
}

async function main() {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    console.error("Missing dependency. Run: npm install -D pg");
    process.exit(1);
  }

  const client = new pg.default.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    for (const file of files) {
      const sqlPath = resolve(migrationsDir, file);
      const sql = readFileSync(sqlPath, "utf8");
      process.stdout.write(`Applying ${file}... `);
      await client.query(sql);
      console.log("ok");
    }
    console.log("All migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
