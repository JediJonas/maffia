// @ts-check
import { sortByName } from './playerName.js';
import { ROLE_INFO } from '../game/roles.js';
import { ListCard } from './ListCard.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';

/**
 * Alla roller visas, maffian först och sedan i bokstavsordning.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
export function GameOverScreen({ view, host }) {
  const isMafia = (/** @type {import('../game/playerView.js').PublicPlayer} */ p) => p.revealedRole === 'mafia';
  const sorted = sortByName(view.players);
  const players = [...sorted.filter(isMafia), ...sorted.filter((p) => !isMafia(p))];
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <ListCard lead="Så här låg det till.">
          <PlayerPicker
            players={players}
            describe={(player) => player.revealedRole && ROLE_INFO[player.revealedRole].name.toLowerCase()}
          />
        </ListCard>
        {!host && <p className="explanation">Värden kan starta ett nytt spel.</p>}
      </div>
      {host && (
        <div className="bottom-actions">
          <button type="button" className="secondary" onClick={host.returnToLobby}>Tillbaka till lobbyn</button>
          <button type="button" className="primary" onClick={host.startGame}>Spela igen</button>
        </div>
      )}
    </section>
  );
}
