// @ts-check
// Den som blir förvisad visas först bara med namn. Efter en kort nedräkning
// vänder värdens telefon fram rollen för alla samtidigt, som en liten
// cliffhanger. Morgonens offer visas med roll direkt (se NightOutcome).
import { RuleError, findWinner } from './rules.js';

/** Tio sekunder för att bygga spänning. Ägaren provar om det blir för segt. */
export const ROLE_REVEAL_DELAY_MS = 10000;

/** Hur länge domslutet syns efter rollen, så att alla hinner se rösterna. */
export const VERDICT_PAUSE_MS = 10000;

/**
 * Hur länge en avgjord morgon syns innan spelet tar slut. Lika länge som
 * nedräkningen före rollen var, innan rollen började visas direkt.
 */
export const GAME_OVER_PAUSE_MS = 10000;

/** @typedef {import('./types.js').GameState} GameState */

/**
 * Den förvisade, så länge rollen ännu inte är framvänd.
 * @param {GameState} state
 * @returns {string | null}
 */
export function findHiddenDeathId(state) {
  if (!state.settings.revealsRoleOnDeath || state.phase !== 'verdict' || !state.lastDay) return null;
  return state.lastDay.isRoleShown ? null : state.lastDay.executedId;
}

/**
 * Vänder fram rollen på den som blev förvisad.
 * @param {GameState} state
 * @returns {GameState}
 */
export function showDeathRole(state) {
  if (!findHiddenDeathId(state) || !state.lastDay) throw new RuleError('Det finns ingen roll att visa.');
  return { ...state, lastDay: { ...state.lastDay, isRoleShown: true } };
}

/**
 * Sant när domslutet är färdigvisat och spelet kan gå vidare.
 * @param {GameState} state
 * @returns {boolean}
 */
export function isVerdictShown(state) {
  return state.phase === 'verdict' && !findHiddenDeathId(state);
}

/**
 * Sant när nattens mord avgjorde spelet. Då går morgonen vidare till slutet
 * efter en kort paus.
 * @param {GameState} state
 * @returns {boolean}
 */
export function isMorningDecided(state) {
  return state.phase === 'day' && Boolean(findWinner(state));
}

/**
 * Avslutar en morgon där nattens mord avgjorde spelet.
 * @param {GameState} state
 * @returns {GameState}
 */
export function endDecidedMorning(state) {
  const winner = findWinner(state);
  if (!isMorningDecided(state) || !winner) throw new RuleError('Spelet är inte avgjort.');
  return { ...state, phase: 'gameOver', winner };
}
