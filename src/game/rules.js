// @ts-check
// Spelets regler som rena funktioner: tillstånd in, nytt tillstånd ut.
// Bara värden kör dem. Inget nätverk, ingen klocka och ingen DOM här.
import { MAX_PLAYERS, MIN_PLAYERS, shuffle, teamOf } from './roles.js';
import { DEFAULT_SETTINGS, buildRoleList, findSettingsProblem } from './settings.js';
import { sanitizeAvatar } from '../avatar/avatarParts.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Player} Player */
/** @typedef {import('./types.js').PlayerAction} PlayerAction */
/** @typedef {import('./types.js').Team} Team */

export const SKIP_VOTE = 'skip';
export const MAX_NAME_LENGTH = 20;

export class RuleError extends Error {}

/** @returns {GameState} */
export function createGame() {
  return {
    phase: 'lobby',
    round: 0,
    players: [],
    readyIds: [],
    nightChoices: {},
    nightDoneIds: [],
    dayVotes: {},
    lastNight: null,
    lastDay: null,
    investigations: {},
    lastDoctorTargetId: null,
    winner: null,
    settings: DEFAULT_SETTINGS,
  };
}

/**
 * @param {GameState} state
 * @param {{ id: string, name: string, avatar?: unknown }} newPlayer Avataren kommer från telefonen och kontrolleras här.
 * @returns {GameState}
 */
export function addPlayer(state, newPlayer) {
  if (state.phase !== 'lobby') throw new RuleError('Spelet har redan börjat.');
  if (state.players.length >= MAX_PLAYERS) throw new RuleError(`Rummet är fullt (max ${MAX_PLAYERS}).`);
  const name = newPlayer.name.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) throw new RuleError('Skriv ett namn.');
  const isNameTaken = state.players.some((p) => p.name.toLowerCase() === name.toLowerCase());
  if (isNameTaken) throw new RuleError('Namnet är redan taget.');
  /** @type {Player} */
  const player = { id: newPlayer.id, name, role: null, isAlive: true, isConnected: true, avatar: sanitizeAvatar(newPlayer.avatar) };
  return { ...state, players: [...state.players, player] };
}

/**
 * @param {GameState} state
 * @param {string} playerId
 * @returns {GameState}
 */
export function removePlayer(state, playerId) {
  if (state.phase !== 'lobby') throw new RuleError('Spelare kan bara tas bort i lobbyn.');
  return { ...state, players: state.players.filter((p) => p.id !== playerId) };
}

/**
 * @param {GameState} state
 * @param {string} playerId
 * @param {boolean} isConnected
 * @returns {GameState}
 */
export function setConnected(state, playerId, isConnected) {
  return updatePlayers(state, (p) => (p.id === playerId ? { ...p, isConnected } : p));
}

/**
 * @param {GameState} state
 * @param {() => number} random
 * @returns {GameState}
 */
export function startGame(state, random) {
  if (state.phase !== 'lobby' && state.phase !== 'gameOver') throw new RuleError('Spelet pågår redan.');
  if (state.players.length < MIN_PLAYERS) throw new RuleError(`Det behövs minst ${MIN_PLAYERS} spelare.`);
  const settingsProblem = findSettingsProblem(state.settings, state.players.length);
  if (settingsProblem) throw new RuleError(settingsProblem);
  const roles = shuffle(buildRoleList(state.settings, state.players.length), random);
  return {
    ...createGame(),
    settings: state.settings,
    phase: 'roleReveal',
    players: state.players.map((p, i) => ({ ...p, role: roles[i], isAlive: true })),
  };
}

/**
 * @param {GameState} state
 * @returns {GameState}
 */
export function returnToLobby(state) {
  return {
    ...createGame(),
    settings: state.settings,
    players: state.players.map((p) => ({ ...p, role: null, isAlive: true })),
  };
}

/**
 * @param {GameState} state
 * @param {Partial<import('./settings.js').GameSettings>} changes
 * @returns {GameState}
 */
export function changeSettings(state, changes) {
  if (state.phase !== 'lobby') throw new RuleError('Inställningarna kan bara ändras i lobbyn.');
  return { ...state, settings: { ...state.settings, ...changes } };
}

/**
 * @param {GameState} state
 * @param {string} playerId
 * @param {PlayerAction} action
 * @returns {GameState}
 */
