// @ts-check
// Det enda som skickas till en telefon. Varje fält här är något just den
// spelaren får veta, så att ingen kan läsa andras roller i nätverkstrafiken.
import { canConfirmNight, listNightTargets } from './rules.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Role} Role */

/**
 * @typedef {object} PublicPlayer
 * @property {string} id
 * @property {string} name
 * @property {boolean} isAlive
 * @property {boolean} isConnected
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
 * @property {boolean} isNightDone
 * @property {boolean} canConfirmNight
 * @property {number} nightDoneCount Antal klara, men inte vilka, så att ordningen inte avslöjar någon.
 * @property {number} livingCount
 * @property {{ id: string, choiceId: string | null }[]} mafiaTeam Tom för alla utom maffian.
 * @property {import('./types.js').Investigation[]} investigations Tom för alla utom detektiven.
 * @property {Record<string, string>} dayVotes Omröstningen är öppen, som i klassisk maffia.
 * @property {import('./settings.js').GameSettings} settings Alla får se inställningarna.
 * @property {boolean} canShowVerdictRole Sant under domslutet tills värden har vänt fram rollen.
 * @property {import('./types.js').NightOutcome | null} lastNight
 * @property {import('./types.js').DayOutcome | null} lastDay
 * @property {import('./types.js').Team | null} winner
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
  const isMafia = me.role === 'mafia';
  const hiddenVerdictId = state.phase === 'verdict' && !state.lastDay?.isRoleShown ? state.lastDay?.executedId : null;
  const canSeeRoleOf = (/** @type {import('./types.js').Player} */ p) =>
    isGameOver || (!p.isAlive && state.settings.revealsRoleOnDeath && p.id !== hiddenVerdictId);

  return {
    phase: state.phase,
    round: state.round,
    me: { id: me.id, name: me.name, role: me.role, isAlive: me.isAlive },
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      isConnected: p.isConnected,
      revealedRole: canSeeRoleOf(p) ? p.role : null,
    })),
    readyCount: state.readyIds.length,
    isReady: state.readyIds.includes(me.id),
    nightTargetIds: isNight && me.isAlive ? listNightTargets(state, me) : [],
    myNightChoice: isNight ? state.nightChoices[me.id] ?? null : null,
    isNightDone: state.nightDoneIds.includes(me.id),
    canConfirmNight: canConfirmNight(state, me),
    nightDoneCount: state.nightDoneIds.length,
    livingCount: state.players.filter((p) => p.isAlive).length,
    mafiaTeam: isMafia
      ? state.players
        .filter((p) => p.role === 'mafia' && p.id !== me.id)
        .map((p) => ({ id: p.id, choiceId: isNight ? state.nightChoices[p.id] ?? null : null }))
      : [],
    investigations: state.investigations[me.id] ?? [],
    dayVotes: state.phase === 'day' || state.phase === 'verdict' ? state.dayVotes : {},
    lastNight: state.lastNight,
    lastDay: state.lastDay,
    winner: state.winner,
    settings: state.settings,
    canShowVerdictRole: Boolean(hiddenVerdictId) && state.settings.revealsRoleOnDeath,
  };
}
