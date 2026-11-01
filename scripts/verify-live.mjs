/**
 * Verifies the live public read path with the anon key, exactly as the site
 * does it: RLS must allow SELECT and deny writes.
 *
 *   node scripts/verify-live.mjs
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const v = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const rest = (path, init = {}) =>
  fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

let failures = 0;
const check = (name, cond, detail = "") => {
  console.log(`  ${cond ? "+" : "-"} ${name}${detail ? " -- " + detail : ""}`);
  if (!cond) failures++;
};

// 1. anon can SELECT
console.log("anon read (RLS):");
for (const [table, expected] of [
  ["categories", 9],
  ["services", 8],
  ["prices", 22],
  ["projects", 8],
  ["media", 149],
]) {
  const res = await rest(`${table}?select=*`);
  const body = await res.json();
  check(
    `${table} readable`,
    res.ok && Array.isArray(body) && body.length === expected,
    `status=${res.status} rows=${Array.isArray(body) ? body.length : "n/a"} expected=${expected}`,
  );
}

// 2. localized copy survived the seed
console.log("\nlocalized copy:");
const pr = await (await rest("projects?select=slug,title,category,cover_path&slug=eq.p3")).json();
const title = pr?.[0]?.title;
check(
  "project p3 has en+fr+ar title",
  title?.en && title?.fr && title?.ar,
  JSON.stringify(title),
);

// 3. non-ASCII round-trips through PostgREST correctly
check(
  "arabic title intact",
  /[\u0600-\u06FF]/.test(title?.ar ?? ""),
  title?.ar,
);

// 4. prices map onto real category slugs
const prices = await (await rest("prices?select=category")).json();
const cats = new Set((await (await rest("categories?select=slug")).json()).map((c) => c.slug));
const badCats = [...new Set(prices.map((p) => p.category))].filter((c) => !cats.has(c));
check("every price category is a real category slug", badCats.length === 0, badCats.join(",") || "all ok");

// 5. anon must NOT be able to write
console.log("\nanon write (must be denied):");
const write = await rest("categories", {
  method: "POST",
  headers: { Prefer: "return=minimal" },
  body: JSON.stringify({ id: "cat-hack", slug: "hack", name: { en: "x" } }),
});
check("anon insert rejected", !write.ok, `status=${write.status}`);

const del = await rest("categories?id=eq.cat-1", { method: "DELETE", headers: { Prefer: "return=minimal" } });
check("anon delete rejected", !del.ok, `status=${del.status}`);

// 6. a real photo is publicly reachable
console.log("\npublic storage:");
const img = await fetch(
  `${url}/storage/v1/object/public/media/${encodeURIComponent("dryceiling/dryceiling-01.jpg")}`,
);
check("photo served from public bucket", img.ok, `status=${img.status} type=${img.headers.get("content-type")}`);

console.log(failures ? `\n${failures} check(s) failed` : "\nAll live checks passed.");
process.exitCode = failures ? 1 : 0;