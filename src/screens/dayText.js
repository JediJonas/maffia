// @ts-check
// Serierutorna i dagsvyn.
import { capitalize, writeNumber } from '../game/numberWords.js';

/**
 * @param {number} votedCount
 * @param {number} livingCount
 * @returns {string} Rutan på listan med de levande, t.ex. "Tre av fem har röstat".
 */
export function describeVoteProgress(votedCount, livingCount) {
  // "Noll av fyra har röstat" låter konstigt (Jonas 2026-11-08).
  if (votedCount === 0) return 'Ingen har röstat';
  return capitalize(`${writeNumber(votedCount)} av ${writeNumber(livingCount)} har röstat`);
}
