// @ts-check
import { ROLE_INFO } from '../game/roles.js';
import { isWinner, orderForGameOver } from './gameOver.js';
import { ListCard } from './ListCard.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';
import { StampFilter } from './StampFilter.jsx';

/**
 * Alla roller visas, vinnarna först och sedan i bokstavsordning. Vinnarna får
 * en stämpel, som stämplarna i detektivens akt, så att man ser dem direkt.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
export function GameOverScreen({ view, host }) {
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <StampFilter />
        <ListCard lead="Så här låg det till.">
          <PlayerPicker
            players={orderForGameOver(view.players, view.winner)}
            describe={(player) => player.revealedRole && ROLE_INFO[player.revealedRole].name.toLowerCase()}
            stamp={(player) => (isWinner(player, view.winner) ? 'Vann' : null)}
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
