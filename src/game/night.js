// @ts-check
// Vad som händer när natten är slut: vem som dör, vad detektiven,
// taxichauffören och fönstertittaren får veta och vem som fick korven.
// Alla val sker samtidigt, så ordningen spelar ingen roll, utom att
// bartenderns drink gäller före allt annat och att livvaktens strid avgör
// vem maffians mord drabbar innan läkarens skydd prövas.
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
const VISITING_ROLES = ['mafia', 'godfather', 'doctor', 'bodyguard', 'lawyer', 'detective', 'bartender', 'sausageVendor'];

/**
 * @typedef {object} NightResult
 * @property {string | null} killedId
 * @property {string | null} protectedId Vem läkaren skyddade, även när bartendern stoppade skyddet, så att läkaren inte kan välja samma igen.
 * @property {string | null} guardedId Vem livvakten skyddade, även när bartendern stoppade skyddet, så att livvakten inte kan välja samma igen.
 * @property {string | null} clientId Vem advokaten valde, även när bartendern stoppade försvaret, så att advokaten inte kan välja samma igen.
 * @property {string | null} defendedClientId Klienten som advokaten försvarar i dag. Null när advokaten fick en drink eller blev mördad.
 * @property {string | null} silencedId
 * @property {Record<string, import('./types.js').Investigation[]>} investigations
 * @property {Record<string, import('./types.js').Sighting[]>} sightings
 */

/**
 * @param {GameState} state En natt där alla levande har valt.
 * @param {() => number} random Ett tal från 0 till 1, som Math.random. Avgör livvaktens strid.
 * @returns {NightResult}
 */
export function resolveNightChoices(state, random) {
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
  const bodyguard = withRole('bodyguard')[0];
  const guardedId = choiceOf(bodyguard);
  const isFight = Boolean(bodyguard && isActive(bodyguard) && mafiaTargetId && guardedId === mafiaTargetId);
  const attackedId = isFight && bodyguard ? fightBodyguard(bodyguard, mafia, random) : mafiaTargetId;
  // Den som läkaren skyddar överlever natten, även efter livvaktens strid (Jonas 2026-11-13).
  const doctor = withRole('doctor')[0];
  const protectedId = choiceOf(doctor);
  const isSaved = Boolean(doctor && isActive(doctor) && protectedId === attackedId);
  const killedId = attackedId && !isSaved ? attackedId : null;

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

  // Advokaten försvarar sin klient nästa dag, om advokaten lever och inte
  // fick bartenderns drink (Jonas 2026-11-13).
  const lawyer = withRole('lawyer')[0];
  const clientId = choiceOf(lawyer);
  const canDefend = Boolean(lawyer && isActive(lawyer) && lawyer.id !== killedId && clientId !== killedId);
  const defendedClientId = canDefend ? clientId : null;

  return { killedId, protectedId, guardedId, clientId, defendedClientId, silencedId, investigations, sightings };
}

/** Hälften av gångerna vinner livvakten striden (Jonas 2026-11-13). */
const BODYGUARD_WIN_CHANCE = 0.5;

/**
 * Kommer maffian hem till den som livvakten skyddar överlever personen, och
 * livvakten och maffian slåss. Vinner livvakten blir en i maffian mördad,
 * lottad bland dem, eftersom maffian väljer offer tillsammans. Annars blir
 * livvakten mördad i stället. Morgonen säger bara vem som blev mördad, så
 * ingen får veta hur det gick till (Jonas 2026-11-13).
 * @param {Player} bodyguard
 * @param {Player[]} mafia Den levande maffian.
 * @param {() => number} random
 * @returns {string} Id på den som dör, om inte läkaren räddar den.
 */
function fightBodyguard(bodyguard, mafia, random) {
  if (random() >= BODYGUARD_WIN_CHANCE) return bodyguard.id;
  return mafia[Math.min(Math.floor(random() * mafia.length), mafia.length - 1)].id;
}
