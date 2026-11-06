// @ts-check
// Spelets regler som rena funktioner: tillstånd in, nytt tillstånd ut.
// Bara värden kör dem. Inget nätverk, ingen klocka och ingen DOM här.
import { MAX_PLAYERS, MIN_PLAYERS, isMafia, shuffle } from './roles.js';
import { resolveNightChoices } from './night.js';
import { DEFAULT_SETTINGS, buildRoleList, findSettingsProblem } from './settings.js';
import { sanitizeAvatar } from '../avatar/avatarParts.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Player} Player */
/** @typedef {import('./types.js').PlayerAction} PlayerAction */
/** @typedef {import('./types.js').Team} Team */

export const SKIP_VOTE = 'skip';
export const MAX_NAME_LENGTH = 14;

export class RuleError extends Error {}

/** @returns {GameState} */
export function createGame() {
  return {
    phase: 'lobby',
    round: 0,
    players: [],
    readyIds: [],
    nightChoices: {},
    dayVotes: {},
    lastNight: null,
    lastDay: null,
    investigations: {},
    sightings: {},
    lastDoctorTargetId: null,
    winner: null,
    settings: DEFAULT_SETTINGS,
  };
}

/**
 * @param {GameState} state
 * @param {{ id: string, name: string, avatar?: unknown, isBot?: boolean }} newPlayer Avataren kommer från telefonen och kontrolleras här.
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
  const player = { id: newPlayer.id, name, role: null, isAlive: true, isConnected: true, isBot: Boolean(newPlayer.isBot), avatar: sanitizeAvatar(newPlayer.avatar) };
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
  return { ...state, phase: 'night', round, nightChoices: {} };
}

/**
 * Alla levande väljer någon på natten, även stadsbo, så att ingen
 * avslöjar sin roll genom att sitta still (projektets blindknapp).
 * @param {GameState} state
 * @param {Player} player
 * @returns {string[]} Id på spelare som får väljas.
 */
export function listNightTargets(state, player) {
  const living = state.players.filter((p) => p.isAlive);
  if (isMafia(player.role)) return living.filter((p) => !isMafia(p.role)).map((p) => p.id);
  switch (player.role) {
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
  const next = { ...state, nightChoices: { ...state.nightChoices, [player.id]: targetId } };
  return isNightSettled(next) ? resolveNight(next) : next;
}

/**
 * Natten tar slut när alla levande har valt och maffian har valt samma
 * person. Ett tryck är valet, utan bekräftelse, så fram till dess kan alla
 * trycka om och ändra sig (beslutat av ägaren 2026-11-04).
 * @param {GameState} state
 * @returns {boolean}
 */
export function isNightSettled(state) {
  if (state.phase !== 'night') return false;
  if (!livingPlayers(state).every((p) => state.nightChoices[p.id])) return false;
  return hasMafiaAgreed(state);
}

/**
 * @param {GameState} state
 * @returns {boolean}
 */
export function hasMafiaAgreed(state) {
  const mafiaChoices = livingMafia(state).map((p) => state.nightChoices[p.id]);
  return mafiaChoices.every((choice) => choice && choice === mafiaChoices[0]);
}

/**
 * @param {GameState} state
 * @returns {GameState}
 */
function resolveNight(state) {
  const { killedId, protectedId, silencedId, investigations, sightings } = resolveNightChoices(state);
  const afterKill = killPlayer({ ...state, investigations, sightings, lastDoctorTargetId: protectedId }, killedId);
  // Även när mordet avgör spelet blir det morgon först, så att alla får se
  // vem som blev mördad. Se endDecidedMorning i deathReveal.js.
  return { ...afterKill, phase: 'day', lastNight: silencedId ? { killedId, silencedId } : { killedId }, dayVotes: {} };
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
  // En avgjord morgon slutar av sig själv, så rösterna räknas inte då.
  return hasEveryoneVoted && !findWinner(next) ? resolveDay(next) : next;
}

/**
 * Borgmästarens röst räknas två gånger. Alla får veta det när borgmästaren
 * har röstat, eftersom omröstningen är öppen (Jonas 2026-11-06).
 * @param {GameState} state
 * @returns {string[]}
 */
export function listDoubleVoterIds(state) {
  return state.players.filter((p) => p.role === 'mayor' && state.dayVotes[p.id]).map((p) => p.id);
}

/**
 * Den som får flest röster blir förvisad, om det är ensam flest och fler röster
 * än de som valde att avstå. Annars blir ingen förvisad.
 * @param {Record<string, string>} votes
 * @param {string[]} [doubleVoterIds] Väljare vars röst räknas två gånger.
 * @returns {string | null}
 */
export function findExecutedId(votes, doubleVoterIds = []) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const [voterId, targetId] of Object.entries(votes)) {
    const weight = doubleVoterIds.includes(voterId) ? 2 : 1;
    counts.set(targetId, (counts.get(targetId) ?? 0) + weight);
  }
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
  const executedId = findExecutedId(state.dayVotes, listDoubleVoterIds(state));
  return { ...killPlayer(state, executedId), phase: 'verdict', lastDay: { executedId, isRoleShown: false } };
}

/**
 * Värden avslutar domslutet när alla har hunnit se det.
 * @param {GameState} state
 * @returns {GameState}
 */
export function endVerdict(state) {
  if (state.phase !== 'verdict') throw new RuleError('Det finns inget domslut att avsluta.');
  const executed = state.players.find((p) => p.id === state.lastDay?.executedId);
  // Galningen vinner ensam när staden förvisar honom, och då är spelet slut.
  if (executed?.role === 'madman') return { ...state, phase: 'gameOver', winner: 'madman' };
  const checked = withWinnerCheck(state);
  return checked.phase === 'gameOver' ? checked : beginNight(state, state.round + 1);
}

/**
 * Bara maffian själv räknas, inte bartendern som håller på den, och
 * galningen räknas som en av de andra.
 * @param {GameState} state
 * @returns {Team | null}
 */
export function findWinner(state) {
  const living = livingPlayers(state);
  const mafiaCount = living.filter((p) => isMafia(p.role)).length;
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
  return livingPlayers(state).filter((p) => isMafia(p.role));
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

