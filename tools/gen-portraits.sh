#!/bin/zsh
# Creature portraits for the 59 PAE critters, in the style of the system's core
# creature portraits (a painted creature centred in a moody scene of its habitat).
# Each critter's book page (rendered to _work/ref/<slug>.png, git-ignored) is the
# likeness reference when that page carries its illustration.
# Prompts come from tools/portrait-prompts.tsv (slug, page, name, description, habitat),
# exported from gen-critters.mjs. Output _work/out/<slug>.webp — existing outputs are
# skipped, so a re-run resumes. On a Codex usage limit it waits for the reset.
# Then: python3 tools/fit-portraits.py && node tools/gen-critters.mjs && npm run build-packs
set -u
ROOT=/Users/jcandalino/Code/foundryvtt/shadowrun/sr2e-paranormal-animals
OUT=_work/out; WORK=${TMPDIR:-/tmp}/pae-portraits; mkdir -p $WORK $ROOT/$OUT
cd $ROOT || exit 1
typeset -A NAME DESC HAB
SLUGS=()
while IFS=$'\t' read -r s p n d h; do SLUGS+=($s); NAME[$s]=$n; DESC[$s]=$d; HAB[$s]=$h; done < tools/portrait-prompts.tsv

while true; do
  todo=(); for s in $SLUGS; do [ -f "$OUT/$s.webp" ] || todo+=($s); done
  [ ${#todo} -eq 0 ] && { echo "all done"; break; }
  batch=(${todo[1,6]}); refs=(); list=""; i=1
  for s in $batch; do
    refs+=(-i "_work/ref/$s.png")
    list+="$i. ${NAME[$s]}: ${DESC[$s]} SETTING: ${HAB[$s]}. Save to $OUT/$s.webp"$'\n'; i=$((i+1))
  done
  pf=$WORK/prompt.txt
  cat > $pf <<EOF
Use your imagegen skill with the built-in image_gen tool (NOT the CLI fallback).

Generate ${#batch} creature portraits for a Shadowrun (2050s, magic has returned) tabletop
game, one image per creature. The attached reference images are, in the SAME ORDER as
the list below, the creature's page from a bestiary. If the page shows an illustration
of the creature, keep its anatomy and likeness; if it shows only text, design the
creature from the description. Ignore all page text.

STYLE for every image: square 1:1, the creature centred and filling much of the frame,
dramatic three-quarter view, painterly realism, in a moody atmospheric scene of its
habitat (given per creature), with a hint of the 2050s world where it fits (distant
neon, ruins, industry). Every scene and palette must differ. NO text, NO logos, NO
watermarks, NO border, NO people unless the creature itself is humanoid.

$list
Report every saved path.
EOF
  echo "=== $(date +%H:%M) ${batch}"
  timeout 2400 codex exec --skip-git-repo-check -s workspace-write $refs < $pf > $WORK/last.log 2>&1
  made=0; for s in $batch; do [ -f "$OUT/$s.webp" ] && made=$((made+1)); done
  echo "   made $made/${#batch}"
  if grep -q 'usage limit' $WORK/last.log && [ $made -lt ${#batch} ]; then
    # "try again at 4:34 PM" or "try again at Oct 3rd, 2026 4:34 PM": wait until then (+2 min).
    read at secs < <(python3 - $WORK/last.log <<'PY'
import datetime as d, re, sys
m = re.search(r"try again at ([^.\n]*?\d{1,2}:\d{2}\s*[AP]M)", open(sys.argv[1]).read())
n = d.datetime.now(); r = None
if m:
    s = re.sub(r"(\d)(st|nd|rd|th)", r"\1", m.group(1)).replace(",", "")
    for f in ("%b %d %Y %I:%M %p", "%B %d %Y %I:%M %p", "%I:%M %p"):
        try: t = d.datetime.strptime(s, f); break
        except ValueError: t = None
    if t and t.year > 1900: r = t
    elif t:
        r = n.replace(hour=t.hour, minute=t.minute, second=0)
        if r <= n: r += d.timedelta(days=1)
secs = int((r - n).total_seconds()) + 120 if r else 3600
print((m.group(1).replace(" ", "_") if m else "unknown"), max(secs, 60))
PY
)
    echo "   usage limit — waiting until ${at:-an hour} (${secs}s)"; sleep $secs
  fi
done
