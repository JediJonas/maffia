// @ts-check
// Berättarens repliker vid fasbyten. De visas på alla skärmar, så de får
// bara bygga på det som alla redan får veta.
import { ROLE_INFO } from './roles.js';

/** @typedef {import('./playerView.js').PlayerView} PlayerView */

// Rutan säger hela meningen (se Ord vi använder i docs/regler.md).
const KILL = 'blev mördad av maffian';
const SHOT = 'blev skjuten av livvakten';
const EXECUTION = 'blev förvisad ur staden';

/** @type {Record<import('./types.js').Team, string>} */
const ENDINGS = {
  mafia: 'Maffian har tagit över staden.',
  town: 'Staden har besegrat maffian.',
  madman: 'Galningen lurade staden och blev förvisad.',
};

/**
 * @param {PlayerView | null} previous
 * @param {PlayerView} next
 * @returns {string | null} Null när fasen inte har bytts.
 */
export function narratePhaseChange(previous, next) {
  if (previous && previous.phase === next.phase && previous.round === next.round) return null;
  switch (next.phase) {
    case 'roleReveal':
      return 'Spelet börjar. Titta på din roll i hemlighet och tryck sedan på klar.';
    case 'night':
      return 'Natten faller. Alla tittar i sin telefon och gör sitt val.';
    case 'day':
      return `Staden vaknar. ${describeKill(next)} Diskutera och rösta om vem som ska förvisas.`;
    case 'verdict':
      return `Alla har röstat. ${describeExecution(next)}`;
    case 'gameOver':
      return `Spelet är slut. ${ENDINGS[next.winner ?? 'town']}`;
    default:
      return null;
  }
}

/**
 * @param {PlayerView} view
 * @returns {string}
 */
function describeKill(view) {
  const killedId = view.lastNight?.killedId;
  if (!killedId) return 'Ingen blev mördad.';
  return describeDeath(view, killedId, view.lastNight?.isShotByBodyguard ? SHOT : KILL);
}

/**
 * @param {PlayerView} view
 * @returns {string}
 */
function describeExecution(view) {
  const executedId = view.lastDay?.executedId;
  if (!executedId) return 'Ingen blev förvisad.';
  return describeDeath(view, executedId, EXECUTION);
}

/**
 * Namnet först och rollen i en egen mening, så att meningen blir lika
 * lätt att läsa oavsett om rollen redan är framvänd.
 * @param {PlayerView} view
 * @param {string} playerId
 * @param {string} whatHappened Till exempel "blev mördad av maffian".
 * @returns {string} Till exempel "Anna blev mördad av maffian. Anna var läkare."
 */
function describeDeath(view, playerId, whatHappened) {
  const player = view.players.find((p) => p.id === playerId);
  if (!player) return `Någon ${whatHappened}.`;
  const roleSentence = player.revealedRole ? ` ${player.name} var ${ROLE_INFO[player.revealedRole].name.toLowerCase()}.` : '';
  return `${player.name} ${whatHappened}.${roleSentence}`;
}
