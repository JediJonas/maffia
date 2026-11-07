"""Bygger src/paper/raster-dag.svg: det ljusa rastret på dagen.

Punkterna står i rader var 6:e px, varannan rad förskjuten 3 px, och växer
mot botten. Radien följer den gamla kurvan (0,4 px till 1,2 px), men börjar
där punkterna redan syns (START_RADIUS_Y), så att rastret syns från första
raden, direkt under toppraden (ägaren 2026-11-07).

Skriptet bygger också raster-dag-slut.svg: en ruta med de största
punkterna som upprepas under rastret på sidor som är längre än skärmen.

Kör från repots rot: python3 src/paper/bygg-raster-dag.py src/paper
"""
import sys

WIDTH, HEIGHT = 390, 920
FIRST_ROW_Y = 60      # direkt under toppraden (56 px på en skärm utan statusfält)
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
folder = sys.argv[1]
open(f'{folder}/raster-dag.svg', 'w').write(svg)

# Rutan fortsätter raderna efter y 920: nästa rad har mitten 7 px ner och
# punkten i x 3, raden efter har mitten 1 px ner (efter 12 px) och punkten i x 0.
LAST_RADIUS = round(find_radius(LAST_ROW_Y), 2)
tail = (f'<svg xmlns="http://www.w3.org/2000/svg" width="6" height="12" viewBox="0 0 6 12" fill="#111111">'
        f'<circle cx="3" cy="7" r="{LAST_RADIUS}"/><circle cx="0" cy="1" r="{LAST_RADIUS}"/><circle cx="6" cy="1" r="{LAST_RADIUS}"/></svg>')
open(f'{folder}/raster-dag-slut.svg', 'w').write(tail)
