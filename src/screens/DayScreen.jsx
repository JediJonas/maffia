// @ts-check
import { SKIP_VOTE } from '../game/rules.js';
import { PlayerPicker } from './PlayerPicker.jsx';
import { SecretCard } from './SecretCard.jsx';

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
 * Bara detektiven har resultat. Visas som rollkortet, så att grannen inte läser med.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function Investigations({ view }) {
  if (!view.investigations.length) return null;
  const nameOf = (/** @type {string} */ id) => view.players.find((p) => p.id === id)?.name;
  const describe = (/** @type {import('../game/types.js').Investigation} */ result) =>
    `${nameOf(result.targetId)} ${result.isMafia ? 'är maffia' : 'är inte maffia'}`;
  const latest = view.investigations[view.investigations.length - 1];
  const earlier = view.investigations.slice(0, -1);
  return (
    // Nyckeln vänder tillbaka kortet varje ny dag.
    <SecretCard key={latest.round} revealLabel="Tryck för att se vad din undersökning visade">
      <p className="secret-headline">{describe(latest)}.</p>
      {earlier.length > 0 && (
        <ul className="earlier-results">
          {earlier.map((result) => <li key={result.round}>Natt {result.round}: {describe(result)}.</li>)}
        </ul>
      )}
    </SecretCard>
  );
}
