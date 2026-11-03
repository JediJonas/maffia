// @ts-check
// Den som dött visas först bara med namn. Efter en kort nedräkning vänder
// värdens telefon fram rollen för alla samtidigt, som en liten cliffhanger.
import { RuleError, findWinner } from './rules.js';

/** Tio sekunder för att bygga spänning. Ägaren provar om det blir för segt. */
export const ROLE_REVEAL_DELAY_MS = 10000;

/** Hur länge domslutet syns efter rollen, så att alla hinner se rösterna. */
export const VERDICT_PAUSE_MS = 10000;

/** Hur länge rollen syns innan en avgjord morgon går vidare till slutet. */
export const GAME_OVER_PAUSE_MS = 4000;

/** @typedef {import('./types.js').GameState} GameState */

/**
 * Den döda vars roll ännu inte är framvänd, morgonens offer eller den som
 * blev utvisad.
 * @param {GameState} state
 * @returns {string | null}
 */
export function findHiddenDeathId(state) {
  if (!state.settings.revealsRoleOnDeath) return null;
  const outcome = state.phase === 'day' ? state.lastNight : state.phase === 'verdict' ? state.lastDay : null;
  if (!outcome || outcome.isRoleShown) return null;
  return 'killedId' in outcome ? outcome.killedId : outcome.executedId;
}

/**
 * Vänder fram rollen på den som blev mördad eller utvisad.
 * @param {GameState} state
 * @returns {GameState}
 */
export function showDeathRole(state) {
  if (!findHiddenDeathId(state)) throw new RuleError('Det finns ingen roll att visa.');
  if (state.phase === 'day' && state.lastNight) return { ...state, lastNight: { ...state.lastNight, isRoleShown: true } };
  if (state.phase === 'verdict' && state.lastDay) return { ...state, lastDay: { ...state.lastDay, isRoleShown: true } };
  return state;
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
 * Sant när nattens mord avgjorde spelet och rollen, om den ska visas, är
 * framvänd. Då är det dags att gå vidare till slutet.
 * @param {GameState} state
 * @returns {boolean}
 */
export function isMorningDecided(state) {
  return state.phase === 'day' && Boolean(findWinner(state)) && !findHiddenDeathId(state);
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
