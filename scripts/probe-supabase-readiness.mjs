import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

const results = [];
const ok = (name, detail = "") =>
  results.push({ name, status: "PASS", detail });
const fail = (name, detail = "") =>
  results.push({ name, status: "FAIL", detail });
const warn = (name, detail = "") =>
  results.push({ name, status: "WARN", detail });

if (!url || url.includes("your-project")) fail("env.url", "missing/placeholder");
else ok("env.url", new URL(url).host);

if (!anon || anon.startsWith("your-")) fail("env.anon", "missing/placeholder");
else
  ok(
    "env.anon",
    `present (${anon.length} chars, ${anon.slice(0, 10)}...)`
  );

if (!service || service.startsWith("your-"))
  warn("env.service_role", "missing — admin/server tools limited");
else ok("env.service_role", "present");

if (!env.DATABASE_URL)
  warn("env.DATABASE_URL", "missing — cannot run pg migration scripts");
else ok("env.DATABASE_URL", "present");

if (
  !env.NEXT_PUBLIC_ADMIN_EMAIL ||
  env.NEXT_PUBLIC_ADMIN_EMAIL.includes("example.com")
)
  warn("env.admin_email", "still placeholder admin@example.com");
else ok("env.admin_email", "set");

const supabase = createClient(url, anon);
const admin =
  service && !service.startsWith("your-")
    ? createClient(url, service)
    : null;

{
  const { error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });
  if (!error)
    ok(
      "anon.select.users",
      "SELECT allowed (unexpected for learner-only design, but OK)"
    );
  else if (
    /permission denied|RLS|not allowed|42501/i.test(error.message) ||
    error.code === "42501" ||
    error.code === "PGRST301"
  )
    ok(
      "anon.select.users",
      `blocked as expected: ${error.code || ""} ${error.message.slice(0, 80)}`
    );
  else if (
    /relation .* does not exist|PGRST205|42P01/i.test(error.message) ||
    error.code === "PGRST205" ||
    error.code === "42P01"
  )
    fail("anon.select.users", `TABLE MISSING: ${error.message}`);
  else warn("anon.select.users", `${error.code} ${error.message}`);
}

const tables = ["users", "consent", "quiz_results", "quiz_answers"];
if (admin) {
  for (const t of tables) {
    const { error, count } = await admin
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) {
      if (
        /does not exist|PGRST205|42P01/i.test(error.message) ||
        error.code === "PGRST205"
      )
        fail(`table.${t}`, `MISSING — ${error.message}`);
      else fail(`table.${t}`, `${error.code} ${error.message}`);
    } else ok(`table.${t}`, `exists (rows≈${count ?? "?"})`);
  }

  const { error: viewErr, count: viewCount } = await admin
    .from("admin_results")
    .select("*", { count: "exact", head: true });
  if (viewErr) {
    if (/does not exist|PGRST205/i.test(viewErr.message))
      fail("view.admin_results", "MISSING");
    else fail("view.admin_results", viewErr.message);
  } else ok("view.admin_results", `exists (rows≈${viewCount ?? "?"})`);
} else {
  warn("table.check", "skipped — no service role");
}

{
  const { data, error } = await supabase.rpc("find_learner_by_nickname", {
    p_nickname: "__probe_nonexistent__",
  });
  if (error) {
    if (
      error.code === "PGRST202" ||
      /find_learner_by_nickname/i.test(error.message)
    )
      fail(
        "rpc.find_learner_by_nickname",
        "NOT INSTALLED — run 005_learner_rpcs.sql"
      );
    else fail("rpc.find_learner_by_nickname", `${error.code} ${error.message}`);
  } else
    ok(
      "rpc.find_learner_by_nickname",
      `callable (returned ${JSON.stringify(data)?.slice(0, 60)})`
    );
}

{
  const fakeId = "00000000-0000-4000-8000-000000000000";
  const { data, error } = await supabase.rpc("learner_has_quiz_result", {
    p_user_id: fakeId,
  });
  if (error) {
    if (
      error.code === "PGRST202" ||
      /learner_has_quiz_result/i.test(error.message)
    )
      fail(
        "rpc.learner_has_quiz_result",
        "NOT INSTALLED — run 005_learner_rpcs.sql"
      );
    else fail("rpc.learner_has_quiz_result", `${error.code} ${error.message}`);
  } else ok("rpc.learner_has_quiz_result", `callable (returned ${data})`);
}

const probeNick = `probe_${Date.now().toString(36)}`;
const probeId = randomUUID();

{
  const { error } = await supabase.from("users").insert({
    id: probeId,
    nickname: probeNick,
    grade: "อื่นๆ",
  });
  if (error) fail("anon.insert.users", `${error.code} ${error.message}`);
  else ok("anon.insert.users", "ok");
}

{
  const { error } = await supabase
    .from("consent")
    .insert({ user_id: probeId, accepted: true });
  if (error) fail("anon.insert.consent", `${error.code} ${error.message}`);
  else ok("anon.insert.consent", "ok");
}

const resultId = randomUUID();
{
  const { error } = await supabase.from("quiz_results").insert({
    id: resultId,
    user_id: probeId,
    pre_score: 1,
    post_score: 2,
    pre_total: 5,
    post_total: 5,
  });
  if (error) fail("anon.insert.quiz_results", `${error.code} ${error.message}`);
  else ok("anon.insert.quiz_results", "ok");
}

{
  const { error } = await supabase.from("quiz_answers").insert([
    {
      quiz_result_id: resultId,
      quiz_type: "pretest",
      question_id: "probe-q1",
      selected_option_id: "a",
      is_correct: false,
    },
  ]);
  if (error) fail("anon.insert.quiz_answers", `${error.code} ${error.message}`);
  else ok("anon.insert.quiz_answers", "ok");
}

if (admin) {
  await admin.from("quiz_answers").delete().eq("quiz_result_id", resultId);
  await admin.from("quiz_results").delete().eq("id", resultId);
  await admin.from("consent").delete().eq("user_id", probeId);
  await admin.from("users").delete().eq("id", probeId);
  ok("cleanup.probe", "deleted probe rows");
} else {
  warn(
    "cleanup.probe",
    `left probe user ${probeNick} — delete manually in Table Editor`
  );
}

{
  const badId = randomUUID();
  const { error } = await supabase.from("users").insert({
    id: badId,
    nickname: `badgrade_${Date.now()}`,
    grade: "ป.4",
  });
  if (error && /check|grade|violates/i.test(error.message))
    ok("constraint.grade", "rejects old grade values (ป.4) — matches new schema");
  else if (!error) {
    warn("constraint.grade", "accepted ป.4 — schema may still use old grades");
    if (admin) await admin.from("users").delete().eq("id", badId);
  } else warn("constraint.grade", error.message);
}

console.log("\n=== SUPABASE READINESS REPORT ===");
for (const r of results) {
  console.log(r.status.padEnd(4), r.name.padEnd(32), r.detail);
}
const fails = results.filter((r) => r.status === "FAIL").length;
const warns = results.filter((r) => r.status === "WARN").length;
const passes = results.filter((r) => r.status === "PASS").length;
console.log(`\nSUMMARY: PASS=${passes} WARN=${warns} FAIL=${fails}`);
process.exit(fails > 0 ? 1 : 0);
