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
  // Batch 1 — A (book p.9–13). Body "N/A" = Body N + Hardened Armor A; Quickness
  // "N×M" = Q N, ground move ×M; Intelligence "N/M" → use N, dual noted in notes.
  {
    name: "Abrams Lobster", page: 9,
    b: 5, armor: 3, q: 3, moveMult: 4, s: 5, c: 1, i: 1, w: 4, e: 6, r: 3,
    attacks: "5S, Reach +1 (gripping claw)",
    powers: "Enhanced Senses (Sonar), Hardened Armor, Immunity to Poisons",
    weak: "None",
    desc: "A giant Awakened lobster (Homarus immanis) thriving in the PCB-enriched coastal waters of the North Sea. Grips prey in its claws and crushes it.",
    habitat: "Shallow coastal regions, seabeds, estuaries",
    range: "Coastlines of the North Sea, Scandinavia",
    notes: "Gripping claw: a victim makes a Quickness (4) Test to break free; the grip's Damage Code rises +1 each Combat Turn. Book stats: Body 5/3 (Hardened Armor 3), Intelligence 1/4."
  },
  {
    name: "Afanc", page: 11,
    b: 10, armor: 4, q: 4, moveMult: 4, s: 8, c: 1, i: 2, w: 4, e: 6, r: 3,
    attacks: "10S (gripping bite)",
    powers: "Engulf, Enhanced Physical Attributes (Strength, 3×/day for [Essence]D6 turns), Enhanced Senses (Low-Light Vision, Smell), Hardened Armor, Search",
    weak: "None",
    desc: "A crocodile-like dracoform (Crocodylus cymri) with a flat beaver-like tail, roughly 3 m plus a 1.5 m tail and ~375 kg of green-brown muscle. It digs, lives semi-socially, and ambushes large prey — sheep, cattle, even people — from the water.",
    habitat: "Rivers and estuaries",
    range: "Wales and scattered parts of Europe",
    notes: "Gripping bite: opposed Strength tests to escape; the grip's Power rises +1 each Combat Turn. Swimming Quickness multiplier 4. Book stats: Body 10/4 (Hardened Armor 4), Intelligence 2/4."
  },
  {
    name: "Aitvaras", page: 13,
    b: 4, q: 6, s: 3, c: 5, i: 6, w: 5, e: 6, r: 6, initDice: 3, moveMult: 3,
    attacks: "6L, Reach −1",
    powers: "Animal Control (Special), Concealment (Personal), Empathy (LOS), Immunity to Normal Weapons, Magical Resistance, Venom",
    weak: "None",
    desc: "A small dracoform — a flying serpent (Alutsewerpens lithuania) of Baltic folklore. Said to guard and protect its lair; extremely dangerous if cornered or threatened.",
    habitat: "Hills, forest and woodlands, grasslands",
    range: "Lithuania, Latvia, Estonia, Byelorussia",
    notes: "Flying Quickness multiplier is 7 (ground ×3); 3D6 Initiative dice."
  }
];

for (const c of CRITTERS) {
  const w = critter(c);
  const safe = c.name.replace(/[^A-Za-z0-9]+/g, "_");
  writeFileSync(`${DIR}/${safe}_${w._id}.json`, JSON.stringify(w, null, 2) + "\n");
}
console.log(`wrote ${CRITTERS.length} critter(s) to ${DIR}`);
