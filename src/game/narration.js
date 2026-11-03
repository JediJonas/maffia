// @ts-check
// Berättarens repliker vid fasbyten. De visas på alla skärmar och läses upp
// högt av värdens telefon, så de får bara bygga på det som alla redan får veta.
import { ROLE_INFO } from './roles.js';

/** @typedef {import('./playerView.js').PlayerView} PlayerView */

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
 * Det som värdens telefon läser upp: vem som blev mördad eller utvisad och, när nedräkningen är
 * slut, vilken roll den hade. Kortare än texten på skärmen, så att rollen
 * kommer direkt efter namnet och inte efter uppmaningen att rösta. När
 * rösten slås på i lobbyn hörs ett prov, så att värden vet att ljudet fungerar.
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
    case 'day':
      return `Staden vaknar. ${describeKill(next)}`;
    case 'verdict':
      return describeExecution(next);
    case 'gameOver':
      return narratePhaseChange(previous, next);
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
 * @returns {string}
 */
function describeKill(view) {
  const killedId = view.lastNight?.killedId;
  if (!killedId) return 'Ingen blev mördad.';
  return describeDeath(view, killedId, 'blev mördad av maffian');
}

/**
 * @param {PlayerView} view
 * @returns {string}
 */
function describeExecution(view) {
  const executedId = view.lastDay?.executedId;
  if (!executedId) return 'Ingen blev utvisad.';
  return describeDeath(view, executedId, 'blev utvisad ur staden');
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
