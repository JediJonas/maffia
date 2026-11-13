"""Tar fram en bild till bildrutan med Gemini och efterbehandlar den.

Prompten byggs ur mallen i docs/bilder-och-prompter.md, så att bara scenen
och kameran skiljer sig mellan bilderna. Råbilden sparas bredvid den färdiga
bilden, och den färdiga kontrolleras med scripts/kontrollera-bilder.py.

    python3 scripts/generera-bild.py natt-lakare-kvinna.webp \\
        --scen "A woman doctor ..." --kamera "medium shot from the side" \\
        --referens src/scenes/images/natt-bartender-kvinna.webp

    python3 scripts/generera-bild.py --modeller     # visa bildmodellerna
    python3 scripts/generera-bild.py ... --bara-prompt  # inget anrop

Nyckeln läggs helst på av molnmiljöns nätverk (en Network secret för
generativelanguage.googleapis.com med headern x-goog-api-key), så att den
aldrig syns i sessionen. Annars läses den från miljövariabeln GEMINI_API_KEY.
Den skrivs aldrig ut. Kräver Pillow och NumPy.
Varje anrop kostar pengar, så skriptet tar fram en bild åt gången.
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
from io import BytesIO
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_FILE = ROOT / "docs" / "bilder-och-prompter.md"
CHECK_SCRIPT = ROOT / "scripts" / "kontrollera-bilder.py"
DEFAULT_OUT_DIR = ROOT / "nya-bilder"
# Modellen kan bytas utan kodändring. Kör --modeller för att se vilka som finns.
# gemini-3.1-flash-image (Nano Banana 2) är den nyaste och billigaste med
# 4:3 och generateContent, enligt models-listan 2026-11-13.
DEFAULT_MODEL = os.environ.get("GEMINI_BILDMODELL", "gemini-3.1-flash-image")
ASPECT_RATIO = "4:3"
# 1K räcker för 1050 px bredd och är billigast.
IMAGE_SIZE = "1K"
API_URL = "https://generativelanguage.googleapis.com/v1beta"
REQUEST_TIMEOUT_SECONDS = 180
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


def call_api(path, body=None):
    headers = {"Content-Type": "application/json"}
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        headers["x-goog-api-key"] = key
    data = json.dumps(body).encode() if body is not None else None
    request = Request(f"{API_URL}/{path}", data=data, headers=headers)
    try:
        with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            return json.load(response)
    except HTTPError as error:
        message = json.loads(error.read() or b"{}").get("error", {}).get("message", "")
        if error.code in (401, 403):
            sys.exit(f"Gemini nekade anropet ({error.code}: {message}). Saknas nyckeln i molnmiljön?")
        sys.exit(f"Gemini svarade {error.code}: {message}")


def list_models():
    for model in call_api("models?pageSize=1000").get("models", []):
        if "image" in model["name"]:
            print(model["name"].removeprefix("models/"))


def image_part(path):
    buffer = BytesIO()
    Image.open(path).convert("RGB").save(buffer, "PNG")
    return {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(buffer.getvalue()).decode()}}


def generate(prompt, references, model):
    if references:
        prompt += "\n\nMatch the drawing style of the attached reference panels. Do not copy their scenes."
    parts = [image_part(path) for path in references] + [{"text": prompt}]
    response = call_api(
        f"models/{model}:generateContent",
        {
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ASPECT_RATIO, "imageSize": IMAGE_SIZE}},
        },
    )
    candidates = response.get("candidates") or []
    for candidate in candidates:
        for part in candidate.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            # Modeller som tänker kan skicka utkast först. De hoppas över.
            if part.get("thought"):
                continue
            if inline and inline.get("data"):
                return Image.open(BytesIO(base64.b64decode(inline["data"])))
    reason = candidates[0].get("finishReason") if candidates else response.get("promptFeedback", "inget svar")
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
