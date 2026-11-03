// @ts-check
import { SKIP_VOTE } from './rules.js';

/**
 * @typedef {object} TallyRow
 * @property {string} targetId En spelares id eller SKIP_VOTE.
 * @property {string[]} voterIds I spelarordning.
 */

/**
 * Röstläget på dagen, med flest röster först. Bara mål som har fått röster
 * finns med. Vid lika gäller spelarordningen, och avstå hamnar sist.
 * @param {Record<string, string>} votes Väljarens id till målet.
 * @param {string[]} playerOrder Alla spelares id i spelarordning.
 * @returns {TallyRow[]}
 */
export function tallyVotes(votes, playerOrder) {
  const targetOrder = [...playerOrder, SKIP_VOTE];
  return targetOrder
    .map((targetId) => ({
      targetId,
      voterIds: playerOrder.filter((voterId) => votes[voterId] === targetId),
    }))
    .filter((row) => row.voterIds.length > 0)
    .sort((a, b) => b.voterIds.length - a.voterIds.length);
}
