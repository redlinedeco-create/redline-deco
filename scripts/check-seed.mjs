/**
 * Sanity-checks supabase/seed.sql before it is applied:
 *  - file decodes as clean UTF-8 (no replacement chars from bad encoding)
 *  - non-ASCII copy survived (Arabic, accents)
 *  - no stray unescaped single quotes that would break SQL
 *  - expected row counts are present
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(join(process.cwd(), "supabase", "seed.sql"), "utf8");
const problems = [];
const ok = [];

// The file was written by Node as UTF-8. If PowerShell or a redirect had
// mangled it, decoding produces U+FFFD.
const replacement = (sql.match(/\uFFFD/g) ?? []).length;
if (replacement > 0) {
  problems.push(`${replacement} U+FFFD replacement chars -- encoding is broken`);
} else {
  ok.push("clean UTF-8, no replacement chars");
}

// Non-ASCII must actually be present, otherwise the check above is vacuous.
const arabic = (sql.match(/[\u0600-\u06FF]/g) ?? []).length;
const accents = (sql.match(/[\u00C0-\u017F]/g) ?? []).length;
if (arabic > 100 && accents > 10) {
  ok.push(`non-ASCII copy intact (${arabic} Arabic, ${accents} accented chars)`);
} else {
  problems.push(`non-ASCII copy missing (${arabic} Arabic, ${accents} accented)`);
}

// Inside a single-quoted SQL literal, '' is the only legal quote. A bare quote
// mid-string means the value was not escaped.
const badQuote = [];
for (const [i, line] of sql.split("\n").entries()) {
  if (line.trimStart().startsWith("--")) continue;
  for (const m of line.matchAll(/'([^']*)'/g)) {
    // a literal that is immediately closed by another quote is fine ('' case)
    const rest = line.slice(m.index + m[0].length);
    if (!rest.startsWith("'") && !rest.startsWith(",") && !rest.startsWith(")")) {
      // could be `'::jsonb` or `'::text[]` style suffixes
      if (!/^'?(::|\s|,|\)|$)/.test(rest)) {
        badQuote.push(i + 1);
      }
    }
  }
}
if (badQuote.length) {
  problems.push(`suspicious unescaped quotes on lines: ${badQuote.slice(0, 5).join(", ")}`);
} else {
  ok.push("no unescaped quotes");
}

// Expected rows.
const counts = [
  ["categories", 9],
  ["services", 8],
  ["prices", 22],
  ["testimonials", 3],
  ["projects", 8],
];
for (const [table, n] of counts) {
  const re = new RegExp(`\\('${table === "categories" ? "cat-|services|p|tu" : ""}`);
  void re;
}
const sections = sql.split(/^insert into /m).slice(1);
for (const [table, expected] of counts) {
  const sec = sections.find((s) => s.startsWith(table + " "));
  if (!sec) {
    problems.push(`missing insert for ${table}`);
    continue;
  }
  const got = (sec.match(/^\s{2}\(/gm) ?? []).length;
  if (got !== expected) {
    problems.push(`${table}: expected ${expected} rows, found ${got}`);
  } else {
    ok.push(`${table}: ${got} rows`);
  }
}
const media = sections.find((s) => s.startsWith("media "));
if (media) {
  const got = (media.match(/^\s{2}\(/gm) ?? []).length;
  if (got < 100) problems.push(`media: only ${got} rows, expected ~149`);
  else ok.push(`media: ${got} rows`);
} else {
  problems.push("missing insert for media");
}

// Transactions balanced.
if (/^begin;/m.test(sql) && /^commit;/m.test(sql)) ok.push("wrapped in begin/commit");
else problems.push("missing begin/commit");

console.log("PASS:");
for (const o of ok) console.log("  + " + o);
if (problems.length) {
  console.log("\nPROBLEMS:");
  for (const p of problems) console.log("  - " + p);
  process.exitCode = 1;
} else {
  console.log("\nAll checks passed.");
}
