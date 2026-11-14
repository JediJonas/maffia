# Maffia – bilder och prompter

Gäller alla serieillustrationer i Maffia (Leonardo AI). Bilderna ska se ut att höra ihop.

## Efterbehandling (görs alltid, innan en bild läggs in)
1. Beskär bort vit marginal, ritad ram och eventuell signatur.
2. Gör om till gråskala.
3. Justera nivåerna så att det svarta blir rent svart (0) och det vita rent vitt (255).
   Hittills: svartpunkt ca 34, vitpunkt ca 245, linjärt däremellan.
   Kontroll: 1:a–5:e percentilen ska ligga på 0, precis som mordbilden.
4. Spara som WebP, cirka 1000–1100 px bred.
5. Kontrollera med `python3 scripts/kontrollera-bilder.py <fil>`.

`python3 scripts/generera-bild.py` gör allt detta själv när en bild tas fram
med Gemini. Det beskär till 4:3 från mitten, så kontrollera utsnittet.

Stilen, och vad som gäller för kvinna och man, står i [bildstil.md](bildstil.md).

## Bildrutan i appen
- Höjd 318 px på alla skärmar, 2 px svart ram, object-fit: cover.
- Textrutor uppe till vänster och nere till höger, så de hörnen ska vara lugna i bilden.

## Promptmall (engelska)
Ge alltid hela prompten (alla fem stycken) till Jonas, aldrig bara Scene.
De två första styckena och det sista är alltid desamma (Jonas omarbetade version, 2026-11-09, utökad med tecknarens stil ur [bildsmak.md](bildsmak.md), Jonas 2026-11-13). Byt bara "Scene" och vid behov kameran och ljuskällan i "Composition". Välj nära eller halvnära bild. Formatet är alltid wide 4:3, eftersom bildrutan är 318 px hög och 1,15:1 (mobil) till 1,5:1 (dator) bred. Ställ in 4:3 även i Leonardo. Undantag: startsidan, som fyller hela skärmen (9:16).

```
A single comic panel inspired by realistic 1960s newspaper adventure strips and black-and-white comic magazines of the 1960s and 70s. Traditional black ink illustration on pure white paper. Hand-drawn pen and brush work with simple, expressive lines and bold areas of solid black. Loose, slightly irregular linework with natural variations in thickness and precision. Large flat areas of solid black, with backgrounds dissolving into black. Rain and texture drawn as white scratches in the black. Use cross-hatching sparingly. Grey is allowed only as traditional ink wash, used sparingly: diluted black ink brushed on in two or three flat tones, with visible brush strokes and hard, uneven edges, only in a few places in the background and the shadows. Most of the picture stays pure black and white. No smooth gradients, no airbrushed or digital shading, no fog or mist, no grey on the lit side of the face. No colour, no halftone dots.

The illustration should feel genuinely hand-drawn, with a slightly imperfect and spontaneous quality. Use simplified shapes, understated details and somewhat irregular proportions. Avoid overly precise contours, perfect symmetry and excessive refinement. Not every shape needs to be perfectly resolved. Prioritize strong visual storytelling over technical detail. Figures have natural, realistic adult proportions: the head is small in relation to the shoulders, not enlarged. Show a moment of action rather than a posed portrait. Faces are simply drawn and often partly hidden: in profile, from behind, under a hat brim or in shadow. No glamorous, smooth or polished faces.

Scene: <vad som händer, var, vilka>

Composition: wide 4:3 frame, <kamera>, a single hard light source casting a sharp cone or pool of light, the rest in deep solid black.

Original characters only. Full bleed: the drawing runs off all four edges of the image, with no border and no white margin. No text, no speech bubbles, no captions, no panel borders, no signature.
```
"Composition" handlar bara om bildens upplägg; detaljer om platsen hör hemma i "Scene".

### Rollbilder: porträttmall

Rollbilderna är porträtt av personen, inte scener om uppgiften (Jonas 2026-11-14). Använd mallen ovan men stryk meningarna "Show a moment of action rather than a posed portrait." och "Faces are simply drawn and often partly hidden …", och regn när scenen är inomhus. Personen har en egen karaktär (ålder, ansikte, hållning) och rollen märks på en enda sak. Ansiktet ligger i ljuset och blicken går mot oss. Personen syns från midjan och upp, inte i bröstbild, så att huvudet inte blir för stort (Jonas 2026-11-14). Skicka en enda referensbild (Jonas 2026-11-14): `roll-bartender-man` för stilen när mannen görs först, eftersom bartendern har enkla, rena linjer i ansiktet, och mannens nya bild när kvinnan görs. Kvinnans prompt börjar då med en inledning om vad bilden ska användas till och slutar den med en mening om kvinnlig kropp och händer. Ge henne en egen gest. Gemini ritar ofta en tunn ram trots full bleed; beskär bort den. Exempel: `roll-detektiv-man` och `roll-detektiv-kvinna` i `maffia/alla-bildprompter.md`.

```
Scene: a portrait of <rollen> at night, <ålder, ansikte, kläder>. <Var personen står och den enda saken som visar rollen>. <Ljuset> falls across his/her face. He/She looks straight at us, <min>. His/Her face is clearly visible in the white light, simply drawn with a few firm lines. <Bakgrunden> dissolve(s) into solid black. Exactly one person. No other people are present.

Composition: wide 4:3 frame, half-length portrait from the waist up, eye-level camera, the figure a little right of centre, strong contrast between white light and deep black shadows.
```

`scripts/generera-bild.py` bygger alltid prompten ur mallen ovan, så porträttprompten har hittills skickats som hel prompt.

## Bilder som finns
Alla vyer har nu riktiga bilder. Alla prompter finns i `maffia/alla-bildprompter.md` i projektfilerna (den äldre `bildprompter.md` har de första versionerna).
- Startsidan: staden ovanifrån i regn, man under gatlykta (kvadratisk, beskärs till stående).
- Gå med: dörr på glänt med ljus och rök. Skapa: tom bardisk.
- Din roll innan den visas: förseglad akt. Rollporträtt: maffia, detektiv, läkare, medborgare.
- Natten, Morgonen (mord), Domen (tre pekar på en man), Maffian vinner (tak i regn), Staden vinner (gata i dagsljus).
- Ingen bild saknas.
