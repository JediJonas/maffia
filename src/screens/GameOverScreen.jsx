// @ts-check
import { ROLE_INFO } from '../game/roles.js';
import { PlayerAvatar } from './PlayerAvatar.jsx';

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
export function GameOverScreen({ view, host }) {
  return (
    <section aria-labelledby="phase-title">
      <h2>Rollerna</h2>
      <ul className="player-list">
        {view.players.map((player) => (
          <li key={player.id}>
            <span className="player-name">
              <PlayerAvatar player={player} isDead={!player.isAlive} />
              <span className={player.isAlive ? '' : 'dead'}>{player.name}</span>
            </span>
            <span>{player.revealedRole && ROLE_INFO[player.revealedRole].name}</span>
          </li>
        ))}
      </ul>
      {host ? (
        <div className="actions">
          <button type="button" className="primary" onClick={host.startGame}>Spela igen</button>
          <button type="button" className="secondary" onClick={host.returnToLobby}>Tillbaka till lobbyn</button>
        </div>
      ) : (
        <p className="muted">Värden kan starta ett nytt spel.</p>
      )}
    </section>
  );
}
