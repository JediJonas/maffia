// @ts-check
import { MIN_PLAYERS } from '../game/roles.js';
import { findSettingsProblem } from '../game/settings.js';
import { SettingsEditor } from './SettingsEditor.jsx';
import { AvatarEditor } from './AvatarEditor.jsx';
import { RulesView } from './RulesView.jsx';
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { loadOrCreateAvatar, saveAvatar } from '../device/savedSession.js';
import { sortByName, writeListName } from './playerName.js';
import { describeArrivals, describeLobbyStatus } from './lobbyText.js';

/** @typedef {import('../game/playerView.js').PlayerView} PlayerView */
/** @typedef {import('../game/playerView.js').PublicPlayer} PublicPlayer */
/** @typedef {import('../host/useHostGame.js').HostControls} HostControls */
/** @typedef {'players' | 'avatar' | 'settings' | 'rules'} LobbyPanel Vad lobbyn visar: spelarna, Din figur, värdens inställningar eller reglerna. */

/**
 * Lobbyn ser likadan ut för alla, och alla kan öppna reglerna. Värden har
 * dessutom inställningarna och startknappen längst ner och kan ta bort spelare, och de andra ser vem som är värd.
 * @param {object} props
 * @param {PlayerView} props.view
 * @param {HostControls | null} props.host
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 * @param {LobbyPanel} props.panel Styrs av GameScreen, som byter rubrik och döljer bildrutan.
 * @param {(panel: LobbyPanel) => void} props.setPanel
 */
export function LobbyScreen({ view, host, sendAction, panel, setPanel }) {
  const playerCount = view.players.length;
  // Värden lades till först när spelet skapades.
  const hostPlayer = view.players[0];

  const problem = playerCount >= MIN_PLAYERS ? findSettingsProblem(view.settings, playerCount) : null;
  const canStart = playerCount >= MIN_PLAYERS && !problem;
  const status = describeLobbyStatus({ settings: view.settings, playerCount, hostName: host ? null : hostPlayer?.name ?? null });

  if (panel === 'avatar') {
    return <MyAvatarEditor view={view} sendAction={sendAction} onClose={() => setPanel('players')} />;
  }
  if (panel === 'rules') {
    return <RulesView settings={view.settings} playerCount={playerCount} onClose={() => setPanel('players')} />;
  }
  if (panel === 'settings' && host) {
    return (
      <SettingsEditor
        settings={view.settings}
        playerCount={playerCount}
        botCount={view.players.filter((p) => p.isBot).length}
        onChange={host.changeSettings}
        onAddBot={host.addBot}
        onRemoveBot={host.removeBot}
        onClose={() => setPanel('players')}
      />
    );
  }
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <h2>{describeArrivals(playerCount)}</h2>
        <ul className="player-list">
          {sortByName(view.players).map((player) => (
            <li key={player.id}>
              <span className="player-name">
                <PlayerAvatar player={player} />
                <span>{writeListName(player)}</span>
              </span>
              <PlayerRowAction
                player={player}
                isMe={player.id === view.me.id}
                isHostPlayer={player.id === hostPlayer?.id}
                host={host}
                onEditAvatar={() => setPanel('avatar')}
              />
            </li>
          ))}
        </ul>
        {status && <p className="explanation">{status}</p>}
      </div>
      {/* Alla får knappen till reglerna, så att den som väntar kan läsa på. */}
      <div className="bottom-actions">
        {problem && <p className="notice">{problem}</p>}
        {host && <button type="button" className="secondary" onClick={() => setPanel('settings')}>Inställningar</button>}
        <button type="button" className="secondary" onClick={() => setPanel('rules')}>Regler</button>
        {host && (
          <button type="button" className="primary" disabled={!canStart} onClick={host.startGame}>
            Starta spelet
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * Det som står till höger i en rad: knappen för den egna figuren, värdens
 * knapp för att ta bort, eller en lapp om att någon är frånkopplad.
 * @param {object} props
 * @param {PublicPlayer} props.player
 * @param {boolean} props.isMe
 * @param {boolean} props.isHostPlayer
 * @param {HostControls | null} props.host
 * @param {() => void} props.onEditAvatar
 */
function PlayerRowAction({ player, isMe, isHostPlayer, host, onEditAvatar }) {
  if (isMe) return <button type="button" className="row-button" onClick={onEditAvatar}>Ändra figur</button>;
  if (!player.isConnected) return <span className="row-note">frånkopplad</span>;
  if (host) {
    return (
      <button type="button" className="link-button" onClick={() => host.removePlayer(player.id)}>
        Ta bort<span className="visually-hidden"> {player.name}</span>
      </button>
    );
  }
  if (isHostPlayer) return <span className="row-note">värd</span>;
  return null;
}

/**
 * @param {object} props
 * @param {PlayerView} props.view
 * @param {import('../host/useHostGame.js').GameConnection['sendAction']} props.sendAction
 * @param {() => void} props.onClose
 */
function MyAvatarEditor({ view, sendAction, onClose }) {
  const me = view.players.find((p) => p.id === view.me.id);
  if (!me) return null;
  // Spelare från ett spel som sparades innan avatarerna fanns börjar från telefonens egen.
  const avatar = me.avatar ?? loadOrCreateAvatar();

  /** @param {import('../avatar/avatarParts.js').Avatar} next */
  function changeAvatar(next) {
    saveAvatar(next);
    sendAction({ type: 'setAvatar', avatar: next });
  }

  return <AvatarEditor playerId={me.id} avatar={avatar} onChange={changeAvatar} onClose={onClose} />;
}
