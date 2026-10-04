#!/usr/bin/env python3
"""Square the generated portraits to 1024 webp in assets/creature_portraits/
(the system's creature-portrait size). gen-critters.mjs wires them by file."""
import glob, os
from PIL import Image
os.makedirs("assets/creature_portraits", exist_ok=True)
for f in glob.glob("_work/out/*.webp"):
    im = Image.open(f).convert("RGB"); w, h = im.size; m = min(w, h)
    im.crop(((w-m)//2, (h-m)//2, (w-m)//2+m, (h-m)//2+m)).resize((1024, 1024), Image.LANCZOS) \
      .save(f"assets/creature_portraits/{os.path.basename(f)}", quality=86, method=6)
print(len(glob.glob("_work/out/*.webp")), "portrait(s)")
