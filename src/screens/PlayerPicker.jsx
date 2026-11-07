// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { writeListName } from './playerName.js';

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
 * @param {(player: PublicPlayer) => string | null} [props.stamp] Stämpel framför texten till höger, som "Vinnare".
 * @param {boolean} [props.showsDead] Döda visas blekta och överstrukna.
 */
export function PlayerPicker({ players, selectableIds = [], selectedId = null, onSelect, describe, stamp, showsDead = true }) {
  return (
    <ul className="picker">
      {players.map((player) => {
        const detail = describe?.(player);
        const stampText = stamp?.(player);
        const isShownDead = showsDead && !player.isAlive;
        const content = (
          <>
            <span className="player-name">
              <PlayerAvatar player={player} isDead={isShownDead} />
              <span className={isShownDead ? 'dead' : ''}>{writeListName(player)}</span>
            </span>
            {stampText && <span className="stamp picker-stamp">{stampText}</span>}
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
