// @ts-check
// Mjuka byten mellan vyerna med webbläsarens View Transitions.
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * fade: vanlig övertoning. dusk och dawn: skärmen går genom svart, som när
 * ljuset släcks på kvällen och tänds på morgonen (Jonas 2026-11-08).
 * @typedef {'fade' | 'dusk' | 'dawn'} ViewTransitionKind
 */

/** @type {ViewTransition | null} */
let runningTransition = null;

/**
 * @param {string | undefined} fromPhase
 * @param {string | undefined} toPhase
 * @returns {ViewTransitionKind}
 */
export function chooseViewTransition(fromPhase, toPhase) {
  if (toPhase === 'night' && fromPhase !== 'night') return 'dusk';
  if (fromPhase === 'night' && toPhase !== 'night') return 'dawn';
  return 'fade';
}

/**
 * Byter vy med en övertoning. Utan stöd i webbläsaren (Safari före iOS 18)
 * och med reducerad rörelse byts vyn direkt, som förut.
 * @param {ViewTransitionKind} kind
 * @param {() => void} update Ändrar tillståndet så att nästa vy visas.
 */
export function changeViewSmoothly(kind, update) {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update();
    return;
  }
  const root = document.documentElement;
  root.dataset.viewTransition = kind;
  // Webbläsaren tar en bild av den gamla vyn och anropar sedan funktionen.
  // Den nya vyn måste finnas i DOM:en och stå överst innan den återvänder.
  const transition = document.startViewTransition(() => {
    flushSync(update);
    window.scrollTo(0, 0);
  });
  runningTransition = transition;
  transition.finished.finally(() => {
    if (runningTransition !== transition) return;
    runningTransition = null;
    delete root.dataset.viewTransition;
  });
}

/**
 * Håller kvar den visade vyn tills övertoningen till nästa fas har börjat.
 * Inom samma fas (röster, nya spelare) visas varje ny vy direkt.
 * @param {import('../game/playerView.js').PlayerView | null} view
 * @returns {import('../game/playerView.js').PlayerView | null}
 */
export function useSmoothPhaseChange(view) {
  const [shownView, setShownView] = useState(view);
  const latestViewRef = useRef(view);
  const isNewPhase = view?.phase !== shownView?.phase;

  useEffect(() => {
    latestViewRef.current = view;
  }, [view]);

  useEffect(() => {
    if (!isNewPhase) return;
    // Fler vyer kan hinna komma innan övertoningen börjar. Den senaste visas.
    changeViewSmoothly(chooseViewTransition(shownView?.phase, view?.phase), () => setShownView(latestViewRef.current));
  }, [isNewPhase, shownView?.phase, view?.phase]);

  return isNewPhase ? shownView : view;
}
