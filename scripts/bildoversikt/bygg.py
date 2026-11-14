"""Bygger bildöversikten för bildrutans bilder (Jonas 2026-11-13, namnet
Bildöversikt Jonas 2026-11-14).

Sidan är en artefakt på claude.ai där Jonas markerar varje bild med gillar,
okej eller gillar inte och skriver varför. Vid varje bild går prompten att
visa och kopiera; den hämtas ur alla-bildprompter.md i projektfilerna med
hjälp av raden `Fil:` under varje rubrik. Omdömena sparas i artefaktens
databas, i samlingen `bedomning` med bildens filnamn utan .webp som id, och
den allmänna kommentaren i `anteckningar/allmant`. Bildansvarig läser dem
och skriver reglerna i docs/bildsmak.md.

Varje bild märks med om den är gjord med de nya prompterna (stilgrunden från
2026-11-14 med sparsam lavering) eller med de gamla, så att Jonas ser vilka
som återstår (Jonas 2026-11-14). En prompt räknas som ny när den nämner
"ink wash", som bara stilgrunden gör.

    python3 scripts/bildoversikt/bygg.py <mapp> [alla-bildprompter.md]

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
# Ordet som bara de nya prompterna har (se ovan).
NEW_STYLE_MARK = 'ink wash'
PROMPT_FILE = Path(sys.argv[2] if len(sys.argv) > 2 else '/mnt/project-files/maffia/alla-bildprompter.md')

src = (REPO / 'sceneImages.js').read_text()
imports = dict(re.findall(r"^import (\w+) from './images/([^']+)';$", src, re.M))
alts = {}
for key, var, alt in re.findall(r"^  (\w+): \{ src: (\w+), alt: '((?:[^'\\]|\\.)*)'", src, re.M):
    alts[imports[var]] = alt.replace("\\'", "'")

WORDS = {
 'maffia': 'Maffia', 'detektiv': 'Detektiv', 'lakare': 'Läkare', 'stadsbo': 'Stadsbo',
 'taxichauffor': 'Taxichaufför', 'fonstertittare': 'Fönstertittare', 'bartender': 'Bartender',
 'korvgubbe': 'Korvgubbe', 'borgmastare': 'Borgmästare', 'galningen': 'Galningen', 'gudfadern': 'Gudfadern',
 'livvakt': 'Livvakt', 'advokat': 'Advokat',
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

def read_prompts(path):
    """Ger {bildens id: index} och listan med promptavsnitt ({title, parts})."""
    if not path.exists():
        print('Hittar inte', path, '- sidan byggs utan prompter.')
        return {}, []
    by_id, prompts = {}, []
    for section in re.split(r'^### ', path.read_text(), flags=re.M)[1:]:
        title, _, body = section.partition('\n')
        body = re.split(r'^## ', body, flags=re.M)[0]
        files = []
        def take(m):
            files.extend(re.findall(r'`([^`]+)`', m.group(1)))
            return ''
        body = re.sub(r'^Fil: (.*)$', take, body, flags=re.M)
        if not files: continue
        parts = []
        for i, chunk in enumerate(re.split(r'^```\w*$', body, flags=re.M)):
            chunk = chunk.strip()
            if chunk: parts.append({'kind': 'code' if i % 2 else 'text', 'text': chunk})
        for f in files: by_id[f] = len(prompts)
        prompts.append({'title': title.strip(), 'parts': parts, 'new': NEW_STYLE_MARK in body})
    return by_id, prompts

prompt_of, prompts = read_prompts(PROMPT_FILE)
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
                  'alt': alts.get(f.name, ''), 'w': w, 'h': h, 'prompt': prompt_of.get(stem)})

order = {gid: i for i, (gid, _, _) in enumerate(GROUPS)}
items.sort(key=lambda x: (order[x['group']], x['id']))
data = {'groups': [{'id': g, 'title': t} for g, t, _ in GROUPS], 'images': items, 'prompts': prompts}
missing = [x['id'] for x in items if x['prompt'] is None]
if missing: print('Utan prompt:', ', '.join(missing))
print('Nya prompter:', sum(1 for x in items if x['prompt'] is not None and prompts[x['prompt']]['new']))
tpl = (HERE / 'mall.html').read_text()
(OUT / 'index.html').write_text(tpl.replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/')))
print(len(items), 'bilder', sum(p.stat().st_size for p in (OUT/'bilder').glob('*')) // 1024, 'KB')
