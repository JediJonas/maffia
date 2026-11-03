// @ts-check
// Bara värdens telefon läser upp, så att rösten inte ekar från alla
// telefoner i rummet. Den läser värdens egen vy, men bara repliker som
// bygger på det alla får veta (narrateAloud).
import { useCallback, useEffect, useRef, useState } from 'react';
import { narrateAloud } from '../game/narration.js';
import { createNarratorVoice, loadIsVoiceEnabled, saveIsVoiceEnabled } from '../device/narratorVoice.js';

/**
 * @typedef {object} VoiceToggle
 * @property {boolean} isEnabled
 * @property {() => void} toggle
 */

/**
 * @param {import('../game/playerView.js').PlayerView | null} view
 * @returns {VoiceToggle}
 */
export function useNarratorVoice(view) {
  const [voice] = useState(createNarratorVoice);
  const [isEnabled, setIsEnabled] = useState(loadIsVoiceEnabled);
  const previousRef = useRef(/** @type {typeof view} */ (null));

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
    if (text && isEnabled) voice.speak(text);
  }, [view, isEnabled, voice]);

  const toggle = useCallback(() => {
    const next = !isEnabled;
    setIsEnabled(next);
    saveIsVoiceEnabled(next);
    voice.stop();
    // Ett prov direkt, så att värden hör att ljudet fungerar innan spelet börjar.
    if (next) voice.speak('Berättarrösten är på.');
  }, [isEnabled, voice]);

  useEffect(() => voice.stop, [voice]);

  return { isEnabled, toggle };
}
