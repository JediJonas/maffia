// @ts-check
import { DayScreen } from './DayScreen.jsx';
import { GameOverScreen } from './GameOverScreen.jsx';
import { LobbyScreen } from './LobbyScreen.jsx';
import { NightScreen } from './NightScreen.jsx';
import { RoleScreen } from './RoleScreen.jsx';
import { usePhaseAnnouncement } from './usePhaseAnnouncement.js';

/**
 * @param {object} props
 * @param {import('../host/useHostGame.js').GameConnection} props.connection
 * @param {() => void} props.onLeave
 */
export function GameScreen({ connection, onLeave }) {
  const { view, status, notice, sendAction, host } = connection;
  const announcement = usePhaseAnnouncement(view);
  const showsAnnouncement = view && view.phase !== 'lobby' && announcement;

  return (
    <>
      <header className="top-bar">
        <span>{view ? view.me.name : 'Maffia'}{host && ' · värd'}</span>
        <button type="button" className="link-button" onClick={onLeave}>Lämna</button>
      </header>
      <main>
        {status && <p className="status" role="status">{status}</p>}
        {showsAnnouncement && <p className="announcement" aria-live="polite">{announcement}</p>}
        {notice && <p className="notice" role="alert">{notice}</p>}
        {view ? <PhaseContent view={view} sendAction={sendAction} host={host} /> : <p>Ansluter …</p>}
      </main>
    </>
  );
}

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
function PhaseContent({ view, sendAction, host }) {
  switch (view.phase) {
    case 'lobby':
      return <LobbyScreen view={view} host={host} />;
    case 'roleReveal':
      return <RoleScreen view={view} sendAction={sendAction} />;
    case 'night':
      return <NightScreen view={view} sendAction={sendAction} />;
    case 'day':
      return <DayScreen view={view} sendAction={sendAction} />;
    case 'gameOver':
      return <GameOverScreen view={view} host={host} />;
    default:
      return null;
  }
}
