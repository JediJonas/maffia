// @ts-check
import { useEffect } from 'react';

/**
 * Varje ny vy börjar överst. Annars står mobilen kvar där man scrollade i
 * förra vyn, till exempel längst ner vid knapparna.
 * @param {string} viewKey Ändras när vyn byts.
 */
export function useScrollToTop(viewKey) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewKey]);
}

/**
 * När tangentbordet stängs i mobilen står sidan kvar uppskjuten. Den rullas
 * tillbaka överst, men inte när man bara går vidare till nästa fält.
 */
export function scrollToTopWhenDoneTyping() {
  setTimeout(() => {
    if (!(document.activeElement instanceof HTMLInputElement)) window.scrollTo(0, 0);
  }, 0);
}
