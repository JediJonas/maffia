# Bildsmak

Jonas smak i bilderna, som konkreta regler med bilderna som exempel. Stilguiden
([bildstil.md](bildstil.md)) säger vad som alltid gäller. Den här filen säger
vad som skiljer en bra bild från en som Jonas gillar. Agenten `bildansvarig`
läser filen före varje ny bild och skickar gärna med exempelbilderna som
referens.

## Hur filen växer

1. Jonas bedömer bilderna på bedömningssidan
   (<https://claude.ai/artifact/XEMHU7vZH4ngKYGMyU7pbA>): gillar, okej eller
   gillar inte, med ett par ord om varför.
2. Bildansvarig läser omdömena, letar efter vad favoriterna har gemensamt och
   vad de andra saknar, och föreslår regler här.
3. Jonas godkänner, rättar eller stryker. Varje regel får datum och minst en
   bild som exempel.
4. Nya bilder läggs till på sidan, och varje nytt omdöme kan ändra en regel.

## Målet

Bilderna ska ge känslan av en gammal svartvit serietidning. De ska vara
trovärdiga som innehåll i en serieruta från 60- eller 70-talet: inte för
mycket detaljer och inte överarbetade. En bild som ser för bra ut avslöjar att
den är gjord med AI (Jonas 2026-11-13).

## Regler

Från första bedömningen av alla 64 bilder (Jonas 2026-11-13). Filnamnen syftar
på `src/scenes/images/`.

1. **Svart tusch och vitt papper, inga grå ytor.** Skuggor är helt svarta och
   ljus är vitt papper. Grått i regn eller glas kan gå om det är sparsamt, men
   det är bättre utan. `scripts/kontrollera-bilder.py` mäter jämna grå ytor
   och godkänner högst 1,8 procent av bilden. Alla bilder som Jonas gillar
   ligger under.
   - Gillar: `dom-kvinna`, `dom-man`, `roll-bartender-*`, `roll-korvgubbe-*`,
     `morgon-mord-trappa-kvinna`, `skapa`.
   - Gillar inte: `natt-detektiv-*`, `natt-lakare-*` (grå tvätt över hela
     bilden).
   - Gränsfall: `morgon-mord-telefonkiosk-man`. Gillas, eftersom det grå bara
     är regn och glas och personen är svart och vit, men hade varit bättre
     utan.
2. **Inte för välgjord.** Linjerna ska se mänskliga ut: lite grova, ojämna och
   skissade. Släta, glamorösa ansikten och perfekta linjer avslöjar AI även när
   bilden är snygg.
   - Gillar: `roll-taxichauffor-man` (grov och skissad).
   - Okej men för välgjord: `roll-taxichauffor-kvinna`,
     `roll-fonstertittare-*`, `roll-galningen-*`, `roll-borgmastare-*`,
     `morgon-mord-hotell-*`, `morgon-mord-narbild-*`.
3. **Nära eller halvnära.** En serietecknare ritar inte en hel gata med alla
   detaljer i en liten ruta. Långt avstånd med mycket detaljer känns inte
   trovärdigt.
   - Gillar: `dom-kvinna`, `dom-man`, `roll-maffia-*`.
   - För långt bort: `natt-maffia-1`–`3`, `slut-staden`, `slut-galningen-*`,
     `dom-ingen`.
4. **Rollen syns direkt.** Man ska känna igen personen för rollen utan att
   läsa något.
   - Gillar: `natt-bartender-*`, `natt-korvgubbe-*`,
     `natt-fonstertittare-*`, `natt-taxichauffor-*`.
5. **Inga onödiga detaljer.** Det som inte berättar något ska bort.
   - Ögonen i backspegeln i `natt-taxichauffor-man`.
6. **Trovärdiga detaljer.** Det som syns ska kunna hända på riktigt.
   - En mördad person har inte kvar hatten på huvudet
     (`morgon-mord-polis-kvinna`).
   - Kläderna passar vädret: stadsbon i regnet borde ha en kappa, inte bara en
     klänning (`roll-stadsbo-kvinna`).
7. **Samma tecknare i alla bilder.** Personerna i `lobby` och hela `start` ser
   ut att vara ritade av någon annan. Startsidan får vara kvar tills vidare.
8. **Ljust nog att se motivet.** `ga-med` är så mörk att det är svårt att se
   vad den föreställer.

## Bilder att byta

När bildansvarig kan ta fram bilder själv (via Gemini) byts de här först, i
den här ordningen:

1. Gillar inte: `natt-detektiv-*`, `natt-lakare-*`, `roll-detektiv-*`,
   `natt-maffia-1`–`3`, `ga-med`.
2. `lobby`, så att den passar med de andra (Jonas 2026-11-13).
3. Okej, men med för mycket grått enligt kontrollen. Kör
   `python3 scripts/kontrollera-bilder.py` för den aktuella listan.
