// Pre-flight validator for the Rigger Black Book packs. No Foundry: checks JSON,
// required keys, _key form, dup _ids. Run: node tools/validate-packs.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOT = "packs-src";
const COLLECTION = { "rbb-vehicles": "actors" };
let problems = 0;
const note = (m) => { console.error("  ✗ " + m); problems++; };
let packs;
try { packs = readdirSync(ROOT).filter((p) => statSync(join(ROOT, p)).isDirectory()); }
catch { console.error(`no ${ROOT}/ directory`); process.exit(1); }
for (const pack of packs.sort()) {
  const dir = join(ROOT, pack);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  const ids = new Map();
  const collection = COLLECTION[pack];
  if (!collection) { note(`${pack}: unknown pack`); continue; }
  console.log(`\n${pack}  (${files.length} docs, expecting !${collection}!…)`);
  for (const f of files) {
    let doc;
    try { doc = JSON.parse(readFileSync(join(dir, f), "utf8")); }
    catch (e) { note(`${f}: invalid JSON — ${e.message}`); continue; }
    for (const k of ["_id", "_key", "name", "type", "system"]) if (doc[k] === undefined) note(`${f}: missing "${k}"`);
    if (doc._id && doc._key && doc._key !== `!${collection}!${doc._id}`) note(`${f}: _key "${doc._key}" should be "!${collection}!${doc._id}"`);
    if (doc._id) { if (ids.has(doc._id)) note(`${f}: duplicate _id with ${ids.get(doc._id)}`); else ids.set(doc._id, f); }
  }
}
if (problems) { console.error(`\n${problems} problem(s) found.`); process.exit(1); }
console.log("\nAll packs valid.");
