// @ts-check
// Spelarens sida av nätverket. Håller förbindelsen till värden vid liv och
// ansluter igen av sig själv när telefonen har låsts eller tappat nätet.
import Peer from 'peerjs';
import { CONNECTION_TIMEOUT_MS } from './messages.js';
import { readPeerOptions } from './peerServer.js';
import { toPeerId } from './roomCode.js';

/** @typedef {import('./messages.js').ClientMessage} ClientMessage */
/** @typedef {import('./messages.js').HostMessage} HostMessage */
/** @typedef {'connecting' | 'open' | 'reconnecting'} ClientStatus */

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10000;
const CONNECTION_CHECK_MS = 2000;

/**
 * @typedef {object} ClientOptions
 * @property {string} roomCode
 * @property {string} name
 * @property {string} secret
 * @property {(message: HostMessage) => void} onMessage
 * @property {(status: ClientStatus) => void} onStatus
 */

/**
 * @param {ClientOptions} options
 * @returns {{ send: (message: ClientMessage) => void, close: () => void }}
 */
export function openClientNetwork({ roomCode, name, secret, onMessage, onStatus }) {
  const peer = new Peer(readPeerOptions());
  /** @type {import('peerjs').DataConnection | null} */
  let connection = null;
  let lastHeardAt = 0;
  let retryMs = FIRST_RETRY_MS;
  let isClosed = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let retryTimer;

  function connect() {
    if (isClosed || peer.destroyed) return;
    if (peer.disconnected) peer.reconnect();
    connection?.close();
    const next = peer.connect(toPeerId(roomCode), { reliable: true });
    connection = next;
    next.on('open', () => {
      lastHeardAt = Date.now();
      retryMs = FIRST_RETRY_MS;
      next.send(/** @type {ClientMessage} */ ({ type: 'join', name, secret }));
      onStatus('open');
    });
    next.on('data', (data) => {
      lastHeardAt = Date.now();
      const message = /** @type {HostMessage} */ (data);
      if (message.type === 'ping') next.send(/** @type {ClientMessage} */ ({ type: 'pong' }));
      else onMessage(message);
    });
    next.on('close', () => scheduleReconnect(next));
    next.on('error', () => scheduleReconnect(next));
  }

  /** @param {import('peerjs').DataConnection} failed */
  function scheduleReconnect(failed) {
    if (isClosed || failed !== connection) return;
    connection = null;
    onStatus('reconnecting');
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, retryMs);
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
  }

  // Webbläsare i mobilen stänger ofta förbindelsen i tysthet när skärmen
  // släcks, så vi märker det på att värdens ping slutar komma.
  const watchdog = setInterval(() => {
    if (connection?.open && Date.now() - lastHeardAt > CONNECTION_TIMEOUT_MS) {
      const stale = connection;
      stale.close();
      scheduleReconnect(stale);
    }
  }, CONNECTION_CHECK_MS);

  function reconnectWhenVisible() {
    if (document.visibilityState !== 'visible' || connection?.open) return;
    retryMs = FIRST_RETRY_MS;
    clearTimeout(retryTimer);
    connect();
  }
  document.addEventListener('visibilitychange', reconnectWhenVisible);

  onStatus('connecting');
  peer.on('open', connect);
  // Värden finns inte ännu, eller har laddat om sin sida: försök igen.
  peer.on('error', (error) => {
    if (error.type === 'peer-unavailable' && connection) scheduleReconnect(connection);
  });

  return {
    send(message) {
      if (connection?.open) connection.send(message);
    },
    close() {
      isClosed = true;
      clearInterval(watchdog);
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', reconnectWhenVisible);
      peer.destroy();
    },
  };
}
