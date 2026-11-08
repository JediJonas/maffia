// @ts-check
// Märker fasbyten: byter raster, vibrerar och tar fram berättartexten.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { narratePhaseChange } from '../game/narration.js';
import { vibrateForPhaseChange } from '../device/phaseSignals.js';

/**
 * @param {import('../game/playerView.js').PlayerView | null} view
 * @returns {string | null} Berättartexten för den senaste fasen.
 */
export function usePhaseAnnouncement(view) {
  const previousRef = useRef(/** @type {typeof view} */ (null));
  const [announcement, setAnnouncement] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    if (!view) return;
    const previous = previousRef.current;
    previousRef.current = view;
    const text = narratePhaseChange(previous, view);
    if (!text) return;
    setAnnouncement(text);
    // Första vyn efter att man öppnat sidan är inget byte att väcka någon för.
    if (previous) vibrateForPhaseChange();
  }, [view]);

  // Före målningen, så att övertoningen till natten får med den svarta bakgrunden.
  useLayoutEffect(() => {
    document.documentElement.dataset.phase = view?.phase === 'night' ? 'night' : 'day';
  }, [view?.phase]);

  return announcement;
}
