# CLAUDE.md

Svara på svenska. Alla ändringar görs som PR mot main som Jonas godkänner.
Pusha aldrig direkt till main och merga aldrig själv.

## Knappar längst ner i mobilen

Detta har gått fel flera gånger. Följ mönstret och ändra det inte utan att
testa på en riktig iPhone.

**Regeln.** På pekskärmar (`pointer: coarse`) ligger knapparna längst ner,
nära tummen, 16 px ovanför det som täcker skärmen (Safaris verktygsfält eller
hemstrecket). De sitter inte fast: är innehållet högre än skärmen trycks de ner
och rullar med. Med mus flödar de direkt under innehållet.

**Grundorsaken till felet.** `env(safe-area-inset-bottom)` (34 px på iPhone
med hemstreck) är till för hemstrecket. I Safari på en stående telefon slutar
sidan vid verktygsfältets överkant, och fältet täcker redan hemstrecket. Safari
i iOS 26 anger ändå 34 px, även när det flytande verktygsfältet syns, och då
hamnar knapparna 34 px för högt. Uppmätt i skärmbilder från iPhone 14
(2026-11-07): knapparna låg 34 px ovanför verktygsfältet, både med
`max(1rem, env(safe-area-inset-bottom))` och med försöket att dra av
`100lvh - 100dvh` (i iOS 26 är lvh och dvh lika, båda slutar vid fältet).

**Mönstret.** Använd alltid `--bottom-gap` från `src/styles.css` för luften
under knappar och fasta rutor längst ner. Skriv aldrig
`env(safe-area-inset-bottom)` direkt.

```css
:root {
  /* Utan webbläsarfält (hemskärmen, liggande) behövs hemstreckets marginal. */
  --bottom-gap: max(1rem, env(safe-area-inset-bottom));
}

/* Stående i webbläsaren täcker verktygsfältet redan hemstrecket. */
@media (pointer: coarse) and (display-mode: browser) and (orientation: portrait) {
  :root { --bottom-gap: 1rem; }
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

**Så testas det.**

1. Playwright i 390×664 med `hasTouch: true` och `isMobile: true`: sista
   knappens underkant ska ligga 16 px ovanför visningsytans nederkant när
   innehållet är lägre än skärmen. Kör också i 1280×800 med mus: knapparna ska
   stå direkt under innehållet, inte i botten.
2. Chromium har inga verktygsfält eller säkra marginaler, så en lyckad
   Playwright-körning bevisar inte att det fungerar i Safari. Det sista provet
   görs på en riktig iPhone i Safari: be om en skärmbild och mät avståndet
   mellan sista knappens underkant och verktygsfältets överkant (16 px, alltså
   cirka 48 bildpunkter på en iPhone med 3x skärm). Prova startsidan, Nytt spel och lobbyn, med
   verktygsfältet synligt, efter att ha rullat så att det krymper, och från
   hemskärmen (där finns inget verktygsfält och knapparna ska ligga 34 px
   ovanför skärmens kant).
