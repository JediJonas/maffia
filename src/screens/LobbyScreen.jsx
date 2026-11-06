// @ts-check
import { useEffect, useState } from 'react';
import { MIN_PLAYERS } from '../game/roles.js';
import { buildRoleList, describeRoles, findSettingsProblem } from '../game/settings.js';
import { buildJoinUrl } from '../network/roomCode.js';
import { SettingsPanel } from './SettingsPanel.jsx';
import { AvatarEditor } from './AvatarEditor.jsx';
import { LARGE_AVATAR_PX, PlayerAvatar } from './PlayerAvatar.jsx';
import { loadOrCreateAvatar, saveAvatar } from '../device/savedSession.js';

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 */
export function LobbyScreen({ view, host, sendAction }) {
  const hasEnoughPlayers = view.players.length >= MIN_PLAYERS;
  const canStart = hasEnoughPlayers && !findSettingsProblem(view.settings, view.players.length);
  return (
    <section aria-labelledby="phase-title">
      {host && <RoomInvite roomCode={host.roomCode} />}
      <MyAvatar view={view} sendAction={sendAction} />
      <h2>Spelare ({view.players.length})</h2>
      <ul className="player-list">
        {view.players.map((player) => (
          <li key={player.id}>
            <span className="player-name">
              <PlayerAvatar player={player} />
              {player.name}
            </span>
            {!player.isConnected && <span className="muted">frånkopplad</span>}
            {host && player.id !== view.me.id && (
              <button type="button" className="link-button" onClick={() => host.removePlayer(player.id)}>
                Ta bort<span className="visually-hidden"> {player.name}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
      <SettingsPanel settings={view.settings} playerCount={view.players.length} onChange={host?.changeSettings ?? null} />
      {host ? (
        <>
          <button type="button" className="primary" disabled={!canStart} onClick={host.startGame}>
            Starta spelet
          </button>
          <StartHint view={view} />
        </>
      ) : (
        <>
          <StartHint view={view} />
          <p className="muted">Värden startar spelet när alla är med.</p>
        </>
      )}
    </section>
  );
}

/**
 * Den egna avataren, med byggaren bakom en knapp så att lobbyn hålls kort.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 */
function MyAvatar({ view, sendAction }) {
  const [isEditing, setIsEditing] = useState(false);
  const me = view.players.find((p) => p.id === view.me.id);
  if (!me) return null;
  // Spelare från ett spel som sparades innan avatarerna fanns börjar från telefonens egen.
  const avatar = me.avatar ?? loadOrCreateAvatar();

  /** @param {import('../avatar/avatarParts.js').Avatar} next */
  function changeAvatar(next) {
    saveAvatar(next);
    sendAction({ type: 'setAvatar', avatar: next });
  }

  if (isEditing) {
    return <AvatarEditor playerId={me.id} avatar={avatar} onChange={changeAvatar} onClose={() => setIsEditing(false)} />;
  }
  return (
    <div className="my-avatar">
      <PlayerAvatar player={me} sizePx={LARGE_AVATAR_PX} />
      <button type="button" className="secondary" onClick={() => setIsEditing(true)}>Ändra avatar</button>
    </div>
  );
}

/** @param {{ roomCode: string }} props */
function RoomInvite({ roomCode }) {
  const [qrDataUrl, setQrDataUrl] = useState(/** @type {string | null} */ (null));
  const joinUrl = buildJoinUrl(roomCode, window.location.href);

  useEffect(() => {
    const QR_SIZE_PX = 240;
    // Bara värden visar QR-koden, så biblioteket laddas först här.
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(joinUrl, { width: QR_SIZE_PX, margin: 1 }))
      .then(setQrDataUrl, () => setQrDataUrl(null));
  }, [joinUrl]);

  return (
    <div className="invite">
      <p>Rumskod</p>
      <p className="room-code" aria-label={`Rumskod ${[...roomCode].join(' ')}`}>{roomCode}</p>
      {qrDataUrl && <img className="qr" src={qrDataUrl} alt="QR-kod som öppnar spelet med rumskoden ifylld" width={240} height={240} />}
      <p className="muted">Skanna koden, eller öppna sidan och skriv in rumskoden.</p>
    </div>
  );
}

/**
 * Raden under Starta spelet: hur många som saknas, eller vilka roller som
 * delas ut när det finns tillräckligt många. Ett problem med inställningarna
 * visas i stället vid inställningarna.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function StartHint({ view }) {
  const playerCount = view.players.length;
  if (playerCount < MIN_PLAYERS) return <p className="muted">Det behövs minst {MIN_PLAYERS} spelare.</p>;
  if (findSettingsProblem(view.settings, playerCount)) return null;
  return <p className="muted">Roller: {describeRoles(buildRoleList(view.settings, playerCount))}.</p>;
}
