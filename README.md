# Shadowrun 2E: Paranormal Animals of Europe

A Foundry VTT V13 module bringing *Paranormal Animals of Europe* (FASA 7112) to the [Shadowrun 2nd Edition system](https://github.com/futurekill/sr2e-foundryvtt) (`sr2e`). The Awakened animals as ready-to-drop critter actors.

## Contents

| Pack | Contents |
|---|---|
| PAE Awakened Animals | 59 actors |

## Notes

- Each critter is an `npc` actor (race "critter") with full attributes, Reaction and initiative dice, attacks, and its Powers and Weaknesses summarised in the bio.
- Stat blocks only: the rules text and the naming appendices aren't imported. Critters already in the system's core Critters pack aren't duplicated.

## Requirements

- Foundry VTT V13
- The `sr2e` system, version 0.10.0 or later

## Installation

In Foundry, **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/futurekill/sr2e-paranormal-animals/releases/latest/download/module.json
```

Then enable it in your world (**Game Settings → Manage Modules**).

## Development

`packs-src/` (one JSON file per document) is the source of truth. `packs/` is built from it, gitignored, and rebuilt by the release workflow.

```bash
npm install
npm run build-packs     # packs-src/ JSON -> packs/ LevelDB (close Foundry first)
npm run extract-packs   # pull edits made in Foundry back to packs-src/
npm run validate        # pre-flight checks on the pack sources
npm run lint
```

To release: add a `## X.Y.Z — date` section to `CHANGELOG.md` (the release notes come from it), bump `module.json`, then tag and push `vX.Y.Z`.

## Copyright

*Paranormal Animals of Europe* and *Shadowrun* are © FASA and their rights holders. This is a fan-made, non-commercial module for personal table use by owners of the book.
