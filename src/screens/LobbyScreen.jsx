// @ts-check
import { useEffect, useState } from 'react';
import { MIN_PLAYERS } from '../game/roles.js';
import { findSettingsProblem } from '../game/settings.js';
import { buildJoinUrl } from '../network/roomCode.js';
import { SettingsPanel } from './SettingsPanel.jsx';

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
export function LobbyScreen({ view, host }) {
  const hasEnoughPlayers = view.players.length >= MIN_PLAYERS;
  const canStart = hasEnoughPlayers && !findSettingsProblem(view.settings, view.players.length);
  return (
    <section aria-labelledby="lobby-title">
      <h1 id="lobby-title">Väntar på spelare</h1>
      {host && <RoomInvite roomCode={host.roomCode} />}
      <h2>Spelare ({view.players.length})</h2>
      <ul className="player-list">
        {view.players.map((player) => (
          <li key={player.id}>
            <span>{player.name}{player.id === view.me.id && ' (du)'}</span>
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
          {!hasEnoughPlayers && <p className="muted">Det behövs minst {MIN_PLAYERS} spelare.</p>}
        </>
      ) : (
        <p className="muted">Värden startar spelet när alla är med.</p>
      )}
    </section>
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
