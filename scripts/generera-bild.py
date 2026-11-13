"""Tar fram en bild till bildrutan med Gemini och efterbehandlar den.

Prompten byggs ur mallen i docs/bilder-och-prompter.md, så att bara scenen
och kameran skiljer sig mellan bilderna. Råbilden sparas bredvid den färdiga
bilden, och den färdiga kontrolleras med scripts/kontrollera-bilder.py.

    python3 scripts/generera-bild.py natt-lakare-kvinna.webp \\
        --scen "A woman doctor ..." --kamera "medium shot from the side" \\
        --referens src/scenes/images/natt-bartender-kvinna.webp

    python3 scripts/generera-bild.py --modeller     # visa bildmodellerna
    python3 scripts/generera-bild.py ... --bara-prompt  # inget anrop

Nyckeln läses från miljövariabeln GEMINI_API_KEY och skrivs aldrig ut.
Kräver google-genai, Pillow och NumPy (pip install google-genai pillow numpy).
Varje anrop kostar pengar, så skriptet tar fram en bild åt gången.
"""
import argparse
import os
import re
import subprocess
import sys
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_FILE = ROOT / "docs" / "bilder-och-prompter.md"
CHECK_SCRIPT = ROOT / "scripts" / "kontrollera-bilder.py"
DEFAULT_OUT_DIR = ROOT / "nya-bilder"
# Modellen kan bytas utan kodändring. Kör --modeller för att se vilka som finns.
DEFAULT_MODEL = os.environ.get("GEMINI_BILDMODELL", "gemini-2.5-flash-image")
ASPECT_RATIO = "4:3"
# Efterbehandlingen i docs/bilder-och-prompter.md.
BLACK_POINT, WHITE_POINT = 34, 245
FINAL_WIDTH = 1050
FINAL_RATIO = 4 / 3
WEBP_QUALITY = 82


def read_template():
    text = TEMPLATE_FILE.read_text(encoding="utf-8")
    section = text.split("## Promptmall", 1)[1]
    match = re.search(r"```\n(.*?)```", section, re.S)
    if not match:
        sys.exit("Hittar ingen promptmall i docs/bilder-och-prompter.md.")
    return match.group(1).strip()


def build_prompt(scene, camera):
    template = read_template()
    if "<vad som händer, var, vilka>" not in template or "<kamera>" not in template:
        sys.exit("Promptmallen saknar <vad som händer, var, vilka> eller <kamera>.")
    return template.replace("<vad som händer, var, vilka>", scene).replace("<kamera>", camera)


def client():
    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("GEMINI_API_KEY saknas. Lägg nyckeln som hemlighet i miljön, aldrig i en fil.")
    from google import genai

    return genai.Client()


def list_models():
    for model in client().models.list():
        if "image" in model.name:
            print(model.name.removeprefix("models/"))


def generate(prompt, references, model):
    from google.genai import types

    contents = [Image.open(path) for path in references]
    if references:
        prompt += "\n\nMatch the drawing style of the attached reference panels. Do not copy their scenes."
    contents.append(prompt)
    response = client().models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(aspect_ratio=ASPECT_RATIO),
        ),
    )
    for candidate in response.candidates or []:
        for part in candidate.content.parts or []:
            if part.inline_data and part.inline_data.data:
                return Image.open(BytesIO(part.inline_data.data))
    reason = response.candidates[0].finish_reason if response.candidates else "inget svar"
    sys.exit(f"Ingen bild i svaret ({reason}).")


def finish(image):
    """Gråskala, rent svart och vitt, beskuren till 4:3 och rätt bredd."""
    grey = np.asarray(image.convert("L")).astype(float)
    levelled = np.clip((grey - BLACK_POINT) * 255 / (WHITE_POINT - BLACK_POINT), 0, 255)
    result = Image.fromarray(levelled.astype(np.uint8))
    width, height = result.size
    if width / height > FINAL_RATIO:
        new_width = round(height * FINAL_RATIO)
        left = (width - new_width) // 2
        result = result.crop((left, 0, left + new_width, height))
    else:
        new_height = round(width / FINAL_RATIO)
        top = (height - new_height) // 2
        result = result.crop((0, top, width, top + new_height))
    return result.resize((FINAL_WIDTH, round(FINAL_WIDTH / FINAL_RATIO)), Image.LANCZOS)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("filnamn", nargs="?", help="t.ex. natt-lakare-kvinna.webp")
    parser.add_argument("--scen", help="Scene-stycket på engelska")
    parser.add_argument("--kamera", default="medium shot", help="kameran i Composition")
    parser.add_argument("--referens", action="append", default=[], help="bild att härma stilen från")
    parser.add_argument("--modell", default=DEFAULT_MODEL)
    parser.add_argument("--mapp", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--modeller", action="store_true", help="lista bildmodellerna och sluta")
    parser.add_argument("--bara-prompt", action="store_true", help="skriv ut prompten utan anrop")
    args = parser.parse_args()

    if args.modeller:
        list_models()
        return 0
    if not args.filnamn or not args.scen:
        parser.error("filnamn och --scen behövs")
    prompt = build_prompt(args.scen, args.kamera)
    print(prompt)
    if args.bara_prompt:
        return 0

    args.mapp.mkdir(parents=True, exist_ok=True)
    stem = Path(args.filnamn).stem
    raw = generate(prompt, args.referens, args.modell)
    raw_path = args.mapp / f"{stem}-ra.png"
    raw.save(raw_path)
    final_path = args.mapp / f"{stem}.webp"
    finish(raw).save(final_path, "WEBP", quality=WEBP_QUALITY)
    (args.mapp / f"{stem}-prompt.txt").write_text(prompt + "\n", encoding="utf-8")
    print(f"\nRåbild: {raw_path}\nFärdig: {final_path}")
    return subprocess.run([sys.executable, str(CHECK_SCRIPT), str(final_path)]).returncode


if __name__ == "__main__":
    sys.exit(main())
