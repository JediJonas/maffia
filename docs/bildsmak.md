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

## Tecknarens stil

Det som Jonas favoriter har gemensamt, jämfört med bilderna han gav okej
(Jonas 2026-11-13). Promptmallen i [bilder-och-prompter.md](bilder-och-prompter.md)
bygger på det.

1. **Svart som yta, inte som skugga.** Helt svarta partier täcker ofta halva
   bilden och bakgrunden försvinner i svart. Ljuset kommer från en enda källa,
   oftast en lampskärm eller gatlykta, och bildar en skarp ljuskägla eller
   ljuspöl.
   - Gillar: `natt-bartender-*`, `natt-korvgubbe-*`, `roll-dold`, `skapa`.
   - Okej: `roll-borgmastare-*`, `roll-stadsbo-kvinna` (väggar och tyger
     ritade ända ut i kanterna).
2. **Ett ögonblick, inte en pose.** Bilden visar något som händer: fingrar som
   pekar, en korv som räcks över, en drink som hälls upp.
   - Gillar: `dom-*`, `natt-korvgubbe-*`, `natt-bartender-*`,
     `morgon-mord-trappa-kvinna`.
   - Okej: `roll-galningen-*`, `roll-lakare-*`, `roll-stadsbo-*` (personen
     står still och tittar på oss).
3. **Ansiktet är inte huvudsaken.** Personen syns ofta bakifrån, i profil,
   under en hattbrätte, i skugga eller liten i bilden. Stora, detaljerade
   ansikten rakt framifrån är där det släta och perfekta syns mest.
   - Gillar: `natt-fonstertittare-*`, `natt-taxichauffor-*`,
     `roll-maffia-man`, `morgon-mord-telefonkiosk-man`.
   - Okej: `roll-fonstertittare-*`, `roll-taxichauffor-kvinna`,
     `roll-detektiv-kvinna`.
   - Undantag: `roll-bartender-kvinna`, `roll-maffia-kvinna` och
     `roll-taxichauffor-man` är porträtt som Jonas gillar, men även där ligger
     halva bilden i svart och ansiktet är enkelt tecknat.
4. **Grova penseldrag i stället för fin penna.** Regnet är vita repor i det
   svarta och skrafferingen är kort och snabb. Tunna linjer och mönster i
   tyger och smycken gör bilden för välgjord.
   - Okej: `roll-lakare-*` (rocken), `roll-stadsbo-kvinna` (klänningen),
     `roll-borgmastare-kvinna` (kedjan).

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
7. **Hellre ett synligt ansikte än ett helt svart.** Ansiktet får ligga i
   skugga, men ett ansikte som är helt svart blir för mörkt. Ett ansikte i
   ljuset gör inget när bilden i övrigt är bra.
   - Gillar: `roll-advokat-*`, `dom-advokat-*`.
   - Valdes bort: versionerna med advokaten i motljus och med helt svart
     ansikte (Jonas 2026-11-13).
8. **Samma tecknare i alla bilder.** Personerna i `lobby` och hela `start` ser
   ut att vara ritade av någon annan. Startsidan får vara kvar tills vidare.
9. **Ljust nog att se motivet.** `ga-med` är så mörk att det är svårt att se
   vad den föreställer.

## Omdömen i trådar

Vad Jonas har sagt om bilder när han har fått se dem i en tråd, med hans egna
ord. Läs dem tillsammans med reglerna. När flera pekar åt samma håll blir de
en regel.

- 2026-11-13, `roll-advokat-*` i motljus (bortvald): "ser ut som
  detektiven". Rollbilden måste skilja sig från de andra rollerna, inte bara
  följa stilen.
- 2026-11-13, `dom-advokat-*` med helt svart ansikte (bortvald): "Jag
  tycker inte heller det blev bra med ansikte som var så mörkt."
- 2026-11-13, första versionerna av `roll-advokat-*` och `dom-advokat-*`,
  som granskningen ville byta (regn inomhus, för välgjorda ansikten): "ser
  bra ut". Nattbilderna `natt-advokat-*`: "ser bra ut".
- 2026-11-13, dombilden för advokaten: först "en kvinna på manlig bild och
  en man på kvinnlig bild", alltså advokaten med motsatt kön mot klienten.
  Sedan valdes ändå första versionen, där advokaten är en man i båda: "Jag
  tycker det funkar som nu. Att ansiktet är skuggat får representera att
  advokaten är okänd."
- 2026-11-13, `roll-livvakt-man`, ny biffigare version (tung slagskämpe med
  boxarnäsa, tung käke och tjock nacke): "Jag tycker det ser bra ut".
- 2026-11-13, `roll-livvakt-kvinna`, om att göra henne biffig som mannen:
  "Fast jag tror inte det ser bra ut om hon är biffig på det sättet".
- 2026-11-13, `roll-livvakt-kvinna`, ny version (lång och senig, hård blick),
  där lampan hänger till vänster och käglan går bort från porten men
  ansiktena i porten ändå är jämnt upplysta: "Ser bra ut. Men jag funderar på
  belysningen. Känns den realistisk?"
- 2026-11-13, `roll-livvakt-*` med lampan rakt ovanför porten (skugga över
  ögonen, upplyst haka): "Ännu konstigare. Kan man låta lampan vara långt
  bort. En lyktstolpe på avstånd. Och en ganska mörk bild. Följdaktligen. Du
  kan ändra en av dem bara, först."
