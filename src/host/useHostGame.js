// @ts-check
// Värdens telefon: äger spelets tillstånd, tar emot handlingar från de andra
// och skickar var och en sin egen vy. Värden spelar själv via samma regler.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildPlayerView } from '../game/playerView.js';
import { completeSettings } from '../game/settings.js';
import {
  RuleError, addPlayer, applyAction, changeSettings, createGame, endVerdict, removePlayer, returnToLobby, setConnected, startGame,
} from '../game/rules.js';
import {
  GAME_OVER_PAUSE_MS, ROLE_REVEAL_DELAY_MS, VERDICT_PAUSE_MS, endDecidedMorning, findHiddenDeathId, isMorningDecided,
  isVerdictShown, showDeathRole,
} from '../game/deathReveal.js';
import { openHostNetwork } from '../network/hostNetwork.js';
import { createSecret, loadHostGame, saveHostGame } from '../device/savedSession.js';
import { keepScreenAwake } from '../device/wakeLock.js';

/** @typedef {import('../device/savedSession.js').SavedHostGame} SavedHostGame */
/** @typedef {import('../game/types.js').GameState} GameState */
/** @typedef {import('../game/types.js').PlayerAction} PlayerAction */

/**
 * @typedef {object} HostControls
 * @property {string} roomCode
 * @property {() => void} startGame
 * @property {() => void} returnToLobby
 * @property {(changes: Partial<import('../game/settings.js').GameSettings>) => void} changeSettings
 * @property {(playerId: string) => void} removePlayer
 */

/**
 * @typedef {object} GameConnection
 * @property {import('../game/playerView.js').PlayerView | null} view
 * @property {string} status Kort text om förbindelsen, tom när allt fungerar.
 * @property {string | null} notice Senaste felet, till exempel ett otillåtet val.
 * @property {(action: PlayerAction) => void} sendAction
 * @property {HostControls | null} host Bara på värdens telefon.
 */

/**
 * @param {string} roomCode
 * @param {string} hostName
 * @param {import('../avatar/avatarParts.js').Avatar | undefined} hostAvatar
 * @returns {SavedHostGame}
 */
function loadOrCreateGame(roomCode, hostName, hostAvatar) {
  const saved = loadHostGame(roomCode);
  if (saved) return { ...saved, state: { ...saved.state, settings: completeSettings(saved.state.settings) } };
  const hostPlayerId = createPlayerId();
  return {
    state: addPlayer(createGame(), { id: hostPlayerId, name: hostName, avatar: hostAvatar }),
    playerIdsBySecret: {},
    hostPlayerId,
  };
}

/** @returns {string} Ett publikt id, skilt från den hemliga nyckeln. */
function createPlayerId() {
  const PLAYER_ID_LENGTH = 8;
  return `p-${createSecret().slice(0, PLAYER_ID_LENGTH)}`;
}

/**
 * @param {string} roomCode
 * @param {string} hostName
 * @param {import('../avatar/avatarParts.js').Avatar | undefined} hostAvatar
 * @returns {GameConnection}
 */
