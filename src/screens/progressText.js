// @ts-check
// Serierutorna som visar hur många som är klara, på dagen och natten.
// "Noll av fyra" låter konstigt, så då står det "ingen" (Jonas 2026-11-08).
import { capitalize, writeNumber } from '../game/numberWords.js';

/**
 * @param {number} votedCount
 * @param {number} livingCount
 * @returns {string} Rutan på röstlistan, t.ex. "Tre av fem har röstat".
 */
export function describeVoteProgress(votedCount, livingCount) {
  if (votedCount === 0) return 'Ingen har röstat';
  return capitalize(`${writeNumber(votedCount)} av ${writeNumber(livingCount)} har röstat`);
}

/**
 * @param {number} chosenCount
 * @param {number} livingCount
 * @returns {string} Rutan på nattens lista, t.ex. "Tre av fem är klara".
 */
export function describeNightProgress(chosenCount, livingCount) {
  if (chosenCount === 0) return 'Ingen är klar';
  return capitalize(`${writeNumber(chosenCount)} av ${writeNumber(livingCount)} är klara`);
}

/**
 * @param {number} livingCount
 * @returns {string[]} Alla rutor som röstlistan kan visa medan staden röstar.
 */
export function listVoteProgress(livingCount) {
  return Array.from({ length: livingCount + 1 }, (_, count) => describeVoteProgress(count, livingCount));
}

/**
 * @param {number} livingCount
 * @returns {string[]} Alla rutor som nattens lista kan visa.
 */
export function listNightProgress(livingCount) {
  return Array.from({ length: livingCount + 1 }, (_, count) => describeNightProgress(count, livingCount));
}
