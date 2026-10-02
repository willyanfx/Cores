#!/usr/bin/env python3
"""Color helpers for palette extraction.

  colors.py dominant <image> [k]        -> top-k dominant colors (hex + share)
  colors.py sample <image> <x> <y> [r]  -> average hex in a (2r+1)^2 box at x,y (pixels)
  colors.py grid <image> <cols> <rows>  -> average hex at the center of each grid cell
  colors.py size <image>                -> width height
"""
import sys
from PIL import Image

def load(p):
    return Image.open(p).convert("RGB")

def hexof(c):
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in c)

def avg(im, x, y, r=3):
    w, h = im.size
    px = [im.getpixel((min(max(i, 0), w - 1), min(max(j, 0), h - 1)))
          for i in range(x - r, x + r + 1) for j in range(y - r, y + r + 1)]
    return [sum(p[k] for p in px) / len(px) for k in range(3)]

def main():
    cmd, path = sys.argv[1], sys.argv[2]
    im = load(path)
    if cmd == "size":
        print(*im.size)
    elif cmd == "sample":
        x, y = int(sys.argv[3]), int(sys.argv[4])
        r = int(sys.argv[5]) if len(sys.argv) > 5 else 3
        print(hexof(avg(im, x, y, r)))
    elif cmd == "grid":
        cols, rows = int(sys.argv[3]), int(sys.argv[4])
        w, h = im.size
        for j in range(rows):
            print(" ".join(hexof(avg(im, int((i + .5) * w / cols), int((j + .5) * h / rows), 4)) for i in range(cols)))
    elif cmd == "dominant":
        k = int(sys.argv[3]) if len(sys.argv) > 3 else 8
        small = im.copy(); small.thumbnail((200, 200))
        q = small.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
        pal = q.getpalette()
        counts = sorted(q.getcolors(), reverse=True)
        total = sum(c for c, _ in counts)
        for c, idx in counts:
            print(hexof(pal[idx * 3: idx * 3 + 3]), f"{100 * c / total:.1f}%")

main()
