#!/usr/bin/env node
/**
 * Point each critter at its portrait, and use that same image as its token.
 *
 *   npm run portraits            # report what would change
 *   npm run portraits -- --fix   # write it into packs-src
 *
 * Convention (matching the 40 critters already in the core system's
 * `creature_portraits`): one **1024x1024 WebP with an opaque background**, used
 * as BOTH the actor portrait and the prototype token texture, with
 * `lockRotation: true` — creatures face the viewer rather than the direction of
 * travel. This is deliberately unlike the vehicle tokens, which are transparent
 * and rotate.
 *
 * Name → kebab slug, so no per-creature table: "Wild Hunt — Huntsman" looks for
 * `wild-hunt-huntsman.webp`. Creatures whose art does not exist yet are reported
 * and skipped, so this can be re-run while generation is still in progress.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const FIX = process.argv.includes("--fix");
const SRC = "packs-src";
const ART = "assets/creature_portraits";
const PREFIX = "modules/sr2e-paranormal-animals";

/** "Wild Hunt — Huntsman" → "wild-hunt-huntsman" ; "Nimue's Salamander" → "nimues-salamander" */
const slugify = (name) => name
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")   // strip accents
  .replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const wired = [], missing = [], already = [];

for (const pack of readdirSync(SRC)) {
  let files;
  try { files = readdirSync(join(SRC, pack)); } catch { continue; }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const path = join(SRC, pack, file);
    const doc = JSON.parse(readFileSync(path, "utf8"));
    if (!doc.system) continue;                       // folder entry

    if ((doc.img ?? "").includes("/assets/")) { already.push(doc.name); continue; }

    const rel = `${ART}/${slugify(doc.name)}.webp`;
    if (!existsSync(rel)) { missing.push(`${doc.name} → ${rel}`); continue; }

    const img = `${PREFIX}/${rel}`;
    doc.img = img;
    const pt = doc.prototypeToken ??= {};
    pt.texture ??= {};
    pt.texture.src = img;
    pt.lockRotation = true;          // creatures face the viewer, unlike vehicles

    wired.push({ name: doc.name, slug: rel.split("/").pop() });
    if (FIX) writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
  }
}

const pad = (s, n) => String(s).padEnd(n);
if (wired.length) {
  console.log(`${FIX ? "WIRED" : "WOULD WIRE"} ${wired.length} critter(s):\n`);
  for (const w of wired) console.log(`  ${pad(w.name, 28)}${w.slug}`);
} else {
  console.log("Nothing to wire — every critter either has art or is missing its file.");
}
if (missing.length) console.log(`\nArt not generated yet (${missing.length}):\n  ${missing.join("\n  ")}`);
if (already.length) console.log(`\nAlready had art, left alone (${already.length}).`);
if (!FIX && wired.length) console.log("\nRe-run with --fix to write.");
