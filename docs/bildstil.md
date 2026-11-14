# Bildstil

Stilguiden för bildrutans bilder. Den bygger på bilderna som ligger i
`src/scenes/images/` och på Jonas omarbetade prompter från 2026-11-09
(`maffia/alla-bildprompter.md` i projektfilerna). Promptmallen och
efterbehandlingen står i [bilder-och-prompter.md](bilder-och-prompter.md),
filnamnen i `CLAUDE.md` under Bilder. Agenten `bildansvarig`
(`.claude/agents/bildansvarig.md`) följer den här guiden.

## Känslan

En tecknad noirserie från en dagstidning kring 1960, i en amerikansk storstad
på 1950-talet. Svart tusch på vitt papper, handritat och lite ojämnt, med
stora svarta ytor. Bilden berättar en sak tydligt, hellre än att visa många
detaljer. Spänning och misstänksamhet, aldrig splatter.

## Alltid

- **Svart och vitt, med sparsam lavering.** Ingen färg, inga rasterpunkter.
  Grått får bara finnas som lavering (ink wash), som i 60- och 70-talets
  svartvita serietidningar: två eller tre platta toner med synliga
  penseldrag och hårda kanter, i bakgrund och skuggor. Aldrig mjuka
  övergångar, dimma eller grått på ansiktets ljusa sida. Det mesta av bilden
  är rent svart och vitt (Jonas 2026-11-14: "Orginalet är bäst. Kanske vi
  ska tillåta gråtoner."). Efterbehandlingen gör det svarta rent svart och
  det vita rent vitt.
- **Vitt ljus.** Skriv "white light", aldrig varmt, gult eller "golden".
  Varmt ljus ger färgade bilder.
- **Få ljuskällor och djupa skuggor:** en gatlykta, en hängande lampa, en
  skrivbordslampa, ljus från en dörr på glänt. Natten är regnig och våt.
- **Miljön:** tegelhus med brandtrappor, kullersten, vattenpölar, gatlyktor,
  bilar från 1950-talet, barer, kontor med persienner, hotellrum, kajer.
- **Kläderna:** 1950-tal. Hatt (fedora), trenchcoat, kostym med slips,
  klänning och kappa, liten hatt med flor, pärlor, skärmmössa, keps.
- **Personerna är påhittade.** Inga kända personer, inga kända seriefigurer.
- **Ingen text i bilden.** Inga pratbubblor, rubriker, siffror, ramar eller
  signaturer. Papper och kort i bilden är tomma. Undantag: korta universella
  skyltord som hör till platsen, som TAXI och HOTEL (Jonas 2026-11-14: "Taxi
  och hotel tycker jag är ok, dvs text o form av skyltar som är
  universella").
- **Död utan sår.** Mordbilderna visar att någon är död genom läget,
  föremål som har fallit och åskådare, aldrig sår eller stänk. En liten pöl
  av svart blod får synas (Jonas 2026-11-14: "Pool of black blood tycker jag
  är ok, annars blir det inte en trovärdig bild, och eftersom det är
  svartvitt känns det ändå milt."). En pistol får synas i mördarens hand, på
  håll.
- **Naturliga proportioner.** Huvudet är litet i förhållande till axlarna.
  Med bröstbild och uppfälld krage blev huvudet för stort (Jonas
  2026-11-14).

## Formatet

- **Liggande cirka 4:3** för alla vyer utom startsidan, som är stående 9:16.
  Bildrutan är 318 px hög och 1,15:1 (mobil) till 1,5:1 (dator) bred, så
  bilden beskärs olika mycket på sidorna.
- **Huvudpersonen lite till höger om mitten.** I mobilen skärs sidorna bort,
  och utsnittet (`position` i `sceneImages.js`) flyttar då bilden mot
  personen. Rollporträtten har oftast `100% 30%`.
- **Lugna hörn uppe till vänster och nere till höger.** Där ligger
  berättarens textrutor.
- **Rollporträtt:** från midjan och upp, kameran i ögonhöjd (maffian och gudfadern
  lite underifrån), personen ser in i bilden eller mot betraktaren.
  Rollbilden visar personen, inte uppgiften: ansiktet i ljuset, en egen
  karaktär och en enda sak som visar rollen. Ögonblicket och det dolda
  ansiktet hör till natt-, morgon- och dombilderna (Jonas 2026-11-14).
- **Nattbilder:** rollen gör sin sak i natten, sedd lite på avstånd: läkaren
  går med sin väska, detektiven läser en akt, stadsbon sover.

## Kvinna och man

Varje roll har en kvinna och en man (`roll-` och `natt-`), och domen och
galningens slut har det också. Spelaren väljer vilken som visas.

- **Samma scen, samma utsnitt.** Byt bara personen. Plats, ljus, kamera och
  föremål ska vara desamma, så att de två bilderna hör ihop. Skriv prompten
  för den andra genom att ändra så lite som möjligt i den första.
- **Lika värdiga.** Kvinnan är lika kompetent, farlig eller misstänkt som
  mannen. Undvik att göra henne yngre, mer uppklädd eller mer passiv än
  rollen kräver.
- **Kläderna visar könet tydligt även i liten storlek:** hatt med flor,
  kappa, klänning, uppsatt hår för kvinnan; fedora, kostym, mustasch för
  mannen.
- **Kvinnlig kropp och egen gest.** När kvinnan görs med mannens bild som
  referens följer hans händer, armar och axlar lätt med, och det syns
  direkt (Jonas 2026-11-14: "Händerna är för manliga. Det är ett
  återkommande problem."). Be om kvinnlig kropp och små smala händer, och ge
  henne en egen gest med händerna. Står hon i hans pose kopieras hans
  händer ändå.
- **Gör om hela bilden i stället för att klippa in en del.** En hatt som
  byts med en redigering syns (Jonas 2026-11-14). Gör om bilden med samma
  prompt och rätt referens.
- Mordbilderna har olika scener för kvinnor och män, men lika många av
  varje.

## Att skriva en prompt

1. Utgå från mallen i `bilder-och-prompter.md`. Första, andra och sista
   stycket ändras aldrig.
2. **Scene** berättar vad som händer, var och vilka, i ett par meningar.
   Skriv antal exakt ("exactly three people … No other people are
   present."), annars lägger bildverktyget till folk.
3. **Composition** säger bara format, kamera och var huvudpersonen står.
   Detaljer om platsen hör hemma i Scene.
4. Läs prompten mot listan Alltid ovan, särskilt vitt ljus och ingen text.
5. Leverera alltid hela prompten, alla stycken, så att den kan klistras in
   som den är.

## Vanliga fel i genererade bilder

- Gråtoner eller gulaktig ton: varmt ljus i prompten, eller ingen
  efterbehandling.
- Text, signatur eller ram i hörnet: beskärs bort i efterbehandlingen, eller
  generera igen.
- Fler personer än prompten säger, eller extra fingrar och händer.
- Huvudpersonen mitt i eller till vänster, så att den skärs bort i mobilen.
- Kvinnan och mannen i olika miljöer eller med olika kamera.
- För fint och perfekt, som digital konst. Stilen ska se handritad ut.
