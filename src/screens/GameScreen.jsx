// @ts-check
import { useEffect, useState } from 'react';
import { DayScreen } from './DayScreen.jsx';
import { GameOverScreen } from './GameOverScreen.jsx';
import { LobbyScreen } from './LobbyScreen.jsx';
import { MessageBar } from './MessageBar.jsx';
import { NightScreen } from './NightScreen.jsx';
import { RoleScreen } from './RoleScreen.jsx';
import { VerdictScreen } from './VerdictScreen.jsx';
import { usePhaseAnnouncement } from './usePhaseAnnouncement.js';
import { describePhaseTitle } from './phaseTitle.js';
import { LeaveIcon } from './LeaveIcon.jsx';
import { LeaveDialog } from './LeaveDialog.jsx';
import { RoomQrCode } from './RoomQrCode.jsx';
import { ScenePanel } from '../scenes/ScenePanel.jsx';
import { describeScene, listUpcomingImages } from '../scenes/describeScene.js';
import { usePreloadImages } from '../scenes/usePreloadImages.js';
import { useRoleImageVariant } from '../scenes/useRoleImageVariant.js';
import { useScrollToTop } from './scrollToTop.js';
import { changeViewSmoothly, useSmoothPhaseChange } from './viewTransition.js';

/** @type {Partial<Record<import('./LobbyScreen.jsx').LobbyPanel, string>>} */
const PANEL_TITLES = { avatar: 'Din figur', settings: 'Inställningar', rules: 'Regler' };

/**
 * @param {object} props
 * @param {import('../host/useHostGame.js').GameConnection} props.connection
 * @param {string} props.roomCode
 * @param {() => void} props.onLeave
 */
export function GameScreen({ connection, roomCode, onLeave }) {
  const { status, notice, sendAction, host } = connection;
  const view = useSmoothPhaseChange(connection.view);
  const announcement = usePhaseAnnouncement(view);
  const showsAnnouncement = view && view.phase !== 'lobby' && announcement;
  const [isLeaving, setIsLeaving] = useState(false);
  const [lobbyPanel, setLobbyPanel] = useState(/** @type {import('./LobbyScreen.jsx').LobbyPanel} */ ('players'));
  const [isRoleShown, setIsRoleShown] = useState(false);
  // Figuren, inställningarna och reglerna finns bara i lobbyn, så de stängs om spelet startar under tiden.
  const shownPanel = view?.phase === 'lobby' && (lobbyPanel !== 'settings' || host) ? lobbyPanel : 'players';
  // Rollen visas bara innan spelet startar. Efter det är akten stängd.
  const showsRole = isRoleShown && view?.phase === 'roleReveal';
  const roleImageVariant = useRoleImageVariant(view, roomCode);
  const isPlaying = Boolean(view && view.phase !== 'lobby' && view.phase !== 'gameOver');
  // Värden behöver valet för mordbilden och för slutbilden när galningen vinner.
  useEffect(() => {
    if (isPlaying) sendAction({ type: 'setRoleImage', variant: roleImageVariant });
  }, [isPlaying, roleImageVariant, sendAction]);
  const scene = view && shownPanel === 'players' && describeScene(view, Boolean(host), showsRole, roleImageVariant);
  useScrollToTop(`${view?.phase}-${shownPanel}-${showsRole}`);
  usePreloadImages(view ? listUpcomingImages(view, roleImageVariant) : []);

  return (
    <>
      <header className="top-bar">
        <h1 id="phase-title">{PANEL_TITLES[shownPanel] ?? (view ? describePhaseTitle(view) : 'Maffia')}</h1>
        {/* I Din figur, Inställningar och Regler tar rubriken hela raden, så ett långt namn inte bryts mitt i ordet. */}
        <span className="top-bar-name">{shownPanel === 'players' && view?.me.name}</span>
        <button type="button" className="leave-button" aria-label="Lämna spelet" onClick={() => setIsLeaving(true)}>
          <LeaveIcon />
        </button>
      </header>
      <main>
        {/* Bildrutan berättar samma sak för den som ser, så texten läses bara upp. */}
        {showsAnnouncement && <p className="visually-hidden" aria-live="polite">{announcement}</p>}
        {scene && (
          <ScenePanel scene={scene} roomCode={roomCode}>
            <RoomQrCode roomCode={roomCode} />
          </ScenePanel>
        )}
        {/* Utan vy står det i meddelanderutan att telefonen ansluter. */}
        {view && (
          <PhaseContent
            view={view}
            sendAction={sendAction}
            host={host}
            lobbyPanel={shownPanel}
            setLobbyPanel={(panel) => changeViewSmoothly('fade', () => setLobbyPanel(panel))}
            isRoleShown={showsRole}
            roleImageVariant={roleImageVariant}
            setIsRoleShown={(isShown) => changeViewSmoothly('fade', () => setIsRoleShown(isShown))}
          />
        )}
      </main>
      <MessageBar status={status} notice={notice} />
      <LeaveDialog isOpen={isLeaving} isHost={Boolean(host)} onStay={() => setIsLeaving(false)} onLeave={onLeave} />
    </>
  );
}

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 * @param {import('./LobbyScreen.jsx').LobbyPanel} props.lobbyPanel
 * @param {(panel: import('./LobbyScreen.jsx').LobbyPanel) => void} props.setLobbyPanel
 * @param {boolean} props.isRoleShown
 * @param {import('../scenes/roleImageChoice.js').RoleImageVariant} props.roleImageVariant
 * @param {(isShown: boolean) => void} props.setIsRoleShown
 */
function PhaseContent({ view, sendAction, host, lobbyPanel, setLobbyPanel, isRoleShown, roleImageVariant, setIsRoleShown }) {
  switch (view.phase) {
    case 'lobby':
      return (
        <LobbyScreen
          view={view}
          host={host}
          sendAction={sendAction}
          panel={lobbyPanel}
          setPanel={setLobbyPanel}
        />
      );
    case 'roleReveal':
      return <RoleScreen view={view} sendAction={sendAction} isRoleShown={isRoleShown} roleImageVariant={roleImageVariant} setIsRoleShown={setIsRoleShown} />;
    case 'night':
      return <NightScreen view={view} sendAction={sendAction} />;
    case 'day':
      return <DayScreen view={view} sendAction={sendAction} />;
    case 'verdict':
      return <VerdictScreen view={view} />;
    case 'gameOver':
      return <GameOverScreen view={view} host={host} />;
    default:
      return null;
  }
}
