// @ts-check
// Utan I, O och siffror, så att koden inte går att läsa fel högt i ett rum.
const ROOM_CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const ROOM_CODE_LENGTH = 4;

// PeerJS publika server delar id mellan alla appar, så ett prefix minskar
// risken att krocka med någon annans rum.
const PEER_ID_PREFIX = 'maffia-spel-';

/**
 * @param {() => number} random
 * @returns {string}
 */
export function generateRoomCode(random) {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_LETTERS[Math.floor(random() * ROOM_CODE_LETTERS.length)];
  }
  return code;
}

/**
 * @param {string} input Det spelaren skrev, kanske med gemener och mellanslag.
 * @returns {string | null} Null om det inte kan vara en rumskod.
 */
export function normalizeRoomCode(input) {
  const code = input.trim().toUpperCase();
  const isValid = code.length === ROOM_CODE_LENGTH && [...code].every((c) => ROOM_CODE_LETTERS.includes(c));
  return isValid ? code : null;
}

/**
 * @param {string} roomCode
 * @returns {string}
 */
export function toPeerId(roomCode) {
  return `${PEER_ID_PREFIX}${roomCode}`;
}

/**
 * @param {string} roomCode
 * @param {string} pageUrl Sidans adress, oftast location.href.
 * @returns {string} Adressen som QR-koden pekar på.
 */
export function buildJoinUrl(roomCode, pageUrl) {
  const url = new URL(pageUrl);
  url.search = '';
  url.hash = '';
  url.searchParams.set('rum', roomCode);
  return url.toString();
}

/**
 * @param {string} pageUrl
 * @returns {string | null}
 */
export function readRoomCodeFromUrl(pageUrl) {
  const code = new URL(pageUrl).searchParams.get('rum');
  return code ? normalizeRoomCode(code) : null;
}

