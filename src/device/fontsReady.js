// @ts-check
/**
 * Väntar på typsnitten innan appen ritas första gången, så att texten inte
 * först visas i reservtypsnittet och sedan byter (blinket vid omladdning).
 * Fontsource använder font-display: swap, som annars visar reservtypsnittet
 * direkt, även när typsnittet ligger i cachen.
 */

/** Typsnitten som syns på första skärmen, som CSS-font-beskrivningar. */
const FIRST_SCREEN_FONTS = [
  '400 1em "Archivo Variable"',
  '900 1em "Big Shoulders Display"',
  '700 1em "Comic Neue"',
];

/** Längsta väntan. Ett långsamt nät ska inte ge en tom skärm. */
const MAX_WAIT_MS = 1500;

/** @returns {Promise<void>} Klar när typsnitten finns, eller efter MAX_WAIT_MS. */
export function waitForFonts() {
  if (!document.fonts) return Promise.resolve();
  const loaded = Promise.all(FIRST_SCREEN_FONTS.map((font) => document.fonts.load(font)));
  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
  return Promise.race([loaded, timeout]).then(() => undefined, () => undefined);
}
