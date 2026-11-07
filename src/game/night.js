// @ts-check
// Vad som händer när natten är slut: vem som dör, vad detektiven,
// taxichauffören och fönstertittaren får veta och vem som fick korven.
// Alla val sker samtidigt, så ordningen spelar ingen roll, utom att
// bartenderns drink gäller före allt annat.
import { isMafia } from './roles.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Player} Player */
/** @typedef {import('./types.js').Role} Role */

/**
 * Roller vars val betyder att de går hem till någon. Taxichauffören och
 * fönstertittaren tittar på avstånd, och de som väljer blint stannar hemma,
 * så ingen av dem syns för de andra (Jonas 2026-11-06).
 * @type {Role[]}
 */
const VISITING_ROLES = ['mafia', 'godfather', 'doctor', 'detective', 'bartender', 'sausageVendor'];

/**
 * @typedef {object} NightResult
 * @property {string | null} killedId
 * @property {string | null} protectedId Vem läkaren skyddade, även när bartendern stoppade skyddet, så att läkaren inte kan välja samma igen.
 * @property {string | null} silencedId
 * @property {Record<string, import('./types.js').Investigation[]>} investigations
 * @property {Record<string, import('./types.js').Sighting[]>} sightings
 */

/**
 * @param {GameState} state En natt där alla levande har valt.
 * @returns {NightResult}
 */
export function resolveNightChoices(state) {
  const living = state.players.filter((p) => p.isAlive);
  const choiceOf = (/** @type {Player | undefined} */ player) => (player ? state.nightChoices[player.id] ?? null : null);
  const withRole = (/** @type {Role} */ role) => living.filter((p) => p.role === role);

  // Bartenderns drink gör att personen misslyckas med sin uppgift, utan att märka det.
  const blockedIds = new Set(withRole('bartender').map(choiceOf).filter((id) => id !== null));
  const isActive = (/** @type {Player} */ player) => !blockedIds.has(player.id);

  // Maffian väljer tillsammans, så en drink till vem som helst av dem stoppar
  // mordet (Jonas 2026-11-06). Bartendern vet inte vilka de är och kan
  // alltså råka stoppa sitt eget lag.
  const mafia = living.filter((p) => isMafia(p.role));
  const mafiaTargetId = mafia.every(isActive) ? choiceOf(mafia[0]) : null;
  const doctor = withRole('doctor')[0];
  const protectedId = choiceOf(doctor);
  const isSaved = Boolean(doctor && isActive(doctor) && protectedId === mafiaTargetId);
  const killedId = mafiaTargetId && !isSaved ? mafiaTargetId : null;

  const investigations = { ...state.investigations };
  for (const detective of withRole('detective')) {
    const target = state.players.find((p) => p.id === choiceOf(detective));
    if (!target) continue;
    const result = { round: state.round, targetId: target.id, isMafia: isActive(detective) && target.role === 'mafia' };
    investigations[detective.id] = [...(investigations[detective.id] ?? []), result];
  }

  const visits = living
    .filter((p) => p.role && VISITING_ROLES.includes(p.role) && choiceOf(p))
    .map((p) => ({ visitorId: p.id, targetId: /** @type {string} */ (choiceOf(p)) }));
  const sightings = { ...(state.sightings ?? {}) };
  for (const watcher of [...withRole('taxiDriver'), ...withRole('windowWatcher')]) {
    const targetId = choiceOf(watcher);
    if (!targetId) continue;
    const seenIds = !isActive(watcher) ? []
      : watcher.role === 'taxiDriver'
        ? visits.filter((v) => v.visitorId === targetId).map((v) => v.targetId)
        : visits.filter((v) => v.targetId === targetId).map((v) => v.visitorId);
    sightings[watcher.id] = [...(sightings[watcher.id] ?? []), { round: state.round, targetId, seenIds }];
  }

  const sausageVendor = withRole('sausageVendor')[0];
  const sausageTargetId = sausageVendor && isActive(sausageVendor) ? choiceOf(sausageVendor) : null;
  const silencedId = sausageTargetId && sausageTargetId !== killedId ? sausageTargetId : null;

  return { killedId, protectedId, silencedId, investigations, sightings };
}
