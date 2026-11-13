"""Kontrollerar att bildrutans bilder är efterbehandlade enligt
docs/bilder-och-prompter.md: gråskala, rent svart och rent vitt, WebP och
ungefär rätt storlek. Ändrar inga filer.

    python3 scripts/kontrollera-bilder.py              # alla bilder
    python3 scripts/kontrollera-bilder.py ny-bild.webp # en eller flera filer

Kräver Pillow och NumPy. Skriver en rad per problem och slutar med kod 1
om något hittades.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

IMAGE_DIR = Path(__file__).resolve().parent.parent / "src" / "scenes" / "images"
MIN_WIDTH, MAX_WIDTH = 900, 1200
# Bildrutan är 1,15:1 i mobilen och 1,5:1 på dator, så bilderna är cirka 4:3
# med lite marginal åt båda hållen.
MIN_RATIO, MAX_RATIO = 1.3, 1.6
# Startsidan fyller hela skärmen och är stående.
PORTRAIT_FILES = {"start.webp"}
MAX_CHANNEL_DIFFERENCE = 2
DARKEST_PERCENTILE, LIGHTEST_PERCENTILE = 2, 98


def check(path):
    problems = []
    if path.suffix != ".webp":
        problems.append("är inte WebP")
    with Image.open(path) as image:
        width, height = image.size
        pixels = np.asarray(image.convert("RGB")).astype(int)
    if path.name not in PORTRAIT_FILES:
        if not MIN_WIDTH <= width <= MAX_WIDTH:
            problems.append(f"är {width} px bred, ska vara cirka 1000–1100")
        ratio = width / height
        if not MIN_RATIO <= ratio <= MAX_RATIO:
            problems.append(f"har formatet {ratio:.2f}:1, ska vara cirka 4:3 (1,3–1,6)")
    difference = max(np.abs(pixels[..., 0] - pixels[..., 1]).max(), np.abs(pixels[..., 1] - pixels[..., 2]).max())
    if difference > MAX_CHANNEL_DIFFERENCE:
        problems.append("är inte gråskala")
    grey = pixels.mean(axis=2)
    darkest = np.percentile(grey, DARKEST_PERCENTILE)
    lightest = np.percentile(grey, LIGHTEST_PERCENTILE)
    if darkest > 0:
        problems.append(f"har inget rent svart ({DARKEST_PERCENTILE}:a percentilen är {darkest:.0f}, ska vara 0)")
    if lightest < 255:
        problems.append(f"har inget rent vitt ({LIGHTEST_PERCENTILE}:e percentilen är {lightest:.0f}, ska vara 255)")
    return problems


def main(arguments):
    paths = [Path(a) for a in arguments] or sorted(IMAGE_DIR.glob("*"))
    found = False
    for path in paths:
        for problem in check(path):
            found = True
            print(f"{path.name}: {problem}")
    if not found:
        print(f"{len(paths)} bilder kontrollerade, inga problem.")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
