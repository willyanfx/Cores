#!/usr/bin/env python3
"""Check that every extracted color actually appears in its source image.

For each palette color, find the closest pixel color in a downsampled copy of the
source image. Colors farther than THRESHOLD (Euclidean RGB) are reported.
"""
import json, glob, sys
from PIL import Image

THRESHOLD = float(sys.argv[1]) if len(sys.argv) > 1 else 18

cache = {}
def pixels(path):
    if path not in cache:
        im = Image.open(path).convert("RGB")
        im.thumbnail((360, 360))
        cache[path] = [c for _, c in im.getcolors(im.width * im.height)]
    return cache[path]

def rgb(h):
    h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

bad = 0
for f in sorted(glob.glob("data/extracted/*.json")):
    for p in json.load(open(f)):
        px = pixels(p["source"])
        for c in p["colors"]:
            r, g, b = rgb(c["hex"])
            d = min(((r - x) ** 2 + (g - y) ** 2 + (b - z) ** 2) ** 0.5 for x, y, z in px)
            if d > THRESHOLD:
                bad += 1
                print(f"{d:6.1f}  {c['hex']}  {c.get('name') or '':24.24}  {p['title']:24.24}  {p['source']}")
print(f"{bad} colors farther than {THRESHOLD} from any pixel in their image")
