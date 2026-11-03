// @ts-check
import { SKIP_VOTE } from '../game/rules.js';
import { PlayerPicker } from './PlayerPicker.jsx';

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function DayScreen({ view, sendAction }) {
  const myVote = view.dayVotes[view.me.id] ?? null;
  const votedCount = Object.keys(view.dayVotes).length;
  const countVotes = (/** @type {string} */ targetId) => Object.values(view.dayVotes).filter((v) => v === targetId).length;
  const living = view.players.filter((p) => p.isAlive);

  return (
    <section aria-labelledby="day-title">
      <h1 id="day-title">Dag {view.round}</h1>
      <Investigations view={view} />
      {view.me.isAlive ? (
        <>
          <p>Rösta på den ni tror är maffia. Du kan ändra dig tills alla har röstat.</p>
          <PlayerPicker
            players={view.players}
            selectableIds={living.filter((p) => p.id !== view.me.id).map((p) => p.id)}
            selectedId={myVote}
            onSelect={(targetId) => sendAction({ type: 'vote', targetId })}
            describe={(player) => describeVotes(countVotes(player.id))}
          />
          <button
            type="button"
            className="secondary"
            aria-pressed={myVote === SKIP_VOTE}
            onClick={() => sendAction({ type: 'vote', targetId: SKIP_VOTE })}
          >
            Avstå från att rösta ut någon{countVotes(SKIP_VOTE) ? ` (${describeVotes(countVotes(SKIP_VOTE))})` : ''}
          </button>
        </>
      ) : (
        <p>Du är död och får inte rösta eller prata.</p>
      )}
      <p className="muted">{votedCount} av {living.length} har röstat.</p>
    </section>
  );
}

/**
 * @param {number} count
 * @returns {string | null}
 */
function describeVotes(count) {
  if (!count) return null;
  return count === 1 ? '1 röst' : `${count} röster`;
}

/**
 * Bara detektiven har resultat. Visas diskret så att grannen inte läser med.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function Investigations({ view }) {
  if (!view.investigations.length) return null;
  return (
    <details className="secret">
      <summary>Dina undersökningar</summary>
      <ul>
        {view.investigations.map((result) => (
          <li key={result.round}>
            Natt {result.round}: {view.players.find((p) => p.id === result.targetId)?.name}{' '}
            {result.isMafia ? 'är maffia.' : 'är inte maffia.'}
          </li>
        ))}
      </ul>
    </details>
  );
}
