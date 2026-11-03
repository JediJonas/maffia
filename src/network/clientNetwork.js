// @ts-check
// Spelarens sida av nätverket. Håller förbindelsen till värden vid liv och
// ansluter igen av sig själv när telefonen har låsts eller tappat nätet.
import Peer from 'peerjs';
import { CONNECTION_TIMEOUT_MS, HEARTBEAT_INTERVAL_MS } from './messages.js';
import { readPeerOptions } from './peerServer.js';
import { toPeerId } from './roomCode.js';

/** @typedef {import('./messages.js').ClientMessage} ClientMessage */
/** @typedef {import('./messages.js').HostMessage} HostMessage */
/** @typedef {'connecting' | 'open' | 'reconnecting' | 'noServer' | 'unreachable'} ClientStatus */

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10000;
// Så många försök utan svar innan vi säger att rummet inte finns. Med
// växande väntan blir det ungefär en kvarts minut, så att en värd som
// laddar om hinner tillbaka.
const ROOM_MISSING_ATTEMPTS = 3;
// Hittar telefonerna ingen väg till varandra (ICE) blir förbindelsen ibland
// hängande utan fel, så ett försök som inte har öppnats räknas som misslyckat.
const OPEN_TIMEOUT_MS = 10000;

/**
 * @typedef {object} ClientOptions
 * @property {string} roomCode
 * @property {string} name
 * @property {string} secret
 * @property {import('../avatar/avatarParts.js').Avatar | undefined} avatar Värden använder den bara första gången telefonen går med.
 * @property {(message: HostMessage) => void} onMessage
 * @property {(status: ClientStatus) => void} onStatus
 * @property {() => void} onRoomMissing Värden har aldrig svarat, till exempel för att rummet är gammalt.
 */

/**
 * @param {ClientOptions} options
 * @returns {{ sendAction: (action: import('../game/types.js').PlayerAction) => void, close: () => void }}
 */
export function openClientNetwork({ roomCode, name, secret, avatar, onMessage, onStatus, onRoomMissing }) {
  /** @type {Peer | null} */
  let peer = null;
  /** @type {import('peerjs').DataConnection | null} */
  let connection = null;
  let hasReachedHost = false;
  let missingRoomCount = 0;
  /** @type {number | null} När den ping skickades som värden inte har svarat på än. */
  let unansweredPingSince = null;
  let retryMs = FIRST_RETRY_MS;
  let isClosed = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let retryTimer;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let attemptTimer;
  // En förbindelse kan se öppen ut fast värden har försvunnit, till exempel
  // när värden laddar om. Handlingar sparas därför tills värden har bekräftat
  // dem och skickas igen efter återanslutning. Alla tål att komma två gånger.
  /** @type {Extract<ClientMessage, { type: 'action' }>[]} */
  let unansweredActions = [];
  let nextActionId = 1;

  // Varje försök börjar med en ny Peer, som en omladdning av sidan. En gammal
  // Peer kan ha en död förbindelse till PeerJS-servern utan att märka det, och
  // då kommer inget svar alls. Samma lösning som i Låtquiz.
  function startAttempt() {
    clearTimeout(retryTimer);
    if (isClosed) return;
    closeAttempt();
    const attemptPeer = new Peer(readPeerOptions());
    peer = attemptPeer;
    let hasReachedServer = false;
    attemptPeer.on('open', () => {
      if (peer !== attemptPeer) return;
      hasReachedServer = true;
      openConnection(attemptPeer);
    });
    attemptPeer.on('error', (error) => {
      if (peer !== attemptPeer) return;
      if (error.type === 'peer-unavailable') {
        missingRoomCount++;
        if (!hasReachedHost && missingRoomCount >= ROOM_MISSING_ATTEMPTS) {
          closeAttempt();
          onRoomMissing();
        } else {
          retry('reconnecting');
        }
        return;
      }
      // Fel mot PeerJS-servern stör inte en öppen förbindelse till värden.
      if (connection?.open) return;
      retry(hasReachedServer ? 'unreachable' : 'noServer');
    });
    attemptPeer.on('disconnected', () => {
      if (peer === attemptPeer && !attemptPeer.destroyed) attemptPeer.reconnect();
    });
    // PeerJS har ingen egen tidsgräns, och hittar telefonerna ingen väg till
    // varandra blir försöket ofta hängande utan fel.
    attemptTimer = setTimeout(() => {
      if (peer === attemptPeer && !connection?.open) retry(hasReachedServer ? 'unreachable' : 'noServer');
    }, OPEN_TIMEOUT_MS);
  }

  /** @param {Peer} attemptPeer */
  function openConnection(attemptPeer) {
    const next = attemptPeer.connect(toPeerId(roomCode), { reliable: true });
    connection = next;
    next.on('open', () => {
      if (connection !== next) return;
      clearTimeout(attemptTimer);
      hasReachedHost = true;
      missingRoomCount = 0;
      unansweredPingSince = null;
      retryMs = FIRST_RETRY_MS;
      next.send(/** @type {ClientMessage} */ ({ type: 'join', name, secret, avatar }));
      for (const action of unansweredActions) next.send(action);
      onStatus('open');
    });
    next.on('data', (data) => {
      if (connection !== next) return;
      unansweredPingSince = null;
      const message = /** @type {HostMessage} */ (data);
      if (message.type === 'pong') return;
      if (message.type === 'view' || message.type === 'error') {
        const handledId = message.handledActionId ?? 0;
        unansweredActions = unansweredActions.filter((action) => action.id > handledId);
      }
      onMessage(message);
    });
    next.on('close', () => {
      if (connection === next) retry('reconnecting');
    });
    next.on('error', (error) => {
      if (connection === next) retry(error.type === 'negotiation-failed' ? 'unreachable' : 'reconnecting');
    });
  }

  function closeAttempt() {
    clearTimeout(attemptTimer);
    const oldPeer = peer;
    peer = null;
    connection = null;
    if (oldPeer && !oldPeer.destroyed) oldPeer.destroy();
  }

  /** @param {ClientStatus} status */
  function retry(status) {
    if (isClosed) return;
    closeAttempt();
    onStatus(status);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(startAttempt, retryMs);
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
  }

  // Webbläsare i mobilen stänger ofta förbindelsen i tysthet när skärmen
  // släcks, så vi märker det på att värden slutar svara på ping. Tiden räknas
  // från den obesvarade pingen och inte från senaste svaret, eftersom en flik
  // i bakgrunden kan få köra den här timern så sällan som en gång i minuten.
  const watchdog = setInterval(() => {
    if (!connection?.open) return;
    const now = Date.now();
    if (unansweredPingSince === null) {
      unansweredPingSince = now;
      connection.send(/** @type {ClientMessage} */ ({ type: 'ping' }));
    } else if (now - unansweredPingSince > CONNECTION_TIMEOUT_MS) {
      retry('reconnecting');
    }
  }, HEARTBEAT_INTERVAL_MS);

  function reconnectWhenVisible() {
    if (document.visibilityState !== 'visible' || connection?.open) return;
    // Ser förbindelsen öppen ut avgör vakthunden ovan om den lever.
    retryMs = FIRST_RETRY_MS;
    startAttempt();
  }
  document.addEventListener('visibilitychange', reconnectWhenVisible);

  onStatus('connecting');
  startAttempt();

  return {
    sendAction(action) {
      const message = /** @type {const} */ ({ type: 'action', id: nextActionId++, action });
      unansweredActions.push(message);
      if (connection?.open) connection.send(message);
    },
    close() {
      isClosed = true;
      clearInterval(watchdog);
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', reconnectWhenVisible);
      closeAttempt();
    },
  };
}
