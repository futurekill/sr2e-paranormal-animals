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
  },

  // Batch 2 — B (book p.15–23). Init dice: R "N" = 1D6, "N*" = 2D6, "N**" = 3D6.
  {
    name: "Bayard", page: 15,
    b: 10, q: 5, moveMult: 8, s: 8, c: 3, i: 3, w: 4, e: 6, r: 5, initDice: 2,
    attacks: "7S, Reach +1 (hooves)",
    powers: "Animal Control (Equines), Empathy (LOS), Enhanced Movement, Mist Form (adults only), Noxious Breath, Sonic Projection (stallions only)",
    weak: "None",
    desc: "A large magical horse (Equus maximus) that can painfully dissolve into mist. Prized by horseflesh merchants; peaceful and benign unless abused.",
    habitat: "Grassy plains, low hills",
    range: "France, fringes of Franconia and northern Italy",
    notes: "Flying Quickness multiplier in mist form is 7; 2D6 Initiative dice. Book Intelligence 3/5."
  },
  {
    name: "Bean Sidhe", page: 17,
    b: 5, q: 5, s: 2, c: 3, i: 3, w: 7, e: 6, r: 5,
    attacks: "Special (Essence Drain, Paralyzing Howl)",
    powers: "Alienation (Zone ×2), Cold Aura (Personal), Compulsion (Zone ×2), Essence Drain (Temporary), Immunity to Age, Immunity to Cold, Immunity to Normal Weapons, Immunity to Pathogens, Immunity to Poisons, Magic Sense, Manifestation, Paralyzing Howl (Zone ×2), Psychokinesis, Regeneration, Sonic Projection; some also Confusion (Zone ×2), Darkness, Magic Resistance",
    weak: "Allergy (Silver, Extreme)",
    desc: "The Celtic banshee (Spectris lamentaris) — a wailing death-spirit attached to a clan. Distinct from (and far more elaborate than) the system's generic Banshee. Dual-natured; at least one Tir Nan Og bean sidhe also casts manipulation spells.",
    habitat: "Celtic wild lands",
    range: "Scotland and Tir Nan Og",
    notes: "Dual-natured (astrally active). Essence listed 6(A)."
  },
  {
    name: "Blackberry Cat", page: 19,
    b: 2, q: 5, moveMult: 5, s: 2, c: 3, i: 3, w: 5, e: 6, r: 6, initDice: 3,
    attacks: "6L, Reach −1 (claws)",
    powers: "Accident (LOS), Adaptive Coloration, Blindness (LOS), Compulsion (LOS), Darkness, Desire Reflection (LOS), Enhanced Movement, Enhanced Reactions (for [Essence]D6 turns, 1D6 times/day), Enhanced Senses (Low-Light Vision), Hypnotic Howl (miaow, Zone ×2), Illusion (LOS)",
    weak: "Catnip (acts as a powerful intoxicant — see book)",
    desc: "A small, sly Awakened black cat (Felis nigra) that holds strong territorial ideas and toys with intruders using its mind-affecting powers. Sometimes kept as a (dangerous) pet.",
    habitat: "Woodland, heaths, rocky hills, fringes of urban areas",
    range: "Throughout Europe, especially the U.K. and east-central Europe",
    notes: "3D6 Initiative dice. Book Intelligence 3/8."
  },
  {
    name: "Brocken Bow", page: 21,
    b: 5, q: 5, s: 5, c: 2, i: 2, w: 5, e: 7, r: 6,
    attacks: "Special (Essence Drain, Paralyzing Touch)",
    powers: "Alienation (Zone ×2), Cold Aura (Personal), Darkness, Essence Drain (Permanent and Temporary), Fear (Zone ×2), Immunity to Age, Immunity to Cold, Immunity to Normal Weapons, Immunity to Pathogens, Immunity to Poisons, Manifestation, Movement, Paralyzing Touch",
    weak: "Allergy (Sunlight, Severe), Essence Loss (1 point per 10 years), Vulnerability (Fire)",
    desc: "The vengeful spirit of a woman burned in the witch trials (no accepted taxonomy). All Brocken bows have Essence Drain; roll 1D6 per other listed power — on a 1 that individual lacks it.",
    habitat: "Hills and mountains, wild lands",
    range: "Southeastern France, Germany (Franconia, Rhineland, Saxony)",
    notes: "Dual-natured; Essence listed 7(A). Book Charisma 2/6. Cold Aura can be extended to one victim within Essence×D6 metres as a Complex Action."
  },
  {
    name: "Bulldog Stoat", page: 23,
    b: 2, q: 4, moveMult: 5, s: 3, c: 1, i: 2, w: 6, e: 6, r: 4, initDice: 2,
    attacks: "6L (latches onto the wound)",
    powers: "Concealment (Personal), Enhanced Physical Attributes (Quickness, 2×/day for [Essence]D6 turns), Immunity to Pathogens, Immunity to Poisons",
    weak: "None",
    desc: "A vicious little Awakened stoat (Mustela stalini) used as a security animal. On a damaging bite it fastens to the wound, dealing escalating damage (7L, 8L, 9L…) on action 3 + 1D6 turns until killed or sated with blood.",
    habitat: "Woodland, hedgerows, grassland, rough grassland, moors",
    range: "Northern Europe, most common in Eastern Europe",
    notes: "2D6 Initiative dice. Armor protects against the latched-on damage. Book Intelligence 2/4."
  },

  // Batch 3 — B/C (book p.25–33).
  {
    name: "Burrowing Beaver", page: 25,
    b: 3, q: 4, moveMult: 4, s: 3, c: 1, i: 2, w: 2, e: 6, r: 4,
    attacks: "4M, Reach −1",
    powers: "Concealment (Personal), Enhanced Movement, Enhanced Senses (Improved Smell, Sonar)",
    weak: "None",
    desc: "A large Awakened beaver (Castor efforderis) that digs extensive tunnels and collapses them on intruders. Russian specimens are twice the size and ferocious enough to kill a bear one-on-one.",
    habitat: "In and around rivers and lakes, in wooded country",
    range: "Norway, Sweden, the Rhône and Elbe valleys in Germany (very rare), central Russia",
    notes: "The Quickness multiplier applies to both running and swimming. Book Intelligence 2/4."
  },
  {
    name: "Centaur", page: 27,
    b: 10, q: 4, moveMult: 5, s: 7, c: 1, i: 3, w: 3, e: 6, r: 4, initDice: 2,
    attacks: "6S, Reach +1",
    powers: "Enhanced Senses (Low-Light Vision, Thermographic Vision), Magic Sense, Search",
    weak: "None",
    desc: "A horse-bodied Awakened creature (Equus sagittarius); some are seen armed with polearms and armour near draco lairs.",
    habitat: "Grasslands, moors, woodland, low-lying hills",
    range: "Greece, Macedonia, southern Albania",
    notes: "2D6 Initiative dice. Book Intelligence 3/5."
  },
  {
    name: "Cerberus Hound", page: 29,
    b: 6, q: 4, moveMult: 5, s: 6, c: 1, i: 2, w: 4, e: 6, r: 5, initDice: 3,
    attacks: "8M (three heads — up to 3 bites in one Complex Action, same target)",
    powers: "Concealment (Personal), Corrosive Saliva, Enhanced Physical Attributes (Strength, 3×/day for [Essence]D6 turns), Enhanced Movement, Enhanced Reactions (3×/day for [Essence]D6 turns), Enhanced Senses (Improved Hearing & Smell, Low-Light Vision, Thermographic Vision), Immunity to Cold, Immunity to Fire",
    weak: "None",
    desc: "A three-headed Awakened dog (Canis cerberi), impossible to surprise and often magically active. Blow off one head and it keeps coming.",
    habitat: "Rocky hills, plateaux, mountains, barren land",
    range: "Greece, western Bulgaria, southern Balkan states",
    notes: "3D6 Initiative dice. Book Intelligence 2/6."
  },
  {
    name: "Corps Cadavre", page: 31,
    b: 2, q: 1, moveMult: 2, s: 2, c: 1, i: 1, w: 6, e: 0, r: 1,
    attacks: "Humanoid (uses whatever weapon it is given)",
    powers: "Immunity to Pathogens, Immunity to Poisons, Immunity to all mana spells and similar powers (empathy, hypnotic song, illusion, etc.)",
    weak: "Allergy (Sunlight, Severe)",
    desc: "A zombie — an animated corpse conditioned for simple labour or security. It never tires and feels no pain, but is slow and only semi-intelligent.",
    habitat: "No natural habitat",
    range: "Observed in southern France, northeastern Spain",
    notes: "Body and Strength are the original body's, −1 (minimum 1) — set them to match the corpse. Essence 0; takes no wound modifiers and ignores damage until a Deadly wound incapacitates it."
  },
  {
    name: "Crested Barbarian", page: 33,
    b: 5, q: 4, moveMult: 4, s: 4, c: 1, i: 2, w: 2, e: 6, r: 3,
    attacks: "4M",
    powers: "Enhanced Physical Attributes (Strength, 1×/day for [Essence+2]D6 turns), Enhanced Senses (Improved Smell, Low-Light Vision), Fear (LOS), Pestilence (roll 2D6; on a 6 the individual has this power)",
    weak: "None",
    desc: "An Awakened macaque (Macaca cristatus) with a vicious temperament; some carry a horrible plague virus (Pestilence). Several escaped the Cordoba labs in 2051.",
    habitat: "Hills, barren lands, low mountain slopes",
    range: "Predominantly Spain; also southern Portugal, Gibraltar, southeast France, northwest Italy",
    notes: "Book Intelligence 2/3."
  },

  // Batch 4 — D/E/F (book p.35–43).
  {
    name: "Dakkaryne", page: 35,
    b: 2, q: 4, moveMult: 4, s: 3, c: 1, i: 2, w: 2, e: 6, r: 4, initDice: 2,
    attacks: "6L, Reach −1",
    powers: "Alienation (Zone ×3), Corrosive Saliva, Corrosive Secretions, Engulf, Immunity to Pathogens, Immunity to Poisons, Search",
    weak: "Dietary Requirement (Dioxins, trace only)",
    desc: "A corrosive Awakened otter (Lutra ederis) of polluted waters, dissolving prey in acidic secretions. The old ones may possess shamanic talents.",
    habitat: "Polluted acidic rivers, lakes, canals (not sea water)",
    range: "Widespread throughout Europe",
    notes: "Swimming Quickness multiplier 5. 2D6 Initiative dice. Book Intelligence 2/4."
  },
  {
    name: "Dog Asp", page: 37,
    b: 1, q: 4, moveMult: 1, s: 1, c: 1, i: 2, w: 2, e: 6, r: 3, initDice: 2,
    attacks: "3L, Reach −1 (venomous bite)",
    powers: "Concealment (Personal), Enhanced Senses (Thermographic Vision), Mimicry (Special), Venom",
    weak: "None",
    desc: "A slow-moving venomous Awakened viper (Vipera pseudocanis aspis) that nests and ambushes lone wanderers. Its mimicry can act as a hypnotic song with a slight change of tone.",
    habitat: "Very varied, mountains to coast; prefers grasslands",
    range: "France and Italy, northern Spain; especially the Alps and Pyrenees",
    notes: "2D6 Initiative dice. Book Intelligence 2/4."
  },
  {
    name: "Each-Uisge", page: 39,
    b: 10, armor: 1, q: 4, moveMult: 6, s: 8, c: 1, i: 2, w: 3, e: 6, r: 4, initDice: 3,
    attacks: "6S, Reach −1",
    powers: "Compulsion (LOS), Engulf, Enhanced Movement, Enhanced Senses (Low-Light Vision, Sonar)",
    weak: "Dietary Requirements (Human/Metahuman Flesh)",
    desc: "A man-eating water-horse of Scottish legend: it lures riders, then its highly adhesive skin traps them as it drags them under to drown and devour.",
    habitat: "Freshwater rivers, lochs, lakes, estuaries and fjords (seawater-tolerant)",
    range: "Rare throughout northern Europe, especially Scotland and Tir Nan Og",
    notes: "Anyone touching it makes a Strength Test (TN = its Essence) to free the affected body part or weapon. Swimming Quickness multiplier 5. 3D6 Initiative dice. Book Body 10/1 (Hardened Armor 1), Intelligence 2/4."
  },
  {
    name: "European Gargoyle", page: 41,
    b: 10, armor: 7, q: 5, moveMult: 3, s: 8, c: 1, i: 2, w: 5, e: 6, r: 4, initDice: 2,
    attacks: "11S",
    powers: "Concealment (Personal), Enhanced Physical Attributes (Strength, 1×/day for [Essence]D6 Combat Turns), Hardened Armor, Noxious Breath",
    weak: "Allergy (Sunlight, Nuisance), Vulnerability (Iron)",
    desc: "A stone-skinned winged gargoyle (Gargoyle saxsexus) that perches on tall derelict buildings. More dangerous the more it is injured.",
    habitat: "Tall buildings, usually derelict",
    range: "Rare throughout Europe; more common in Tir Nan Og and urban Germany",
    notes: "Flying Quickness multiplier is 4. 2D6 Initiative dice. Book Body 10/7 (Hardened Armor 7), Intelligence 2/5."
  },
  {
    name: "Fenrir Wolf", page: 43,
    b: 10, q: 5, moveMult: 4, s: 9, c: 1, i: 2, w: 5, e: 5, r: 4, initDice: 2,
    attacks: "10S (bite)",
    powers: "Enhanced Physical Attributes (Strength, 2×/day for [Essence]2D6 turns), Enhanced Senses (Improved Hearing & Smell, Low-Light Vision), Fear (Zone ×3), Magical Resistance",
    weak: "None",
    desc: "A giant Norse wolf (Canis lupus aesir) of legend — fearsome, magically resistant, and most dangerous when wounded.",
    habitat: "Forests and heavy woodlands",
    range: "Scandinavia, far eastern Europe, Germany (very rare)",
    notes: "2D6 Initiative dice. Book Intelligence 2/5."
  }
];

for (const c of CRITTERS) {
  const w = critter(c);
  const safe = c.name.replace(/[^A-Za-z0-9]+/g, "_");
  writeFileSync(`${DIR}/${safe}_${w._id}.json`, JSON.stringify(w, null, 2) + "\n");
}
console.log(`wrote ${CRITTERS.length} critter(s) to ${DIR}`);
