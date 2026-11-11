# Maffia – bilder och prompter

Gäller alla serieillustrationer i Maffia (Leonardo AI). Bilderna ska se ut att höra ihop.

## Efterbehandling (görs alltid, innan en bild läggs in)
1. Beskär bort vit marginal, ritad ram och eventuell signatur.
2. Gör om till gråskala.
3. Justera nivåerna så att det svarta blir rent svart (0) och det vita rent vitt (255).
   Hittills: svartpunkt ca 34, vitpunkt ca 245, linjärt däremellan.
   Kontroll: 1:a–5:e percentilen ska ligga på 0, precis som mordbilden.
4. Spara som JPEG, kvalitet ca 86–88.

## Bildrutan i appen
- Höjd 318 px på alla skärmar, 2 px svart ram, object-fit: cover.
- Textrutor uppe till vänster och nere till höger, så de hörnen ska vara lugna i bilden.

## Promptmall (engelska)
Ge alltid hela prompten (alla fyra stycken) till Jonas, aldrig bara Scene.
Första och sista stycket är alltid desamma. Byt bara "Scene" och vid behov kameran i "Composition". Formatet är alltid wide 4:3, eftersom bildrutan är 318 px hög och 1,15:1 (mobil) till 1,5:1 (dator) bred. Ställ in 4:3 även i Leonardo. Undantag: startsidan, som fyller hela skärmen (9:16).

```
A single comic panel in the style of a realistic 1960s newspaper adventure strip. Black ink on pure white paper, fine brush and pen linework, bold areas of solid black, careful cross-hatching, no halftone dots. Use only pure black and pure white: no grey tones and no other colours.

Scene: <vad som händer, var, vilka>

Composition: wide 4:3 frame, <kamera>, strong contrast between light and deep black shadows.

Original characters only. No text, no speech bubbles, no captions, no panel borders, no signature.
```
"Composition" handlar bara om bildens upplägg; detaljer om platsen hör hemma i "Scene".

## Bilder som finns
Alla vyer har nu riktiga bilder. Alla prompter finns i `maffia/bildprompter.md` i projektfilerna.
- Startsidan: staden ovanifrån i regn, man under gatlykta (kvadratisk, beskärs till stående).
- Gå med: dörr på glänt med ljus och rök. Skapa: tom bardisk.
- Din roll innan den visas: förseglad akt. Rollporträtt: maffia, detektiv, läkare, medborgare.
- Natten, Morgonen (mord), Domen (tre pekar på en man), Maffian vinner (tak i regn), Staden vinner (gata i dagsljus).
- Ingen bild saknas.
