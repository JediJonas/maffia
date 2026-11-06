// @ts-check
import { useState } from 'react';
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
import { describeScene } from '../scenes/describeScene.js';

/**
 * @param {object} props
 * @param {import('../host/useHostGame.js').GameConnection} props.connection
 * @param {string} props.roomCode
 * @param {() => void} props.onLeave
 */
export function GameScreen({ connection, roomCode, onLeave }) {
  const { view, status, notice, sendAction, host } = connection;
  const announcement = usePhaseAnnouncement(view);
  const showsAnnouncement = view && view.phase !== 'lobby' && announcement;
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isRoleShown, setIsRoleShown] = useState(false);
  // Figuren ändras bara i lobbyn, så redigeraren stängs om spelet startar under tiden.
  const showsAvatarEditor = isEditingAvatar && view?.phase === 'lobby';
  // Rollen visas bara innan spelet startar. Efter det är akten stängd.
  const showsRole = isRoleShown && view?.phase === 'roleReveal';
  const scene = view && !showsAvatarEditor && describeScene(view, Boolean(host), showsRole);

  return (
    <>
      <header className="top-bar">
        <h1 id="phase-title">{showsAvatarEditor ? 'Din figur' : view ? describePhaseTitle(view) : 'Maffia'}</h1>
        <span className="top-bar-name">{view?.me.name}</span>
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
            isEditingAvatar={showsAvatarEditor}
            setIsEditingAvatar={setIsEditingAvatar}
            isRoleShown={showsRole}
            setIsRoleShown={setIsRoleShown}
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
 * @param {boolean} props.isEditingAvatar
 * @param {(isEditing: boolean) => void} props.setIsEditingAvatar
 * @param {boolean} props.isRoleShown
 * @param {(isShown: boolean) => void} props.setIsRoleShown
 */
function PhaseContent({ view, sendAction, host, isEditingAvatar, setIsEditingAvatar, isRoleShown, setIsRoleShown }) {
  switch (view.phase) {
    case 'lobby':
      return (
        <LobbyScreen
          view={view}
          host={host}
          sendAction={sendAction}
          isEditingAvatar={isEditingAvatar}
          setIsEditingAvatar={setIsEditingAvatar}
        />
      );
    case 'roleReveal':
      return <RoleScreen view={view} sendAction={sendAction} isRoleShown={isRoleShown} setIsRoleShown={setIsRoleShown} />;
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
