// @ts-check
// Slutet: vilka som vann.
import { teamOf } from '../game/roles.js';

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
