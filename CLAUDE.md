# CLAUDE.md

Svara på svenska. Alla ändringar görs som PR mot main som Jonas godkänner.
Pusha aldrig direkt till main och merga aldrig själv.

## Arbetssätt

- Jobba på en egen gren och öppna en PR mot main. Jonas granskar och mergar.
  Det som hamnar i main publiceras direkt på jedijonas.github.io/maffia.
- Kör `npm run check` (lint, typkontroll, tester och bygge) innan du pushar.
  Samma kontroll körs i GitHub Actions.
- Visuella ändringar: lägg skärmbilder i PR:en (telefon 390 px bred, gärna
  också dator), och spara dem i projektfilerna under `maffia/pr/`.
- Commit-meddelanden och kodkommentarer skrivs på svenska. Beslut som Jonas
  har tagit märks med datum, till exempel `(Jonas 2026-11-06)`.

## Arkitektur

Se README.md för mapparna. Det viktigaste:

- **Stjärntopologi.** En telefon är värd och spelar samtidigt. Värden äger
  hela spelets tillstånd (roller, vem som lever, fas). De andra skickar bara
  handlingar, som `{ type: 'vote', targetId }`, via PeerJS.
- **Skicka aldrig andras roller.** Varje telefon får bara sin egen vy från
  `src/game/playerView.js`. Lägg aldrig till fält i vyn som avslöjar någon
  annans roll eller nattval, och skriv ett test i `playerView.test.js` när
  vyn ändras.
- **Reglerna är rena funktioner** i `src/game/` (`rules.js`, `night.js`,
  `roles.js` med flera) och testas med Vitest. `src/host/` och
  `src/player/` kopplar ihop regler och nätverk. Logik hör hemma i
  `src/game/`, inte i vyerna.
- Värden kontrollerar varje handling (t.ex. figurval) innan den används.
- Återanslutning: varje telefon sparar en hemlig nyckel
  (`src/device/savedSession.js`) och får tillbaka sin plats. Värdens skärm
  hålls tänd med Wake Lock.

## Designregler i korthet

Hela reglerna står i `maffia/designregler.md` i projektfilerna. Läs dem före
en ändring av utseendet. Det viktigaste:

- Noirserie: svart tusch på vitt papper, ingen färg. Natten är svart utan
  raster. Rastret består alltid av helt svarta punkter, aldrig grå, och ligger
  aldrig bakom text.
- Typsnitt: Archivo för appens text, Big Shoulders Display 900 för rubriker,
  Comic Neue 700 i versaler för berättarens rutor och pratbubblor, Courier
  Prime för maskinskrivna svar.
- Berättarens rutor är fyrkantiga och berättar ("Staden sover …"). När appen
  förklarar något får rutan 10 px rundade hörn (klassen `explanation`). En
  svart rundad ruta (`notice`) betyder att du själv inte kan gå vidare.
- Pratbubbla bara när en person själv säger något.
- Tal skrivs med bokstäver ("tre av fem har röstat"). Siffror bara i rubriker
  som "Dag 1" och i koder.
- Ordval: "staden", inte "spelet". "Förvisad", inte utröstad. "Stadsbo",
  inte medborgare. "Figur", inte avatar.
- Knappar: 52 px höga piller i `.bottom-actions`. Två knappar: vit överst,
  svart huvudknapp underst, närmast tummen (undantag startsidan).
- Listor står i bokstavsordning (domslutet efter antal röster). Namn högst 14
  tecken.
- Avstånd: se avsnittet nedan och tabellen i designreglerna.
- Avvikelser beslutas av Jonas. Skriv in nya beslut i designregler.md.

## Bilder

- Bildrutans bilder ligger i `src/scenes/images/` och registreras i
  `src/scenes/sceneImages.js` med alt-text och utsnitt (`position`).
- Filnamn på svenska, små bokstäver utan å, ä, ö, med bindestreck:
  `<vy>-<motiv>-<kvinna|man>.webp`. Vyerna är `roll`, `natt`,
  `morgon-mord`, `dom`, `slut`, plus `start`, `ga-med`, `skapa`, `lobby`.
  Exempel: `roll-lakare-kvinna.webp`, `natt-fonstertittare-man.webp`,
  `morgon-mord-hotell-kvinna.webp`. Bilder utan kön numreras
  (`natt-maffia-1.webp`) eller får eget motiv (`dom-ingen.webp`).
- Varje roll har en kvinna och en man. Vilken som visas styrs av spelarens
  rollbild (`src/scenes/roleImageChoice.js`); botar får den efter namnet.
- Efterbehandling innan en bild läggs in: beskär bort marginal, ram och
  signatur, gör gråskala, sätt rent svart och rent vitt (svartpunkt ca 34,
  vitpunkt ca 245) och spara som WebP, cirka 1000–1100 px bred i 4:3.
  Detaljer och promptmallen: `maffia/bilder-och-prompter.md` i
  projektfilerna.

## Testa med botar

- Värden kan lägga till högst tre botar i lobbyn under Inställningar. Med
  värden och tre botar är man fyra, så en enda webbläsare kan spela ett helt
  spel. Botarna körs i värdens telefon med samma regler som alla
  (`src/game/bots.js`, `src/host/useBots.js`) och tänker 1,5–4 s per drag.
- Playwright: starta `npm run dev` (https med självsignerat certifikat, så
  använd `ignoreHTTPSErrors: true`), välj Starta nytt spel, lägg till tre
  botar i Inställningar och tryck Starta spelet. Värden måste själv välja på
  natten och rösta på dagen; botarna väntar inte på något annat.