- 2026-11-13, `roll-livvakt-man` med en lyktstolpe på avstånd längst till
  vänster i en mörk bild: "Den var bra, men lyktstolpen måste kanske vara mer
  åt höger, för att få plats i mobilvyn, eller?"
- 2026-11-13, `roll-livvakt-man` med lyktstolpen på avstånd flyttad 200 px åt
  höger (`roll-livvakt-man-lykta-flyttad`): "Det ser bra ut!" Lyktan och
  ljuspölen flyttades för hand, eftersom Gemini inte flyttade dem när
  prompten bad om det.
- 2026-11-13, `roll-livvakt-kvinna` i samma mörka gata med lyktan på avstånd,
  bredvid mannen: "Det blir bra!"
- 2026-11-13, `roll-livvakt-*` (de mörka bilderna i porten med lyktan på
  avstånd), jämförda med rollbilderna han gillar: "Jag tycker att
  rollbilderna för livvakt skiljer sig mycket från stil och utförande för de
  andra rollerna (som jag markerat att jag gillar i artefakt). Kan vi börja
  om på dessa? Annan miljö eller utseende? Gärna med mannen först."
- 2026-11-13, `roll-livvakt-man`, ny scen (natt och regn framför en
  hotellentré, livvakten håller upp bakdörren på en svart bil och håller ett
  paraply, ritad med taxichauffören och bartendern som stilreferens): "Jag
  tycker den är fin."
- 2026-11-13, `natt-livvakt-*`, förslaget att göra om nattbilderna: livvakten
  går ett steg bakom en klient i päls på en regnig trottoar, sedd lite på
  avstånd, med handen innanför rocken: "Ja".
- 2026-11-13, `natt-livvakt-man` med klienten i ljus päls under paraply och
  livvakten som tittar bakåt (`natt-livvakt-man-klient-pals`, bortvald): "De
  går ju åt helt olika håll? Och klienten ska inte vara så utmärkande tycker
  jag, kanske mer som någon som går en bit framför som man bara ser
  ryggtavlan av. vet inte om man ska börja om även här, kanske. Börja med
  bara mannen."
- 2026-11-13, `natt-livvakt-man`, ny version där båda går bort från oss och
  klienten bara syns bakifrån, men livvaktens arm syns bak på ryggen: "Den är
  bra bortsett från armen som går bakvänt, innanför rocken på ryggen. Om bara
  armen inte syntes alls, för att den var på framsidan skulle den funkaz"
- 2026-11-14, `natt-livvakt-man` med armen bortmålad från ryggen
  (`natt-livvakt-man-utan-arm`, bortvald): "Jag tycker det ser ut som att han
  saknar armar nu. Kan vl göra om?"
- 2026-11-14, `natt-livvakt-man` med armen framför kroppen, livvakten snett
  bakifrån på trottoaren (`natt-livvakt-man-arm-fram`): "Kam vi tänka om?
  Göra en bild på längre avstånd, där livvakten står bredvid en port eller
  liknande?"
- 2026-11-14, `natt-livvakt-man`, ny scen på avstånd: livvakten står stilla
  med händerna i fickorna vid en upplyst dörr, lyktstolpen bredvid och
  halva bilden svart: "Vi kör på den!"
- 2026-11-14, `natt-livvakt-kvinna`, samma scen vid porten som mannen
  (högklackat, litet och lite sött ansikte, fedora i stället för rollbildens
  runda hatt, bakgrunden nästan kopierad): "Dina iakttagelser är bra, men vi
  kör på denna ändå."
- 2026-11-14, `roll-advokat-*` och `roll-livvakt-*` jämförda med de äldre
  rollbilderna: "Jag tycker att de gamla rollbilderna mer fokuserar på
  personen än uppgiften. Och stilmässigt tycker jag också det är en annan
  känsla." Förslaget att rollbilderna får en egen porträttmall: "Låter bra.
  Börja med livvakt och advokat man."
- 2026-11-14, `roll-livvakt-man` som porträtt (armarna i kors vid en upplyst
  port) och `roll-advokat-man` som porträtt (lutar sig i dörren till byrån med
  akten under armen): "Jag tycker båda är bra!"
- 2026-11-14, `natt-advokat-*` efter de nya rollporträtten: "Antar att
  nattbilderna för advokat också måste göras om, så att rätt advokat sitter
  där. Men annars gillar jag utseendet på dem jättemycket." `natt-advokat-man`
  redigerades så att porträttets advokat sitter vid bordet, med resten av
  bilden orörd.

## Bilder att byta

När bildansvarig kan ta fram bilder själv (via Gemini) byts de här först, i
den här ordningen:

1. Gillar inte: `natt-detektiv-*`, `natt-lakare-*`, `roll-detektiv-*`,
   `natt-maffia-1`–`3`. (`ga-med` byttes 2026-11-13.)
2. `lobby` byttes 2026-11-13 mot samma bar som `skapa`, och `ga-med` mot
   barens bakdörr, så att Nytt spel, Gå med och lobbyn hänger ihop (Jonas
   2026-11-13).
3. Okej, men med för mycket grått enligt kontrollen. Kör
   `python3 scripts/kontrollera-bilder.py` för den aktuella listan.
