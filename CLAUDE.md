# Paranormal Animals of Europe Module — Development Notes

A FoundryVTT **V13** content module adding the Awakened animals from *Paranormal
Animals of Europe* (FASA 7112) to the **Shadowrun 2nd Edition system** (`sr2e`)
as ready-to-drop **critter actors**. Separate package: own repo, own pack, no
shared code. Depends on the system via `module.json` → `relationships.systems`
(sr2e ≥ 0.10.0); critters use the system's **`npc` actor data model** (the same
type the system's core `critters` pack uses).

The sibling system repo is `../sr2e-foundryvtt`; `../sr2e-rigger-black-book` is
the template this was scaffolded from (same tooling — an Actor catalog). Read the
system `CLAUDE.md` for the data-model field contracts.

## Source material
The PAE PDF is a **scanned image** (170 pages, no text layer) — `pdftotext`
yields nothing usable, so **render every critter page and read the stat block**
(`pdftoppm -r 200`, extraction in git-ignored `_work/`). Cite the book page.
When a value is genuinely unreadable, ask for a high-res photo rather than guess
(track open ones in `docs/NEEDS-CAPTURE.md`). The TOC lists each critter's book
page; the front-matter offset is small (~+2) — navigate by the page header.

## Content scope
Only the **Awakened Animals** stat blocks (the alphabetical bestiary) are
imported as `npc` critter actors. The introduction/forward/preface, the Haber
naming system and metahuman-expressions appendices, and the *Powers of the
Awakened* rules reference are flavour/mechanics — NOT compendium items (a
critter's powers are summarised in its actor biography/notes).

**Dedupe against the system's own 42-critter `critters` pack** (Banshee, Griffin,
Phoenix, Vampire, Wolf, …): PAE's "Bean Sidhe" = the system's Banshee, etc. Only
import critters the system core lacks.

## Critter actor shape (`npc`)
Match the system `npc` fields: body/quickness/strength/charisma/intelligence/
willpower, essence, magic, reaction, initiative (+dice), attacks/powers in the
biography, armor, threatRating, movement. Prototype token art where available.

## Build workflow
`packs-src/` (per-document JSON, source of truth) → `npm run build-packs` →
`packs/` (LevelDB; committed, like RBB — a gitignored build artifact can get
wiped and leave Foundry showing an empty compendium). `npm run validate` after
each build. Build batched alphabetically; a `tools/gen-critters.mjs` generator
keeps it repeatable. Commit each batch. Releases fire on a `vX.Y.Z` tag push.

## Copyright
*Paranormal Animals of Europe* / *Shadowrun* are © FASA and rights holders.
Personal table use only, from a PDF the owner has; not for distribution. Keep
`_work/` out of git; keep the repo private.
