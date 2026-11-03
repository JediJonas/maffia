// @ts-check
import { useState } from 'react';
import { useHostGame } from './host/useHostGame.js';
import { useNarratorVoice } from './host/useNarratorVoice.js';
import { useRemoteGame } from './player/useRemoteGame.js';
import { GameScreen } from './screens/GameScreen.jsx';
import { StartScreen } from './screens/StartScreen.jsx';
import { createSecret, loadSession, saveHostGame, saveSession } from './device/savedSession.js';
import { generateRoomCode, readRoomCodeFromUrl } from './network/roomCode.js';

/** @typedef {import('./device/savedSession.js').SavedSession} SavedSession */

/**
 * Väljer sparad session i första hand, så att en omladdad sida kommer
 * tillbaka till samma spel. En QR-kod till ett annat rum går före.
 * @returns {SavedSession | null}
 */
function findStartingSession() {
  const session = loadSession();
  const urlRoomCode = readRoomCodeFromUrl(window.location.href);
  if (session && (!urlRoomCode || urlRoomCode === session.roomCode)) return session;
  return null;
}

export function App() {
  const [session, setSession] = useState(findStartingSession);
  const [message, setMessage] = useState(/** @type {string | null} */ (null));

  /** @param {SavedSession | null} next */
  function changeSession(next) {
    saveSession(next);
    setSession(next);
  }

  function leave() {
    if (session?.kind === 'host' && !window.confirm('Om du lämnar avslutas spelet för alla. Vill du lämna?')) return;
    if (session?.kind === 'host') saveHostGame(session.roomCode, null);
    window.history.replaceState(null, '', window.location.pathname);
    setMessage(null);
    changeSession(null);
  }

  /** @param {string} reason */
  function handleRejected(reason) {
    setMessage(reason);
    changeSession(null);
  }

  if (session?.kind === 'host') return <HostGame session={session} onLeave={leave} />;
  if (session?.kind === 'player') return <PlayerGame session={session} onLeave={leave} onRejected={handleRejected} />;
  return (
    <StartScreen
      initialRoomCode={readRoomCodeFromUrl(window.location.href)}
      message={message}
      onCreate={(name) => changeSession({ kind: 'host', roomCode: generateRoomCode(Math.random), name })}
      onJoin={(roomCode, name) => changeSession({ kind: 'player', roomCode, name, secret: createSecret() })}
    />
  );
}

/** @param {{ session: Extract<SavedSession, { kind: 'host' }>, onLeave: () => void }} props */
function HostGame({ session, onLeave }) {
  const connection = useHostGame(session.roomCode, session.name);
  const voiceToggle = useNarratorVoice(connection.view);
  return <GameScreen connection={connection} onLeave={onLeave} voiceToggle={voiceToggle} />;
}

/**
 * @param {object} props
 * @param {Extract<SavedSession, { kind: 'player' }>} props.session
 * @param {() => void} props.onLeave
 * @param {(reason: string) => void} props.onRejected
 */
function PlayerGame({ session, onLeave, onRejected }) {
  const connection = useRemoteGame({ ...session, onRejected });
  return <GameScreen connection={connection} onLeave={onLeave} />;
}
