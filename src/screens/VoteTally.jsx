// @ts-check
import { SKIP_VOTE } from '../game/rules.js';
import { tallyVotes } from '../game/voteTally.js';

/**
 * Röstläget för alla, även röster på en själv. Omröstningen är öppen, som i
 * klassisk maffia, så att den kan diskuteras.
 * @param {{ view: import('../game/playerView.js').PlayerView, title?: string }} props
 */
export function VoteTally({ view, title = 'Så står rösterna' }) {
  const rows = tallyVotes(view.dayVotes, view.players.map((p) => p.id));
  const nameOf = (/** @type {string} */ id) => {
    if (id === SKIP_VOTE) return 'Avstå';
    const name = view.players.find((p) => p.id === id)?.name ?? '?';
    return id === view.me.id ? `${name} (du)` : name;
  };

  return (
    <div className="tally" aria-live="polite">
      <h2>{title}</h2>
      {rows.length === 0 ? (
        <p className="muted">Ingen har röstat än.</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.targetId}>
              <span className="tally-target">{nameOf(row.targetId)}: {describeVoteCount(row.voterIds.length)}</span>{' '}
              <span className="muted">({row.voterIds.map(nameOf).join(', ')})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * @param {number} count
 * @returns {string}
 */
function describeVoteCount(count) {
  return count === 1 ? '1 röst' : `${count} röster`;
}
