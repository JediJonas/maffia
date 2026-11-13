"""Bygger bedömningssidan för bildrutans bilder (Jonas 2026-11-13).

Sidan är en artefakt på claude.ai där Jonas markerar varje bild med gillar,
okej eller gillar inte och skriver varför. Omdömena sparas i artefaktens
databas, i samlingen `bedomning` med bildens filnamn utan .webp som id, och
den allmänna kommentaren i `anteckningar/allmant`. Bildansvarig läser dem
och skriver reglerna i docs/bildsmak.md.

    python3 scripts/bildbedomning/bygg.py <mapp>

Skriver <mapp>/index.html och <mapp>/bilder/*.webp (800 px breda). Publicera
sedan index.html med bilderna som filer till samma artefakt, så att
omdömena följer med. Kräver Pillow.
"""
import json, re, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent / 'src' / 'scenes'
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else sys.exit('Ange en mapp att bygga sidan i.')
MAX_W = 800

src = (REPO / 'sceneImages.js').read_text()
imports = dict(re.findall(r"^import (\w+) from './images/([^']+)';$", src, re.M))
alts = {}
for key, var, alt in re.findall(r"^  (\w+): \{ src: (\w+), alt: '((?:[^'\\]|\\.)*)'", src, re.M):
    alts[imports[var]] = alt.replace("\\'", "'")

WORDS = {
 'maffia': 'Maffia', 'detektiv': 'Detektiv', 'lakare': 'Läkare', 'stadsbo': 'Stadsbo',
 'taxichauffor': 'Taxichaufför', 'fonstertittare': 'Fönstertittare', 'bartender': 'Bartender',
 'korvgubbe': 'Korvgubbe', 'borgmastare': 'Borgmästare', 'galningen': 'Galningen', 'gudfadern': 'Gudfadern',
 'hotell': 'hotell', 'hamn': 'hamn', 'narbild': 'närbild', 'perrong': 'perrong', 'polis': 'polis',
 'telefonkiosk': 'telefonkiosk', 'trappa': 'trappa',
}
OVERRIDE = {
 'roll-dold': 'Förseglad akt', 'morgon-ingen': 'Ingen blev mördad', 'dom-ingen': 'Ingen förvisad',
 'dom-kvinna': 'Domen', 'dom-man': 'Domen', 'morgon-mord-kvinna': 'Mord, gatan', 'morgon-mord-man': 'Mord, gatan', 'slut-maffia': 'Maffian vinner', 'slut-staden': 'Staden vinner',
 'start': 'Startsidan', 'ga-med': 'Gå med', 'skapa': 'Nytt spel', 'lobby': 'Lobbyn',
}
GROUPS = [
 ('start', 'Start och lobby', ['start', 'ga-med', 'skapa', 'lobby']),
 ('roll', 'Din roll', ['roll']),
 ('natt', 'Natten', ['natt']),
 ('morgon', 'Morgonen', ['morgon']),
 ('dom', 'Domen', ['dom']),
 ('slut', 'Slutet', ['slut']),
]

def group_of(stem):
    prefix = stem.split('-')[0]
    for gid, _, prefixes in GROUPS:
        if stem in prefixes or prefix in prefixes:
            return gid
    raise SystemExit(f'okänd grupp: {stem}')

def label_of(stem):
    tokens = stem.split('-')
    variant = tokens[-1] if tokens[-1] in ('kvinna', 'man') else None
    if stem in OVERRIDE: return OVERRIDE[stem], variant
    if variant: tokens = tokens[:-1]
    if stem.startswith('slut-galningen'): return 'Galningen vinner', variant
    rest = tokens[1:]
    if rest[:1] == ['mord']: rest = rest[1:]; head = 'Mord'
    else: head = None
    words = [WORDS.get(t, f'bild {t}' if t.isdigit() else t) for t in rest]
    if head:
        return head + (', ' + ', '.join(words) if words else ''), variant
    label = ', '.join(words)
    return (label[0].upper() + label[1:]) if label else stem, variant

items = []
OUT.joinpath('bilder').mkdir(parents=True, exist_ok=True)
for f in sorted((REPO / 'images').glob('*.webp')):
    stem = f.stem
    im = Image.open(f)
    w, h = im.size
    if w > MAX_W:
        h = round(h * MAX_W / w); w = MAX_W
        im = im.resize((w, h), Image.LANCZOS)
    im.save(OUT / 'bilder' / f.name, 'WEBP', quality=78, method=6)
    label, variant = label_of(stem)
    items.append({'id': stem, 'file': f.name, 'group': group_of(stem), 'label': label, 'variant': variant,
                  'alt': alts.get(f.name, ''), 'w': w, 'h': h})

order = {gid: i for i, (gid, _, _) in enumerate(GROUPS)}
items.sort(key=lambda x: (order[x['group']], x['id']))
data = {'groups': [{'id': g, 'title': t} for g, t, _ in GROUPS], 'images': items}
tpl = (HERE / 'mall.html').read_text()
(OUT / 'index.html').write_text(tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False)))
print(len(items), 'bilder', sum(p.stat().st_size for p in (OUT/'bilder').glob('*')) // 1024, 'KB')