- Fler riktiga spelare: öppna fler sidor i samma webbläsare (egen `context`
  per spelare) och gå med med rumskoden.
- Enhetstester: `createTestGame` och `playNight` i `src/game/testGame.js` ger
  ett spel med kända roller.

## Mobillayout i Safari: knappar och bakgrund längst ner

Detta har gått fel flera gånger. Följ mönstret och ändra det inte utan att
testa på en riktig iPhone.

**Regeln.** På pekskärmar (`pointer: coarse`) ligger knapparna längst ner,
nära tummen, cirka 16 px ovanför det som täcker skärmen (Safaris verktygsfält
eller hemstrecket). De sitter inte fast: är innehållet högre än skärmen trycks de ner
och rullar med. Med mus flödar de direkt under innehållet.

**Grundorsaken till felet.** Safari i iPhone (iOS 26) lämnar själv cirka
17 px mellan sidans nederkant och det flytande verktygsfältet. Där är
`env(safe-area-inset-bottom)` 0. Lade vi till 16 px hamnade knapparna 33 px
ovanför fältet. Uppmätt med `?matt` på iPhone 14 (2026-11-07): innerHeight och
dvh 699, lvh 739, säkra marginaler 0, sidans nederkant 745 px från skärmens
topp och fältets överkant 762. Två tidigare försök byggde på gissningar om
säkra marginaler och lvh/dvh och ändrade ingenting. **Mät alltid med `?matt`
innan du ändrar.**

**Mönstret.** Använd alltid `--bottom-gap` från `src/styles.css` för luften
under knappar och fasta rutor längst ner. Skriv inte
`env(safe-area-inset-bottom)` någon annanstans.

```css
:root {
  /* Android, dator, hemskärmen och liggande: 16 px eller hemstrecket. */
  --bottom-gap: max(1rem, env(safe-area-inset-bottom));
}

/* Safari i iPhone, stående: Safaris eget mellanrum räcker. Med adressfältet
   överst anger Safari 34 px för hemstrecket, och det står då kvar. */
@supports (-webkit-touch-callout: none) {
  @media (display-mode: browser) and (orientation: portrait) and (max-width: 30rem) {
    :root { --bottom-gap: env(safe-area-inset-bottom); }
  }
}

@media (pointer: coarse) {
  #root { min-height: 100dvh; }          /* dvh, inte vh eller lvh */
  .screen-content { flex: 1 0 auto; }    /* trycker knapparna nedåt */
}

main { padding-bottom: var(--bottom-gap); }
.message { position: fixed; bottom: var(--bottom-gap); }
```

- `index.html` har `viewport-fit=cover`, så att rastret går ända ner bakom
  verktygsfältet. Bakgrunden får gärna fylla `100lvh`, men knapparna placeras
  alltid mot `100dvh`.
- Lägg inte till egen `margin-bottom` eller extra luft under knappgruppen
  (`.bottom-actions`). All luft nertill kommer från `--bottom-gap`.
- Startsidan följer samma regel (`.start-content`).

**Bakgrunden längst ner.** Safari i iOS 26 ritar inte sidan längre ner än
`100lvh` (uppmätt: visningsytan börjar 47 px ner, lvh 739, skärmen 844). De
sista 58 px bakom verktygsfältet fyller Safari med en enda färg. Ett mönster
kan aldrig synas där (prövat med rastrets nederkant på html i PR #64, ingen
skillnad). Färgen tas från html-elementets bakgrundsfärg, och en stor fast
ruta vid kanten tar över (mätrutan färgade statusfältet gult). En 2 px hög fast
linje räckte inte.

- Rastret ligger på `body::before` med papper under (`--raster-paper`), och
  `body` har `min-height: 100lvh`.
- Randen är vit, sidans papper (Jonas 2026-11-07). Startsidan och natten har
  svart bakgrund på html och får svart rand.
- Lägg inte mönster eller bilder på html för att fylla randen. Det syns inte.

**Så testas det.**

1. Playwright i 390×664 med `hasTouch: true` och `isMobile: true`: sista
   knappens underkant ska ligga 16 px ovanför visningsytans nederkant när
   innehållet är lägre än skärmen. Kör också i 1280×800 med mus: knapparna ska
   stå direkt under innehållet, inte i botten.
2. Chromium har inga verktygsfält eller säkra marginaler, så en lyckad
   Playwright-körning bevisar inte att det fungerar i Safari. Be om en
   skärmbild från iPhonen med `?matt` i adressen (t.ex.
   jedijonas.github.io/maffia/?matt). Den gula rutan visar visningsytans mått,
   säkra marginaler, `--bottom-gap` och var sista knappen slutar. Den röda
   linjen är visningsytans nederkant. Mät avståndet mellan sista knappen och
   verktygsfältets överkant (cirka 16–18 px, alltså cirka 40 bildpunkter i en
   skärmbild från en iPhone med 3x skärm). Prova startsidan, Nytt spel och
   lobbyn, med verktygsfältet synligt och efter att ha rullat.

## Avstånd mellan delar

Grundregeln är 16 px luft mellan två delar (`--block-gap`), mätt från det som
syns längst ut: lappen under en lista (`--tag-overhang`) och pratbubblans
ritade kant (`--bubble-overhang` minus `--bubble-inset`). En personrad har
16 px ovanför och under, även direkt under bildrutan. Undantag: 18 px från
rubrikraden till bildrutan, 10 px mellan två knappar och 24 px ovanför
knappgruppen när den står direkt under innehållet. Lägg inte till egen luft
för en enskild del. Hela tabellen står i designreglerna (designregler.md i
projektfilerna), och avvikelser beslutas av Jonas.
