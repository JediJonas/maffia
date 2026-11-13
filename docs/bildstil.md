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

- **Bara svart och vitt.** Inga gråtoner, ingen färg, inga rasterpunkter.
  Efterbehandlingen gör resten rent svart och rent vitt.
- **Vitt ljus.** Skriv "white light", aldrig varmt, gult eller "golden".
  Varmt ljus ger färgade bilder.
- **Få ljuskällor och djupa skuggor:** en gatlykta, en hängande lampa, en
  skrivbordslampa, ljus från en dörr på glänt. Natten är regnig och våt.
- **Miljön:** tegelhus med brandtrappor, kullersten, vattenpölar, gatlyktor,
  bilar från 1950-talet, barer, kontor med persienner, hotellrum, kajer.
- **Kläderna:** 1950-tal. Hatt (fedora), trenchcoat, kostym med slips,
  klänning och kappa, liten hatt med flor, pärlor, skärmmössa, keps.
- **Personerna är påhittade.** Inga kända personer, inga kända seriefigurer.
- **Ingen text i bilden.** Inga pratbubblor, rubriker, skyltar med text,
  ramar eller signaturer. Papper och kort i bilden är tomma.
- **Död utan blod.** Mordbilderna visar att någon är död genom läget,
  föremål som har fallit och åskådare, aldrig sår eller blod. Avsluta Scene
  med "No blood visible." En pistol får synas i mördarens hand, på håll.

## Formatet

- **Liggande cirka 4:3** för alla vyer utom startsidan, som är stående 9:16.
  Bildrutan är 318 px hög och 1,15:1 (mobil) till 1,5:1 (dator) bred, så
  bilden beskärs olika mycket på sidorna.
- **Huvudpersonen lite till höger om mitten.** I mobilen skärs sidorna bort,
  och utsnittet (`position` i `sceneImages.js`) flyttar då bilden mot
  personen. Rollporträtten har oftast `100% 30%`.
- **Lugna hörn uppe till vänster och nere till höger.** Där ligger
  berättarens textrutor.
- **Rollporträtt:** bröstbild, kameran i ögonhöjd (maffian och gudfadern
  lite underifrån), personen ser in i bilden eller mot betraktaren.
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
