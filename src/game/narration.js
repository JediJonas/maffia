// @ts-check
// Berättarens repliker vid fasbyten. De visas på alla skärmar och läses upp
// högt av värdens telefon, så de får bara bygga på det som alla redan får veta.
import { ROLE_INFO } from './roles.js';

/** @typedef {import('./playerView.js').PlayerView} PlayerView */

// Rutan säger hela meningen, rösten den korta (se Ord vi använder i docs/regler.md).
const WRITTEN_KILL = 'blev mördad av maffian';
const SPOKEN_KILL = 'blev mördad';
const WRITTEN_EXECUTION = 'blev utvisad ur staden';
const SPOKEN_EXECUTION = 'blev utvisad';

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
      return `Staden vaknar. ${describeKill(next)} Diskutera och rösta om vem som ska utvisas.`;
    case 'verdict':
      return `Alla har röstat. ${describeExecution(next)}`;
    case 'gameOver':
      return `Spelet är slut. ${next.winner === 'mafia' ? 'Maffian har tagit över staden.' : 'Staden har besegrat maffian.'}`;
    default:
      return null;
  }
}

/**
 * Det som värdens telefon läser upp: en kortare version av rutan överst vid
 * varje fasbyte, och rollen när nedräkningen är slut. Rösten säger bara det
 * viktigaste, eftersom instruktionerna redan står på skärmen. När rösten
 * slås på i lobbyn hörs ett prov, så att värden vet att ljudet fungerar.
 * @param {PlayerView | null} previous Null när sidan just har öppnats, då inget läses upp.
 * @param {PlayerView} next
 * @returns {string | null}
 */
export function narrateAloud(previous, next) {
  if (!previous) return null;
  const isNewPhase = previous.phase !== next.phase || previous.round !== next.round;
  if (!isNewPhase) {
    if (!previous.settings.hasNarratorVoice && next.settings.hasNarratorVoice) return 'Berättarrösten är på.';
    return previous.isRoleRevealPending && !next.isRoleRevealPending ? describeShownRole(next) : null;
  }
  switch (next.phase) {
    case 'roleReveal':
      return 'Spelet börjar. Titta på din roll.';
    case 'night':
      return 'Natten faller. Gör ditt val.';
    case 'day':
      return `Staden vaknar. ${describeKill(next, SPOKEN_KILL)}`;
    case 'verdict':
      return `Alla har röstat. ${describeExecution(next, SPOKEN_EXECUTION)}`;
    case 'gameOver':
      return `Spelet är slut. ${next.winner === 'mafia' ? 'Maffian har tagit över.' : 'Staden har vunnit.'}`;
    default:
      return null;
  }
}

/**
 * @param {PlayerView} view
 * @returns {string | null} Till exempel "Anna var läkare."
 */
function describeShownRole(view) {
  const deadId = view.phase === 'day' ? view.lastNight?.killedId : view.lastDay?.executedId;
  const player = view.players.find((p) => p.id === deadId);
  if (!player?.revealedRole) return null;
  return `${player.name} var ${ROLE_INFO[player.revealedRole].name.toLowerCase()}.`;
}

/**
 * @param {PlayerView} view
 * @param {string} [whatHappened]
 * @returns {string}
 */
function describeKill(view, whatHappened = WRITTEN_KILL) {
  const killedId = view.lastNight?.killedId;
  if (!killedId) return 'Ingen blev mördad.';
  return describeDeath(view, killedId, whatHappened);
}

/**
 * @param {PlayerView} view
 * @param {string} [whatHappened]
 * @returns {string}
 */
function describeExecution(view, whatHappened = WRITTEN_EXECUTION) {
  const executedId = view.lastDay?.executedId;
  if (!executedId) return 'Ingen blev utvisad.';
  return describeDeath(view, executedId, whatHappened);
}

/**
 * Namnet först och rollen i en egen mening, så att meningen blir lika
 * lätt att läsa och höra oavsett om rollen redan är framvänd.
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
