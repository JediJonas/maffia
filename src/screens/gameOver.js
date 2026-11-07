// @ts-check
// Slutet: vilka som vann och i vilken ordning alla står i listan.
import { teamOf } from '../game/roles.js';
import { sortByName } from './playerName.js';

/** @typedef {import('../game/playerView.js').PublicPlayer} PublicPlayer */

/**
 * Hela laget vinner, även de som dog på vägen. Galningen vinner ensam.
 * @param {PublicPlayer} player
 * @param {import('../game/types.js').Team | null} winner
 * @returns {boolean}
 */
export function isWinner(player, winner) {
  return winner !== null && teamOf(player.revealedRole) === winner;
}

/**
 * Vinnarna först och sedan de andra, båda i bokstavsordning.
 * @param {PublicPlayer[]} players
 * @param {import('../game/types.js').Team | null} winner
 * @returns {PublicPlayer[]} En ny lista.
 */
export function orderForGameOver(players, winner) {
  const sorted = sortByName(players);
  return [...sorted.filter((p) => isWinner(p, winner)), ...sorted.filter((p) => !isWinner(p, winner))];
}
