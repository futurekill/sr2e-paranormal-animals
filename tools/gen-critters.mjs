// Generate PAE critter actors (type "npc", race "critter") into packs-src/pae-critters.
// Stats transcribed from the Paranormal Animals of Europe stat blocks (FASA 7112);
// read the page renders in _work/ — never trust OCR for numbers. Run after editing
// CRITTERS: `node tools/gen-critters.mjs && npm run build-packs && npm run validate`.
import { writeFileSync, mkdirSync } from "node:fs";
import crypto from "node:crypto";

const DIR = "packs-src/pae-critters";
mkdirSync(DIR, { recursive: true });
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
const STATS = { coreVersion: "13.351", systemId: "sr2e", systemVersion: "0.24.0",
  createdTime: 1700000000000, modifiedTime: 1700000000000, lastModifiedBy: null,
  compendiumSource: null, duplicateSource: null, exportSource: null };
const attr = (v) => ({ base: v, mod: 0, value: v, racial: 0 });

/**
 * Compact critter record → full npc actor.
 * Fields: name, b,q,s,c,i,w (attributes), e (Essence), r (Reaction), initDice,
 * attacks, powers, weak(nesses), desc, habitat, range, page, moveMult (run = q×mult),
 * magic (magic rating, 0 = mundane), armor (B=I). threatRating = mean attribute.
 */
function critter(x) {
  const id = sha("pae-critter:" + x.name);
  const tr = Math.max(1, Math.round((x.b + x.q + x.s + x.c + x.i + x.w) / 6));
  const bio =
    `<p>${x.desc}</p>` +
    (x.powers ? `<p><strong>Powers:</strong> ${x.powers}</p>` : "") +
    (x.weak && x.weak !== "None" ? `<p><strong>Weaknesses:</strong> ${x.weak}</p>` : "") +
    `<p><em>Attacks: ${x.attacks}.` +
    (x.habitat ? ` Habitat: ${x.habitat}.` : "") +
    (x.range ? ` Range: ${x.range}.` : "") +
    (x.notes ? ` ${x.notes}` : "") +
    ` PAE p.${x.page}.</em></p>`;
  return {
    _id: id, name: x.name, type: "npc", img: "icons/svg/pawprint.svg",
    system: {
      biography: bio, race: "critter", professionalRating: 0,
      body: attr(x.b), quickness: attr(x.q), strength: attr(x.s),
      charisma: attr(x.c), intelligence: attr(x.i), willpower: attr(x.w),
      essence: { value: x.e, max: x.e },
      magic: { value: x.magic || 0, max: x.magic || 0, tradition: "none", type: x.magic ? "critter" : "none", totem: "" },
      reaction: { base: 0, mod: 0, value: x.r },
      conditionMonitor: { physical: { value: 0, max: 10, overflow: 0 }, stun: { value: 0, max: 10, overflow: 0 }, overflow: 0 },
      armor: { ballistic: x.armor || 0, impact: x.armor || 0 },
      dicePools: { combat: { value: 0, max: 0, bonus: 0 }, magic: { value: 0, max: 0, bonus: 0 } },
      initiative: { base: x.r, dice: x.initDice || 1, mod: 0, value: x.r },
      threatRating: tr,
      movement: { walk: x.q, run: x.q * (x.moveMult || 3) }
    },
    items: [], effects: [], folder: null, sort: 0, flags: {}, _stats: STATS,
    prototypeToken: {
      name: x.name, displayName: 0, actorLink: false, width: 1, height: 1,
      texture: { src: "icons/svg/pawprint.svg", anchorX: 0.5, anchorY: 0.5, offsetX: 0, offsetY: 0, fit: "contain", scaleX: 1, scaleY: 1, rotation: 0, tint: "#ffffff" },
      disposition: -1
    },
    ownership: { default: 0 }, _key: `!actors!${id}`
  };
}

// ── CRITTER DATA (alphabetical; appended batch by batch) ───────────────────────
const CRITTERS = [
  // Batch 1 — A
];

for (const c of CRITTERS) {
  const w = critter(c);
  const safe = c.name.replace(/[^A-Za-z0-9]+/g, "_");
  writeFileSync(`${DIR}/${safe}_${w._id}.json`, JSON.stringify(w, null, 2) + "\n");
}
console.log(`wrote ${CRITTERS.length} critter(s) to ${DIR}`);
