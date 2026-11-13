// @ts-check
// Hjälp för testerna: ett spel med kända roller.
import { addPlayer, applyAction, createGame } from './rules.js';

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

/**
 * Låter varje spelare välja. Natten tar slut av sig själv när alla har valt.
 * @param {import('./types.js').GameState} state
 * @param {Record<string, string>} choices Spelarens id och målets id.
 * @param {() => number} [random] Styr livvaktens strid och mordbilden.
 * @returns {import('./types.js').GameState}
 */
export function playNight(state, choices, random = Math.random) {
  let next = state;
  for (const [playerId, targetId] of Object.entries(choices)) {
    next = applyAction(next, playerId, { type: 'nightChoice', targetId }, random);
  }
  return next;
}

/**
 * Lägger varje spelares röst.
 * @param {import('./types.js').GameState} state
 * @param {Record<string, string>} votes Spelarens id och målets id.
 * @returns {import('./types.js').GameState}
 */
export function playDay(state, votes) {
  return Object.entries(votes).reduce(
    (next, [playerId, targetId]) => applyAction(next, playerId, { type: 'vote', targetId }),
    state,
  );
}
