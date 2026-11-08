// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { writeListName } from './playerName.js';
import { styleStampTilt } from './stampTilt.js';

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
 * @param {(player: PublicPlayer) => string | null} [props.describeBelowName] Grå text under namnet, som rollen på slutet.
 * @param {(player: PublicPlayer) => string | null} [props.stamp] Stämpel till höger i raden, som "Vinnare".
 * @param {boolean} [props.showsDead] Döda visas blekta och överstrukna.
 */
export function PlayerPicker({ players, selectableIds = [], selectedId = null, onSelect, describe, describeBelowName, stamp, showsDead = true }) {
  return (
    <ul className="picker">
      {players.map((player, index) => {
        const detail = describe?.(player);
        const belowName = describeBelowName?.(player);
        const stampText = stamp?.(player);
        const isShownDead = showsDead && !player.isAlive;
        const content = (
          <>
            <span className="player-name">
              <PlayerAvatar player={player} isDead={isShownDead} />
              <span className="picker-who">
                <span className={isShownDead ? 'dead' : ''}>{writeListName(player)}</span>
                {belowName && <span className="picker-below">{belowName}</span>}
              </span>
            </span>
            {stampText && <span className="stamp picker-stamp" style={styleStampTilt(index)}>{stampText}</span>}
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
