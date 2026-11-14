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
A single comic panel inspired by realistic 1960s newspaper adventure strips. Traditional black ink illustration on pure white paper. Hand-drawn pen and brush work with simple, expressive lines and bold areas of solid black. Loose, slightly irregular linework with natural variations in thickness and precision. Large flat areas of solid black, with backgrounds dissolving into black. Rain and texture drawn as white scratches in the black. Use cross-hatching sparingly. No grey tones, no grey wash, no colour, no halftone dots.

The illustration should feel genuinely hand-drawn, with a slightly imperfect and spontaneous quality. Use simplified shapes, understated details and somewhat irregular proportions. Avoid overly precise contours, perfect symmetry and excessive refinement. Not every shape needs to be perfectly resolved. Prioritize strong visual storytelling over technical detail. Show a moment of action rather than a posed portrait. Faces are simply drawn and often partly hidden: in profile, from behind, under a hat brim or in shadow. No glamorous, smooth or polished faces.

Scene: <vad som händer, var, vilka>

Composition: wide 4:3 frame, <kamera>, a single hard light source casting a sharp cone or pool of light, the rest in deep solid black.

Original characters only. No text, no speech bubbles, no captions, no panel borders, no signature.
```
"Composition" handlar bara om bildens upplägg; detaljer om platsen hör hemma i "Scene".

### Rollbilder: porträttmall

Rollbilderna är porträtt av personen, inte scener om uppgiften (Jonas 2026-11-14). Använd mallen ovan men stryk meningarna "Show a moment of action rather than a posed portrait." och "Faces are simply drawn and often partly hidden …", och regn när scenen är inomhus. Personen har en egen karaktär (ålder, ansikte, hållning) och rollen märks på en enda sak. Ansiktet ligger i ljuset och blicken går mot oss. Skicka gärna `roll-maffia-kvinna`, `roll-bartender-kvinna` och `roll-taxichauffor-man` som stilreferenser.

```
Scene: a portrait of <rollen> at night, <ålder, ansikte, kläder>. <Var personen står och den enda saken som visar rollen>. <Ljuset> falls across his/her face. He/She looks straight at us, <min>. His/Her face is clearly visible in the white light, simply drawn with a few firm lines. <Bakgrunden> dissolve(s) into solid black. Exactly one person. No other people are present.

Composition: wide 4:3 frame, chest-up portrait, eye-level camera, the figure a little right of centre, strong contrast between white light and deep black shadows.
```

`scripts/generera-bild.py` bygger alltid prompten ur mallen ovan, så porträttprompten har hittills skickats som hel prompt.

## Bilder som finns
Alla vyer har nu riktiga bilder. Alla prompter finns i `maffia/alla-bildprompter.md` i projektfilerna (den äldre `bildprompter.md` har de första versionerna).
- Startsidan: staden ovanifrån i regn, man under gatlykta (kvadratisk, beskärs till stående).
- Gå med: dörr på glänt med ljus och rök. Skapa: tom bardisk.
- Din roll innan den visas: förseglad akt. Rollporträtt: maffia, detektiv, läkare, medborgare.
- Natten, Morgonen (mord), Domen (tre pekar på en man), Maffian vinner (tak i regn), Staden vinner (gata i dagsljus).
- Ingen bild saknas.
