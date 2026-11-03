// @ts-check
// Hjälp för testerna: ett spel med kända roller.
import { addPlayer, createGame } from './rules.js';

/** @typedef {import('./types.js').Role} Role */

/**
 * @param {Role[]} roles En roll per spelare. Spelarna får id p1, p2 och så vidare.
 * @returns {import('./types.js').GameState}
 */
export function createTestGame(roles) {
  let state = createGame();
  roles.forEach((_, i) => {
    state = addPlayer(state, { id: `p${i + 1}`, name: `Spelare ${i + 1}` });
  });
  return {
    ...state,
    phase: 'night',
    round: 1,
    players: state.players.map((p, i) => ({ ...p, role: roles[i] })),
  };
}
