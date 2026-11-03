// @ts-check
// Sparas i telefonen så att en spelare som laddar om sidan, eller värden som
// tappar sin flik, kommer tillbaka till samma spel.
import { createRandomAvatar, sanitizeAvatar } from '../avatar/avatarParts.js';
import { MAX_NAME_LENGTH } from '../game/rules.js';

const SESSION_KEY = 'maffia.session';
const HOST_GAME_KEY_PREFIX = 'maffia.hostGame.';
// Avataren hör till telefonen och följer med till nästa spel.
const AVATAR_KEY = 'maffia.avatar';
// Namnet följer också med, så att man slipper skriva det varje gång.
const NAME_KEY = 'maffia.name';

/** @typedef {import('../avatar/avatarParts.js').Avatar} Avatar */

/**
 * Avataren saknas i sessioner som sparades innan avatarerna fanns.
 * @typedef {{ kind: 'host', roomCode: string, name: string, avatar?: Avatar }
 *   | { kind: 'player', roomCode: string, name: string, secret: string, avatar?: Avatar }} SavedSession
 */

/**
 * Det värden behöver för att ta upp spelet igen. Hemligheterna kopplar varje
 * telefon till sin spelare, och skickas aldrig vidare till andra.
 * @typedef {object} SavedHostGame
 * @property {import('../game/types.js').GameState} state
 * @property {Record<string, string>} playerIdsBySecret
 * @property {string} hostPlayerId
 */

/** @returns {SavedSession | null} */
export function loadSession() {
  return readJson(SESSION_KEY);
}

/** @param {SavedSession | null} session */
export function saveSession(session) {
  writeJson(SESSION_KEY, session);
}

/**
 * Slumpar en avatar första gången, så att alla har en utan att behöva välja.
 * @returns {Avatar}
 */
export function loadOrCreateAvatar() {
  const saved = sanitizeAvatar(readJson(AVATAR_KEY));
  if (saved) return saved;
  const avatar = createRandomAvatar(Math.random);
  saveAvatar(avatar);
  return avatar;
}

/** @param {Avatar} avatar */
export function saveAvatar(avatar) {
  writeJson(AVATAR_KEY, avatar);
}

/** @returns {string} Tom sträng när inget namn är sparat. */
export function loadSavedName() {
  const saved = readJson(NAME_KEY);
  return typeof saved === 'string' ? saved.slice(0, MAX_NAME_LENGTH) : '';
}

/** @param {string} name */
export function saveName(name) {
  writeJson(NAME_KEY, name);
}

/**
 * @param {string} roomCode
 * @returns {SavedHostGame | null}
 */
export function loadHostGame(roomCode) {
  return readJson(HOST_GAME_KEY_PREFIX + roomCode);
}

/**
 * @param {string} roomCode
 * @param {SavedHostGame | null} game
 */
export function saveHostGame(roomCode, game) {
  writeJson(HOST_GAME_KEY_PREFIX + roomCode, game);
}

/** @returns {string} Slumpad med kryptografisk slump, som finns även utan https. */
export function createSecret() {
  const SECRET_BYTES = 16;
  const HEX = 16;
  const bytes = crypto.getRandomValues(new Uint8Array(SECRET_BYTES));
  return [...bytes].map((b) => b.toString(HEX).padStart(2, '0')).join('');
}

/**
 * @template T
 * @param {string} key
 * @returns {T | null}
 */
function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
function writeJson(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Privat läge kan sakna lagring. Då går det inte att återansluta efter omladdning.
  }
}
