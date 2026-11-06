// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';

/** @typedef {import('../game/playerView.js').PublicPlayer} PublicPlayer */

/**
 * Lista med spelare. De som går att välja är knappar, de andra står bara
 * med. Samma utseende för alla roller, så att ingen kan se på avstånd vem
 * som har en nattroll.
 * @param {object} props
 * @param {PublicPlayer[]} props.players
 * @param {string[]} [props.selectableIds] Utelämnad när listan bara visar läget.
 * @param {string | null} [props.selectedId]
 * @param {(playerId: string) => void} [props.onSelect]
 * @param {(player: PublicPlayer) => string | null} [props.describe] Text till höger i raden.
 * @param {boolean} [props.showsDead] Döda visas blekta och överstrukna.
 */
export function PlayerPicker({ players, selectableIds = [], selectedId = null, onSelect, describe, showsDead = true }) {
  return (
    <ul className="picker">
      {players.map((player) => {
        const detail = describe?.(player);
        const isShownDead = showsDead && !player.isAlive;
        const content = (
          <>
            <span className="player-name">
              <PlayerAvatar player={player} isDead={isShownDead} />
              <span className={isShownDead ? 'dead' : ''}>{player.name}</span>
            </span>
            {detail && <span className="picker-detail">{detail}</span>}
          </>
        );
        return (
          <li key={player.id}>
            {onSelect && selectableIds.includes(player.id) ? (
              <button
                type="button"
                className="picker-option"
                aria-pressed={player.id === selectedId}
                onClick={() => onSelect(player.id)}
              >
                {content}
              </button>
            ) : (
              <span className="picker-option">{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
