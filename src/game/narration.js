// @ts-check
// Berättarens repliker vid fasbyten. De visas på alla skärmar och ska senare
// kunna läsas upp högt, så de får bara bygga på det som alla redan får veta.
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
      return `Staden vaknar. ${describeKill(next)} Diskutera och rösta om vem som ska ut.`;
    case 'verdict':
      return `Alla har röstat. ${describeExecution(next)}`;
    case 'gameOver':
      return [
        previous?.phase === 'night' ? `Staden vaknar. ${describeKill(next)}` : null,
        next.winner === 'mafia' ? 'Maffian har tagit över staden.' : 'Staden har besegrat maffian.',
      ].filter(Boolean).join(' ');
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
  if (!killedId) return 'Ingen dog i natt.';
  return `I natt dog ${describePlayer(view, killedId)}.`;
}

/**
 * @param {PlayerView} view
 * @returns {string}
 */
function describeExecution(view) {
  const executedId = view.lastDay?.executedId;
  if (!executedId) return 'Ingen röstades ut i dag.';
  return `Staden röstade ut ${describePlayer(view, executedId)}.`;
}

/**
 * @param {PlayerView} view
 * @param {string} playerId
 * @returns {string}
 */
function describePlayer(view, playerId) {
  const player = view.players.find((p) => p.id === playerId);
  if (!player) return 'någon';
  const role = player.revealedRole ? ROLE_INFO[player.revealedRole].name.toLowerCase() : null;
  return role ? `${player.name}, som var ${role}` : player.name;
}
