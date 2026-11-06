// @ts-check
// Värdens telefon kör botarna. Efter varje ändring väntar den en stund och
// låter sedan en bot göra nästa sak, som om någon satt och tänkte.
import { useEffect } from 'react';
import { findNextBotMove } from '../game/bots.js';
import { applyAction } from '../game/rules.js';

/** @typedef {import('../game/types.js').GameState} GameState */

// En bot som svarar direkt avslöjar sig och hinner före människorna på natten.
const BOT_MIN_THINK_MS = 1500;
const BOT_EXTRA_THINK_MS = 2500;

/**
 * @param {GameState} state
 * @param {(rule: (state: GameState) => GameState, reportError: (message: string) => void) => void} tryRule
 * @param {(message: string) => void} reportError
 */
export function useBots(state, tryRule, reportError) {
  // Om en bot vill något beror inte på slumpen, bara vad den väljer.
  const hasBotMove = findNextBotMove(state, () => 0) !== null;
  useEffect(() => {
    if (!hasBotMove) return undefined;
    // Draget räknas ut när tiden har gått, mot spelet som det är då.
    const playNextBotMove = (/** @type {GameState} */ current) => {
      const move = findNextBotMove(current, Math.random);
      return move ? applyAction(current, move.botId, move.action) : current;
    };
    const thinkMs = BOT_MIN_THINK_MS + Math.random() * BOT_EXTRA_THINK_MS;
    const timer = setTimeout(() => tryRule(playNextBotMove, reportError), thinkMs);
    return () => clearTimeout(timer);
  }, [state, hasBotMove, tryRule, reportError]);
}
