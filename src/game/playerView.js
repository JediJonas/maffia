// @ts-check
// Det enda som skickas till en telefon. Varje fält här är något just den
// spelaren får veta, så att ingen kan läsa andras roller i nätverkstrafiken.
import { hasMafiaAgreed, listDoubleVoterIds, listNightTargets } from './rules.js';
import { isMafia as isMafiaRole } from './roles.js';
import { findHiddenDeathId } from './deathReveal.js';
import { resolveRoleImageVariant } from '../scenes/roleImageChoice.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Role} Role */

/**
 * @typedef {object} PublicPlayer
 * @property {string} id
 * @property {string} name
 * @property {boolean} isAlive
 * @property {boolean} isConnected
 * @property {boolean} isBot Alla får veta vilka som är botar, eftersom botar inte kan prata.
 * @property {import('../avatar/avatarParts.js').Avatar | null} avatar
 * @property {Role | null} revealedRole För döda spelare om inställningen tillåter det, och för alla när spelet är slut.
 */

/**
 * @typedef {object} PlayerView
 * @property {import('./types.js').Phase} phase
 * @property {number} round
 * @property {{ id: string, name: string, role: Role | null, isAlive: boolean }} me
 * @property {PublicPlayer[]} players
 * @property {number} readyCount
 * @property {boolean} isReady
 * @property {string[]} nightTargetIds Vem jag får välja i natt.
 * @property {string | null} myNightChoice
 * @property {number} nightChosenCount Antal som har valt, men inte vilka, så att ordningen inte avslöjar någon.
 * @property {boolean | null} hasMafiaAgreed Om maffian har valt samma person. Null för alla utom maffian.
 * @property {number} livingCount
 * @property {{ id: string, role: Role | null, choiceId: string | null }[]} mafiaTeam Tom för alla utom maffian.
 * @property {import('./types.js').Investigation[]} investigations Tom för alla utom detektiven.
 * @property {import('./types.js').Sighting[]} sightings Tom för alla utom taxichauffören och fönstertittaren.
 * @property {string[]} doubleVoterIds Borgmästaren, när den har röstat. Rösten räknas två gånger och syns för alla.
 * @property {Record<string, string>} dayVotes Omröstningen är öppen, som i klassisk maffia.
 * @property {import('./settings.js').GameSettings} settings Alla får se inställningarna.
 * @property {boolean} isRoleRevealPending Sant i domslutet medan nedräkningen till den dödas roll pågår.
 * @property {import('./types.js').NightOutcome | null} lastNight
 * @property {import('./types.js').DayOutcome | null} lastDay
 * @property {import('./types.js').Team | null} winner
 * @property {import('../scenes/roleImageChoice.js').RoleImageVariant | null} killedImageVariant Rollbilden som den som mördades i natt valt, för mordbilden. Null när ingen dog.
 * @property {import('../scenes/roleImageChoice.js').RoleImageVariant | null} executedImageVariant Rollbilden som den som förvisades i dag valt, för dombilden. Null när ingen förvisades.
 * @property {import('../scenes/roleImageChoice.js').RoleImageVariant | null} madmanImageVariant Galningens rollbild när galningen har vunnit, annars null.
 */

/**
 * @param {GameState} state
 * @param {string} playerId
 * @returns {PlayerView}
 */
export function buildPlayerView(state, playerId) {
  const me = state.players.find((p) => p.id === playerId);
  if (!me) throw new Error(`Okänd spelare ${playerId}`);
  const isGameOver = state.phase === 'gameOver';
  const isNight = state.phase === 'night';
  const isVoting = state.phase === 'day' || state.phase === 'verdict';
  const isMafia = isMafiaRole(me.role);
  const hiddenDeathId = findHiddenDeathId(state);
  const canSeeRoleOf = (/** @type {import('./types.js').Player} */ p) =>
    isGameOver || (!p.isAlive && state.settings.revealsRoleOnDeath && p.id !== hiddenDeathId);

  return {
    phase: state.phase,
    round: state.round,
    me: { id: me.id, name: me.name, role: me.role, isAlive: me.isAlive },
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      isConnected: p.isConnected,
      isBot: Boolean(p.isBot),
      avatar: p.avatar ?? null,
      revealedRole: canSeeRoleOf(p) ? p.role : null,
    })),
    readyCount: state.readyIds.length,
    isReady: state.readyIds.includes(me.id),
    nightTargetIds: isNight && me.isAlive ? listNightTargets(state, me) : [],
    myNightChoice: isNight ? state.nightChoices[me.id] ?? null : null,
    nightChosenCount: isNight ? state.players.filter((p) => p.isAlive && state.nightChoices[p.id]).length : 0,
    hasMafiaAgreed: isNight && isMafia ? hasMafiaAgreed(state) : null,
    livingCount: state.players.filter((p) => p.isAlive).length,
    mafiaTeam: isMafia
      ? state.players
        .filter((p) => isMafiaRole(p.role) && p.id !== me.id)
        .map((p) => ({ id: p.id, role: p.role, choiceId: isNight ? state.nightChoices[p.id] ?? null : null }))
      : [],
    investigations: state.investigations[me.id] ?? [],
    sightings: state.sightings?.[me.id] ?? [],
    dayVotes: isVoting ? state.dayVotes : {},
    doubleVoterIds: isVoting ? listDoubleVoterIds(state) : [],
    lastNight: state.lastNight,
    lastDay: state.lastDay,
    winner: state.winner,
    killedImageVariant: findImageVariant(state, state.lastNight?.killedId),
    executedImageVariant: findImageVariant(state, state.lastDay?.executedId),
    madmanImageVariant: state.winner === 'madman' ? findMadmanImageVariant(state) : null,
    settings: state.settings,
    isRoleRevealPending: Boolean(hiddenDeathId),
  };
}

/**
 * Rollbilden som en mördad eller förvisad spelare valt. En bot eller en
 * telefon som inte hann skicka sin får en som bestäms av spelarens id, så
 * att alla ändå ser samma.
 * @param {GameState} state
 * @param {string | null | undefined} playerId
 * @returns {import('../scenes/roleImageChoice.js').RoleImageVariant | null}
 */
function findImageVariant(state, playerId) {
  if (!playerId) return null;
  const player = state.players.find((p) => p.id === playerId);
  return player?.roleImageVariant ?? resolveRoleImageVariant({ choice: 'random', savedRoll: null, gameKey: playerId });
}

/**
 * @param {GameState} state
 * @returns {import('../scenes/roleImageChoice.js').RoleImageVariant}
 */
function findMadmanImageVariant(state) {
  return findImageVariant(state, state.players.find((p) => p.role === 'madman')?.id) ?? 'man';
}
