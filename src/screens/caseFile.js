// @ts-check
// Akten på morgonen för de roller som får veta något på natten: detektiven,
// taxichauffören och fönstertittaren. Här bestäms bara vad akten säger.
import { joinWithAnd } from '../game/numberWords.js';

/** @typedef {import('../game/playerView.js').PlayerView} PlayerView */

/**
 * @typedef {object} CaseVerdict
 * @property {string[]} lines Stämpelns text, en rad i taget.
 * @property {string} label Stämpelns text för skärmläsare.
 * @property {boolean} isMafia Bara Maffia blir en stor svart stämpel, så att den sticker ut (Jonas 2026-11-06).
 */

/**
 * @typedef {object} CaseRow
 * @property {number} round
 * @property {string} targetId
 * @property {string} when Till exempel "Undersökt natt 1".
 * @property {CaseVerdict} verdict
 */

/**
 * @typedef {object} CaseFileContent
 * @property {string} closedText Texten på den stängda akten.
 * @property {CaseRow[]} rows Den senaste natten först.
 */

/**
 * @param {Pick<PlayerView, 'me' | 'players' | 'investigations' | 'sightings'>} view
 * @returns {CaseFileContent | null} Null för den som inte har någon akt, eller en tom akt.
 */
export function buildCaseFile(view) {
  // Den som är ute ur spelet får inte prata, så akten ska inte heller gå
  // att läsa. Annars kunde den visa upp den för någon (Jonas 2026-11-06).
  if (!view.me.isAlive) return null;
  const content = describeCaseFile(view);
  if (!content?.rows.length) return null;
  return { ...content, rows: [...content.rows].reverse() };
}

/**
 * @param {Pick<PlayerView, 'me' | 'players' | 'investigations' | 'sightings'>} view
 * @returns {CaseFileContent | null} Raderna i den ordning nätterna kom.
 */
function describeCaseFile(view) {
  const nameOf = (/** @type {string} */ id) => view.players.find((p) => p.id === id)?.name ?? 'någon';
  const namesOf = (/** @type {string[]} */ ids) => (ids.length ? joinWithAnd(ids.map(nameOf)) : 'ingen');
  switch (view.me.role) {
    case 'detective':
      return {
        closedText: 'Din undersökning ligger i akten. Tryck för att läsa.',
        rows: view.investigations.map((result) => ({
          round: result.round,
          targetId: result.targetId,
          when: `Undersökt natt ${result.round}`,
          verdict: result.isMafia
            ? { lines: ['Maffia'], label: 'maffia', isMafia: true }
            : { lines: ['Inte maffia'], label: 'inte maffia', isMafia: false },
        })),
      };
    case 'taxiDriver':
      return {
        closedText: 'Din körning ligger i akten. Tryck för att läsa.',
        rows: view.sightings.map((sighting) => ({
          round: sighting.round,
          targetId: sighting.targetId,
          when: `Följd natt ${sighting.round}`,
          verdict: { lines: ['Besökte:', namesOf(sighting.seenIds)], label: `besökte ${namesOf(sighting.seenIds)}`, isMafia: false },
        })),
      };
    case 'windowWatcher':
      return {
        closedText: 'Din bevakning ligger i akten. Tryck för att läsa.',
        rows: view.sightings.map((sighting) => ({
          round: sighting.round,
          targetId: sighting.targetId,
          when: `Bevakad natt ${sighting.round}`,
          verdict: { lines: ['Besökt av:', namesOf(sighting.seenIds)], label: `besökt av ${namesOf(sighting.seenIds)}`, isMafia: false },
        })),
      };
    default:
      return null;
  }
}
