// @ts-check
// Bara värdens telefon läser upp, så att rösten inte ekar från alla
// telefoner i rummet. Den läser värdens egen vy, men bara repliker som
// bygger på det alla får veta (narrateAloud).
import { useEffect, useRef, useState } from 'react';
import { narrateAloud } from '../game/narration.js';
import { createNarratorVoice } from '../device/narratorVoice.js';

/** @param {import('../game/playerView.js').PlayerView | null} view */
export function useNarratorVoice(view) {
  const [voice] = useState(createNarratorVoice);
  const previousRef = useRef(/** @type {typeof view} */ (null));
  const isEnabled = Boolean(view?.settings.hasNarratorVoice);

  useEffect(() => {
    // Fångas före knapparnas egna hanterare, så att talet är upplåst även
    // när trycket startar en ny fas som ska läsas upp.
    document.addEventListener('pointerdown', voice.unlock, true);
    return () => document.removeEventListener('pointerdown', voice.unlock, true);
  }, [voice]);

  useEffect(() => {
    if (!view) return;
    const previous = previousRef.current;
    previousRef.current = view;
    const text = narrateAloud(previous, view);
    if (text && view.settings.hasNarratorVoice) voice.speak(text);
  }, [view, voice]);

  useEffect(() => {
    if (!isEnabled) voice.stop();
  }, [isEnabled, voice]);

  useEffect(() => voice.stop, [voice]);
}
