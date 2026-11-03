// @ts-check
// Värdens sida av nätverket. Vet inget om spelregler, bara vem som är ansluten.
import Peer from 'peerjs';
import { HEARTBEAT_INTERVAL_MS, HOST_DROP_AFTER_MS } from './messages.js';
import { readPeerOptions } from './peerServer.js';
import { toPeerId } from './roomCode.js';

/** @typedef {import('peerjs').DataConnection} DataConnection */
/** @typedef {import('./messages.js').ClientMessage} ClientMessage */
/** @typedef {import('./messages.js').HostMessage} HostMessage */
/** @typedef {'connecting' | 'open' | 'error'} NetworkStatus */

// När värdens sida laddas om håller PeerJS-servern kvar det gamla id:t en
// stund, så vi försöker igen tills det släpps.
const RECLAIM_ID_RETRY_MS = 3000;
const SERVER_RETRY_MS = 2000;
// Har värdens sida varit dold så här länge kopplas den upp mot PeerJS-servern
// igen, eftersom förbindelsen kan ha dött utan att PeerJS märker det. Då kommer
// nya och återanslutande spelare inte fram. Samma lösning som i Låtquiz.
const REFRESH_AFTER_HIDDEN_MS = 5000;

/**
 * @typedef {object} HostHandlers
 * @property {(status: NetworkStatus, detail?: string) => void} onStatus
 * @property {(secret: string, name: string) => string | null} onJoin Returnerar ett felmeddelande för att neka.
 * @property {(secret: string, action: import('../game/types.js').PlayerAction) => void} onAction
 * @property {(secret: string) => void} onLeave
 */

/**
 * @param {string} roomCode
 * @param {HostHandlers} handlers
 * @returns {{ send: (secret: string, message: HostMessage) => void, close: () => void }}
 */
export function openHostNetwork(roomCode, handlers) {
  /** @type {Map<string, { connection: DataConnection, lastHeardAt: number, handledActionId?: number }>} */
  const players = new Map();
  /** @type {Peer | null} */
  let peer = null;
  let isClosed = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let retryTimer;
  let isRefreshing = false;
  /** @type {number | null} */
  let hiddenSince = null;

  function startPeer() {
    handlers.onStatus('connecting');
    peer = new Peer(toPeerId(roomCode), readPeerOptions());
    peer.on('open', () => handlers.onStatus('open'));
    peer.on('connection', acceptConnection);
    peer.on('disconnected', () => {
      if (isClosed || isRefreshing) return;
      handlers.onStatus('connecting');
      setTimeout(() => {
        if (!isClosed && peer?.disconnected && !peer.destroyed) peer.reconnect();
      }, SERVER_RETRY_MS);
    });
    peer.on('error', (error) => {
      if (error.type === 'unavailable-id' && !isClosed) {
        peer?.destroy();
        retryTimer = setTimeout(startPeer, RECLAIM_ID_RETRY_MS);
        return;
      }
      handlers.onStatus('error', error.message);
    });
  }

  /** @param {DataConnection} connection */
  function acceptConnection(connection) {
    /** @type {string | null} */
    let secret = null;
    connection.on('data', (data) => {
      const message = /** @type {ClientMessage} */ (data);
      if (message.type === 'join') {
        const previous = players.get(message.secret);
        // En telefon som återansluter ersätter sin gamla, döda förbindelse.
        if (previous && previous.connection !== connection) previous.connection.close();
        // Registreras före onJoin så att telefonen får sin vy direkt när den släpps in.
        players.set(message.secret, { connection, lastHeardAt: Date.now() });
        const rejection = handlers.onJoin(message.secret, message.name);
        if (rejection) {
          players.delete(message.secret);
          connection.send(/** @type {HostMessage} */ ({ type: 'rejected', message: rejection }));
          return;
        }
        secret = message.secret;
        return;
      }
      if (!secret) return;
      const entry = players.get(secret);
      if (entry) entry.lastHeardAt = Date.now();
      if (message.type === 'ping') {
        connection.send(/** @type {HostMessage} */ ({ type: 'pong' }));
        return;
      }
      if (message.type === 'action' && entry) {
        entry.handledActionId = message.id;
        handlers.onAction(secret, message.action);
      }
    });
    connection.on('close', () => dropConnection(secret, connection));
    connection.on('error', () => dropConnection(secret, connection));
  }

  /**
   * @param {string | null} secret
   * @param {DataConnection} connection
   */
  function dropConnection(secret, connection) {
    if (!secret || players.get(secret)?.connection !== connection) return;
    players.delete(secret);
    handlers.onLeave(secret);
  }

  const heartbeat = setInterval(() => {
    const now = Date.now();
    for (const [secret, entry] of players) {
      if (now - entry.lastHeardAt > HOST_DROP_AFTER_MS) {
        entry.connection.close();
        dropConnection(secret, entry.connection);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  function refreshAfterHidden() {
    if (document.visibilityState !== 'visible') {
      hiddenSince = Date.now();
      return;
    }
    const wasHiddenLong = hiddenSince !== null && Date.now() - hiddenSince >= REFRESH_AFTER_HIDDEN_MS;
    hiddenSince = null;
    if (!wasHiddenLong || isClosed || !peer || peer.destroyed) return;
    // Spelare som redan är anslutna påverkas inte, de pratar direkt med värden.
    if (!peer.disconnected) {
      isRefreshing = true;
      peer.disconnect();
      isRefreshing = false;
    }
    peer.reconnect();
  }
  document.addEventListener('visibilitychange', refreshAfterHidden);

  startPeer();

  return {
    send(secret, message) {
      const entry = players.get(secret);
      if (!entry?.connection.open) return;
      const isReply = message.type === 'view' || message.type === 'error';
      entry.connection.send(isReply ? { ...message, handledActionId: entry.handledActionId } : message);
    },
    close() {
      isClosed = true;
      clearInterval(heartbeat);
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', refreshAfterHidden);
      peer?.destroy();
    },
  };
}
