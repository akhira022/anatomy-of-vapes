import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const tables = await client.query(`
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by 1
`);
const views = await client.query(`
  select table_name
  from information_schema.views
  where table_schema = 'public'
  order by 1
`);
console.log("tables:", tables.rows.map((r) => r.table_name).join(", "));
console.log("views:", views.rows.map((r) => r.table_name).join(", "));
await client.end();