export function applyAction(state, playerId, action) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new RuleError('Okänd spelare.');
  switch (action.type) {
    case 'ready':
      return markReady(state, player);
    case 'nightChoice':
      return chooseNightTarget(state, player, action.targetId);
    case 'nightDone':
      return confirmNight(state, player);
    case 'vote':
      return castVote(state, player, action.targetId);
    case 'setAvatar':
      return changeAvatar(state, player, action.avatar);
    default:
      throw new RuleError('Okänd handling.');
  }
}

/**
 * Avataren byts bara i lobbyn, så att ingen ändrar utseende mitt i spelet.
 * @param {GameState} state
 * @param {Player} player
 * @param {unknown} avatarInput
 * @returns {GameState}
 */
function changeAvatar(state, player, avatarInput) {
  if (state.phase !== 'lobby') throw new RuleError('Avataren kan bara ändras i lobbyn.');
  const avatar = sanitizeAvatar(avatarInput);
  if (!avatar) throw new RuleError('Avataren gick inte att läsa.');
  return updatePlayers(state, (p) => (p.id === player.id ? { ...p, avatar } : p));
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @returns {GameState}
 */
function markReady(state, player) {
  if (state.phase !== 'roleReveal') throw new RuleError('Det är inte dags att bli klar.');
  if (state.readyIds.includes(player.id)) return state;
  const readyIds = [...state.readyIds, player.id];
  const next = { ...state, readyIds };
  return readyIds.length === state.players.length ? beginNight(next, 1) : next;
}

/**
 * @param {GameState} state
 * @param {number} round
 * @returns {GameState}
 */
function beginNight(state, round) {
  return { ...state, phase: 'night', round, nightChoices: {}, nightDoneIds: [] };
}

/**
 * Alla levande väljer någon på natten, även medborgare, så att ingen
 * avslöjar sin roll genom att sitta still (projektets blindknapp).
 * @param {GameState} state
 * @param {Player} player
 * @returns {string[]} Id på spelare som får väljas.
 */
export function listNightTargets(state, player) {
  const living = state.players.filter((p) => p.isAlive);
  switch (player.role) {
    case 'mafia':
      return living.filter((p) => p.role !== 'mafia').map((p) => p.id);
    case 'doctor':
      return living.filter((p) => p.id !== state.lastDoctorTargetId).map((p) => p.id);
    default:
      return living.filter((p) => p.id !== player.id).map((p) => p.id);
  }
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @param {string} targetId
 * @returns {GameState}
 */
function chooseNightTarget(state, player, targetId) {
  assertLivingIn(state, player, 'night');
  if (!listNightTargets(state, player).includes(targetId)) throw new RuleError('Du kan inte välja den spelaren.');
  // Ändrar en maffia sitt val måste hela maffian bekräfta igen, eftersom
  // de bara får bekräfta när alla har valt samma offer.
  const undoneIds = player.role === 'mafia' ? livingMafia(state).map((p) => p.id) : [player.id];
  return {
    ...state,
    nightChoices: { ...state.nightChoices, [player.id]: targetId },
    nightDoneIds: state.nightDoneIds.filter((id) => !undoneIds.includes(id)),
  };
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @returns {boolean}
 */
export function canConfirmNight(state, player) {
  if (state.phase !== 'night' || !player.isAlive) return false;
  if (!state.nightChoices[player.id]) return false;
  if (player.role !== 'mafia') return true;
  const mafiaChoices = livingMafia(state).map((p) => state.nightChoices[p.id]);
  return mafiaChoices.every((choice) => choice === mafiaChoices[0]);
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @returns {GameState}
 */
function confirmNight(state, player) {
  assertLivingIn(state, player, 'night');
  if (!canConfirmNight(state, player)) {
    const reason = player.role === 'mafia' ? 'Maffian måste välja samma offer.' : 'Välj en spelare först.';
    throw new RuleError(reason);
  }
  if (state.nightDoneIds.includes(player.id)) return state;
  const next = { ...state, nightDoneIds: [...state.nightDoneIds, player.id] };
  const isEveryoneDone = livingPlayers(next).every((p) => next.nightDoneIds.includes(p.id));
  return isEveryoneDone ? resolveNight(next) : next;
}

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function resolveNight(state) {
  const mafiaTargetId = state.nightChoices[livingMafia(state)[0]?.id] ?? null;
  const doctor = livingPlayers(state).find((p) => p.role === 'doctor');
  const protectedId = doctor ? state.nightChoices[doctor.id] : null;
  const killedId = mafiaTargetId && mafiaTargetId !== protectedId ? mafiaTargetId : null;

  const investigations = { ...state.investigations };
  for (const detective of livingPlayers(state).filter((p) => p.role === 'detective')) {
    const targetId = state.nightChoices[detective.id];
    const target = state.players.find((p) => p.id === targetId);
    if (!target) continue;
    const result = { round: state.round, targetId, isMafia: target.role === 'mafia' };
    investigations[detective.id] = [...(investigations[detective.id] ?? []), result];
  }

  const afterKill = killPlayer({ ...state, investigations, lastDoctorTargetId: protectedId ?? null }, killedId);
  return withWinnerCheck({
    ...afterKill,
    phase: 'day',
    lastNight: { killedId, isRoleShown: false },
    dayVotes: {},
  });
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @param {string} targetId
 * @returns {GameState}
 */
function castVote(state, player, targetId) {
  assertLivingIn(state, player, 'day');
  const isValidTarget = targetId === SKIP_VOTE
    || livingPlayers(state).some((p) => p.id === targetId && p.id !== player.id);
  if (!isValidTarget) throw new RuleError('Du kan inte rösta på den spelaren.');
  const dayVotes = { ...state.dayVotes, [player.id]: targetId };
  const next = { ...state, dayVotes };
  const hasEveryoneVoted = livingPlayers(next).every((p) => dayVotes[p.id]);
  return hasEveryoneVoted ? resolveDay(next) : next;
}

/**
 * Den som får flest röster blir utvisad, om det är ensam flest och fler röster
 * än de som valde att avstå. Annars blir ingen utvisad.
 * @param {Record<string, string>} votes
 * @returns {string | null}
 */
export function findExecutedId(votes) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const targetId of Object.values(votes)) counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
  const skipCount = counts.get(SKIP_VOTE) ?? 0;
  counts.delete(SKIP_VOTE);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [top, runnerUp] = ranked;
  if (!top || top[1] <= skipCount) return null;
  if (runnerUp && runnerUp[1] === top[1]) return null;
  return top[0];
}

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function resolveDay(state) {
  const executedId = findExecutedId(state.dayVotes);
  return { ...killPlayer(state, executedId), phase: 'verdict', lastDay: { executedId, isRoleShown: false } };
}

/**
 * Värden avslutar domslutet när alla har hunnit se det.
 * @param {GameState} state
 * @returns {GameState}
 */
export function endVerdict(state) {
  if (state.phase !== 'verdict') throw new RuleError('Det finns inget domslut att avsluta.');
  const checked = withWinnerCheck(state);
  return checked.phase === 'gameOver' ? checked : beginNight(state, state.round + 1);
}

/**
 * @param {GameState} state
 * @returns {Team | null}
 */
export function findWinner(state) {
  const living = livingPlayers(state);
  const mafiaCount = living.filter((p) => teamOf(p.role) === 'mafia').length;
  if (mafiaCount === 0) return 'town';
  if (mafiaCount >= living.length - mafiaCount) return 'mafia';
  return null;
}

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function withWinnerCheck(state) {
  const winner = findWinner(state);
  return winner ? { ...state, phase: 'gameOver', winner } : state;
}

/**
 * @param {GameState} state
 * @param {string | null} playerId
 * @returns {GameState}
 */
function killPlayer(state, playerId) {
  if (!playerId) return state;
  return updatePlayers(state, (p) => (p.id === playerId ? { ...p, isAlive: false } : p));
}

/**
 * @param {GameState} state
 * @param {(player: Player) => Player} update
 * @returns {GameState}
 */
function updatePlayers(state, update) {
  return { ...state, players: state.players.map(update) };
}

/**
 * @param {GameState} state
 * @returns {Player[]}
 */
export function livingPlayers(state) {
  return state.players.filter((p) => p.isAlive);
}

/**
 * @param {GameState} state
 * @returns {Player[]}
 */
function livingMafia(state) {
  return livingPlayers(state).filter((p) => p.role === 'mafia');
}

/**
 * @param {GameState} state
 * @param {Player} player
 * @param {import('./types.js').Phase} phase
 */
function assertLivingIn(state, player, phase) {
  if (state.phase !== phase) throw new RuleError('Det är inte rätt fas för det.');
  if (!player.isAlive) throw new RuleError('Döda spelare kan inte göra något.');
}

