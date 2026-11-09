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
 * @returns {string[]} Alla uppräkningar som röstlistan kan visa medan staden röstar,
 * från "En av …". "Ingen har röstat" räknar inte och får sin egen bredd (Jonas 2026-11-09).
 */
export function listVoteProgress(livingCount) {
  return Array.from({ length: livingCount }, (_, index) => describeVoteProgress(index + 1, livingCount));
}

/**
 * @param {number} livingCount
 * @returns {string[]} Alla uppräkningar som nattens lista kan visa, från "En av …".
 */
export function listNightProgress(livingCount) {
  return Array.from({ length: livingCount }, (_, index) => describeNightProgress(index + 1, livingCount));
}
