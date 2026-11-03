// @ts-check
// Den som dött visas först bara med namn. Värden vänder sedan fram rollen
// för alla samtidigt, så att det blir en liten cliffhanger.
import { RuleError } from './rules.js';

/** @typedef {import('./types.js').GameState} GameState */

/**
 * Den döda vars roll ännu inte är framvänd, morgonens offer eller den som
 * röstades ut.
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
 * Värden vänder fram rollen på den som dog i natt eller röstades ut.
 * @param {GameState} state
 * @returns {GameState}
 */
export function showDeathRole(state) {
  if (!findHiddenDeathId(state)) throw new RuleError('Det finns ingen roll att visa.');
  if (state.phase === 'day' && state.lastNight) return { ...state, lastNight: { ...state.lastNight, isRoleShown: true } };
  if (state.phase === 'verdict' && state.lastDay) return { ...state, lastDay: { ...state.lastDay, isRoleShown: true } };
  return state;
}
