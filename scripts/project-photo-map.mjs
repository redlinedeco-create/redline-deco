/**
 * Resolves the photo paths each project actually uses.
 *
 *   node scripts/project-photo-map.mjs
 *
 * data/projects.ts builds its images with pool(folder, from, count) slices over
 * data/photoPool.ts. This replays those slices so the seeding SQL references the
 * same paths the bundled data did. Output is JSON on stdout.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const poolSrc = readFileSync(join(process.cwd(), "data", "photoPool.ts"), "utf8");
const projectsSrc = readFileSync(join(process.cwd(), "data", "projects.ts"), "utf8");

// photoPool.ts is generated as `folder: [ "path", ... ],` -- pull the arrays out.
const photoPool = {};
const folderRe = /"([a-z-]+)":\s*\[([^\]]*)\]/g;
let m;
while ((m = folderRe.exec(poolSrc)) !== null) {
  const paths = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  photoPool[m[1]] = paths;
}

// Each project object starts with `id: "pN"` and contains one or more
// ...pool([...]) spreads.
const out = {};
const projectRe = /id:\s*"(p\d+)"([\s\S]*?)(?=\n  \},\n  \{\n    id:|\n  \},\n\];)/g;
let p;
while ((p = projectRe.exec(projectsSrc)) !== null) {
  const id = p[1];
  const body = p[2];

  const slices = [...body.matchAll(/pool\(([\s\S]*?)\)/g)].flatMap((call) =>
    [...call[1].matchAll(/\[\s*"([a-z-]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*\]/g)].map(
      (s) => ({ folder: s[1], from: Number(s[2]), count: Number(s[3]) }),
    ),
  );

  const all = slices.flatMap(({ folder, from, count }) =>
    (photoPool[folder] ?? []).slice(from, from + count),
  );

  // Same rule as pool() in projects.ts: first photo is the cover.
  out[id] = { cover: all[0] ?? null, images: all.slice(1) };
}

console.log(JSON.stringify(out, null, 2));