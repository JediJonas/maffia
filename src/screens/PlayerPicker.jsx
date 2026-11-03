// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';

/** @typedef {import('../game/playerView.js').PublicPlayer} PublicPlayer */

/**
 * Lista med spelare att välja bland. Samma utseende för alla roller, så att
 * ingen kan se på avstånd vem som har en nattroll.
 * @param {object} props
 * @param {PublicPlayer[]} props.players
 * @param {string[]} props.selectableIds
 * @param {string | null} props.selectedId
 * @param {(playerId: string) => void} props.onSelect
 * @param {(player: PublicPlayer) => string | null} [props.describe] Extra text efter namnet.
 */
export function PlayerPicker({ players, selectableIds, selectedId, onSelect, describe }) {
  const choices = players.filter((p) => selectableIds.includes(p.id));
  return (
    <ul className="picker">
      {choices.map((player) => {
        const detail = describe?.(player);
        return (
          <li key={player.id}>
            <button
              type="button"
              className="picker-option"
              aria-pressed={player.id === selectedId}
              onClick={() => onSelect(player.id)}
            >
              <span className="player-name"><PlayerAvatar player={player} />{player.name}</span>
              {detail && <span className="picker-detail">{detail}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
