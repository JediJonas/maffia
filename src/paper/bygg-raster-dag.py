"""Bygger src/paper/raster-dag.svg: det ljusa rastret på dagen.

Punkterna står i rader var 6:e px, varannan rad förskjuten 3 px, och växer
mot botten. Radien följer den gamla kurvan (0,4 px till 1,2 px), men börjar
där punkterna redan syns (START_RADIUS_Y), så att rastret syns från första
raden, strax ovanför bildrutan (ägaren 2026-11-07).

Kör från repots rot: python3 src/paper/bygg-raster-dag.py src/paper/raster-dag.svg
"""
import sys

WIDTH, HEIGHT = 390, 920
FIRST_ROW_Y = 96      # strax ovanför bildrutan i skissen (44 + 40 + 10 = 94)
LAST_ROW_Y = 918
ROW_PX = 6
# Den gamla kurvan: radien som funktion av y (punkter avlästa ur förra filen).
OLD_CURVE = [(96, .40), (156, .40), (216, .41), (276, .42), (336, .43), (396, .46),
             (456, .49), (516, .54), (576, .60), (636, .67), (696, .75), (756, .85),
             (816, .97), (876, 1.10), (918, 1.20)]
START_RADIUS_Y = 420  # där den gamla kurvan började synas (radie cirka 0,47)


def read_old_radius(y):
    for (y0, r0), (y1, r1) in zip(OLD_CURVE, OLD_CURVE[1:]):
        if y <= y1:
            return r0 + (r1 - r0) * (y - y0) / (y1 - y0)
    return OLD_CURVE[-1][1]


def find_radius(y):
    share = (y - FIRST_ROW_Y) / (LAST_ROW_Y - FIRST_ROW_Y)
    return read_old_radius(START_RADIUS_Y + share * (LAST_ROW_Y - START_RADIUS_Y))


patterns, rects = [], []
for index, y in enumerate(range(FIRST_ROW_Y, LAST_ROW_Y + 1, ROW_PX)):
    x = 0 if index % 2 == 0 else 3.0
    radius = round(find_radius(y), 2)
    patterns.append(f'<pattern id="p{index}" width="6" height="6" patternUnits="userSpaceOnUse" x="{x}" y="{y}.0"><circle cx="3.0" cy="3.0" r="{radius}"/></pattern>')
    rects.append(f'<rect y="{y}.0" width="{WIDTH}" height="6" fill="url(#p{index})"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" fill="#111111">'
       f'<defs>{"".join(patterns)}</defs>{"".join(rects)}</svg>')
open(sys.argv[1], 'w').write(svg)
