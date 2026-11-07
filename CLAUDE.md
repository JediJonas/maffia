# CLAUDE.md

Svara på svenska. Alla ändringar görs som PR mot main som Jonas godkänner.
Pusha aldrig direkt till main och merga aldrig själv.

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

**Bakgrunden längst ner.** Safari i iOS 26 visar sidan bakom verktygsfältet
ända ner till skärmens kant, längre än `100lvh` (uppmätt: visningsytan börjar
47 px ner, lvh 739, skärmen 844, alltså 58 px under lvh). Det som syns där är
html-elementets bakgrund (canvas), inte body. Därför:

- Rastret ligger på `body::before` med papper under (`--raster-paper`), och
  `body` har `min-height: 100lvh`.
- `html` har rastrets tätaste rad upprepad (`--raster-tail`) i samma skala,
  så att det som syns under sidan ser ut som rastrets nederkant. Startsidan och
  natten sätter `background` på `:root` till svart, och då försvinner mönstret.
- Lägg aldrig en heltäckande bakgrund bara på `body` eller `#root`. Det som ska
  synas bakom verktygsfältet måste ligga på `html`.

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