export function useHostGame(roomCode, hostName, hostAvatar) {
  const [initialGame] = useState(() => loadOrCreateGame(roomCode, hostName, hostAvatar));
  // Nätverkets callbacks körs utanför React och behöver alltid senaste
  // tillståndet, så det hålls i en ref och speglas till state för visningen.
  const gameRef = useRef(initialGame);
  const [state, setState] = useState(initialGame.state);
  const [status, setStatus] = useState('Öppnar rummet …');
  const [notice, setNotice] = useState(/** @type {string | null} */ (null));
  const networkRef = useRef(/** @type {ReturnType<typeof openHostNetwork> | null} */ (null));

  const sendViews = useCallback(() => {
    const game = gameRef.current;
    const network = networkRef.current;
    if (!game || !network) return;
    for (const [secret, playerId] of Object.entries(game.playerIdsBySecret)) {
      network.send(secret, { type: 'view', view: buildPlayerView(game.state, playerId) });
    }
  }, []);

  const commit = useCallback((/** @type {Partial<SavedHostGame>} */ changes) => {
    const game = { ...gameRef.current, ...changes };
    gameRef.current = game;
    saveHostGame(roomCode, game);
    setState(game.state);
    sendViews();
  }, [roomCode, sendViews]);

  /** Kör en regel och visar felet för den som orsakade det. */
  const tryRule = useCallback((/** @type {(state: GameState) => GameState} */ rule, /** @type {(message: string) => void} */ reportError) => {
    const game = gameRef.current;
    try {
      commit({ state: rule(game.state) });
    } catch (error) {
      if (!(error instanceof RuleError)) throw error;
      reportError(error.message);
    }
  }, [commit]);

  useEffect(() => {
    const network = openHostNetwork(roomCode, {
      onStatus(networkStatus, detail) {
        if (networkStatus === 'open') setStatus('');
        else if (networkStatus === 'connecting') setStatus('Öppnar rummet …');
        else setStatus(`Nätverksfel: ${detail ?? 'okänt'}`);
      },
      onJoin(secret, name, avatar) {
        const game = gameRef.current;
        const knownId = game.playerIdsBySecret[secret];
        if (knownId) {
          commit({ state: setConnected(game.state, knownId, true) });
          return null;
        }
        const playerId = createPlayerId();
        try {
          const nextState = addPlayer(game.state, { id: playerId, name, avatar });
          commit({ state: nextState, playerIdsBySecret: { ...game.playerIdsBySecret, [secret]: playerId } });
          return null;
        } catch (error) {
          if (error instanceof RuleError) return error.message;
          throw error;
        }
      },
      onAction(secret, action) {
        const playerId = gameRef.current.playerIdsBySecret[secret];
        if (!playerId) return;
        tryRule((s) => applyAction(s, playerId, action), (message) => network.send(secret, { type: 'error', message }));
      },
      onLeave(secret) {
        const game = gameRef.current;
        const playerId = game.playerIdsBySecret[secret];
        if (playerId) commit({ state: setConnected(game.state, playerId, false) });
      },
    });
    networkRef.current = network;
    return () => {
      network.close();
      networkRef.current = null;
    };
  }, [roomCode, commit, tryRule]);

  useEffect(() => keepScreenAwake(), []);

  // Värden räknar ned och vänder fram rollen. Telefonerna räknar ned var för
  // sig, så att ingen behöver vänta på nätverket för varje sekund.
  const hiddenDeathId = findHiddenDeathId(state);
  useEffect(() => {
    if (!hiddenDeathId) return undefined;
    const timer = setTimeout(() => tryRule(showDeathRole, setNotice), ROLE_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hiddenDeathId, state.phase, tryRule]);

  // Avgjorde nattens mord spelet går morgonen vidare till slutet av sig själv,
  // en stund efter att rollen har visats.
  const isDecided = isMorningDecided(state);
  useEffect(() => {
    if (!isDecided) return undefined;
    const timer = setTimeout(() => tryRule(endDecidedMorning, setNotice), GAME_OVER_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [isDecided, tryRule]);

  // Domslutet går vidare av sig självt, till natt eller till slutet. Samma
  // nedräkning i båda fallen, så att ingen ser resultatet i förväg.
  const isVerdictDone = isVerdictShown(state);
  useEffect(() => {
    if (!isVerdictDone) return undefined;
    const timer = setTimeout(() => tryRule(endVerdict, setNotice), VERDICT_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [isVerdictDone, tryRule]);

  const { hostPlayerId } = initialGame;
  const view = useMemo(() => buildPlayerView(state, hostPlayerId), [state, hostPlayerId]);

  const sendAction = useCallback((/** @type {PlayerAction} */ action) => {
    setNotice(null);
    tryRule((s) => applyAction(s, hostPlayerId, action), setNotice);
  }, [hostPlayerId, tryRule]);

  const host = useMemo(() => ({
    roomCode,
    startGame: () => tryRule((s) => startGame(s, Math.random), setNotice),
    returnToLobby: () => tryRule(returnToLobby, setNotice),
    changeSettings: (/** @type {Partial<import('../game/settings.js').GameSettings>} */ changes) => tryRule((s) => changeSettings(s, changes), setNotice),
    removePlayer(/** @type {string} */ playerId) {
      const game = gameRef.current;
      const entry = Object.entries(game.playerIdsBySecret).find(([, id]) => id === playerId);
      if (!entry) return;
      const [secret] = entry;
      networkRef.current?.send(secret, { type: 'rejected', message: 'Värden tog bort dig från rummet.' });
      const playerIdsBySecret = Object.fromEntries(
        Object.entries(game.playerIdsBySecret).filter(([key]) => key !== secret),
      );
      tryRule((s) => removePlayer(s, playerId), setNotice);
      commit({ playerIdsBySecret });
    },
  }), [roomCode, tryRule, commit]);

  return { view, status, notice, sendAction, host };
}
