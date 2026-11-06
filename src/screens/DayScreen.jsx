// @ts-check
import { SKIP_VOTE } from '../game/rules.js';
import { capitalize, writeNumber } from '../game/numberWords.js';
import { describeDeath } from './deathText.js';
import { DetectiveFile } from './DetectiveFile.jsx';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';

/**
 * Morgonen och omröstningen. Röstläget står i listan, så att det syns
 * vem som har flest röster medan man väljer.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function DayScreen({ view, sendAction }) {
  const myVote = view.dayVotes[view.me.id] ?? null;
  const votedCount = Object.keys(view.dayVotes).length;
  const living = view.players.filter((p) => p.isAlive);
  const votesFor = (/** @type {string} */ id) => Object.values(view.dayVotes).filter((target) => target === id).length;
  // Röster på en själv syns också, men man kan inte rösta på sig själv.
  const listed = living.filter((p) => p.id !== view.me.id || votesFor(p.id) > 0);
  const progress = capitalize(`${writeNumber(votedCount)} av ${writeNumber(living.length)} har röstat`);
  /** @param {import('../game/playerView.js').PublicPlayer} player */
  const describeVotes = (player) => describeVoteCount(votesFor(player.id));

  return (
    <section aria-labelledby="phase-title">
      <MorningNews view={view} />
      {view.investigations.length > 0 && <DetectiveFile key={view.round} view={view} />}
      {view.me.isAlive ? (
        <>
          <ListCard lead="Någon av er ljuger. Staden röstar om vem som ska förvisas." tag={progress}>
            <PlayerPicker
              players={listed}
              selectableIds={living.filter((p) => p.id !== view.me.id).map((p) => p.id)}
              selectedId={myVote}
              onSelect={(targetId) => sendAction({ type: 'vote', targetId })}
              describe={describeVotes}
            />
          </ListCard>
          <div className="bottom-actions">
            <button
              type="button"
              className="secondary"
              aria-pressed={myVote === SKIP_VOTE}
              onClick={() => sendAction({ type: 'vote', targetId: SKIP_VOTE })}
            >
              Avstå från att rösta
            </button>
          </div>
        </>
      ) : (
        <>
          <ListCard lead="Staden röstar utan dig." tag={progress}>
            <PlayerPicker players={listed} describe={describeVotes} />
          </ListCard>
          <p className="explanation">Du är borta nu. Se på, men säg inget.</p>
        </>
      )}
    </section>
  );
}

/**
 * @param {number} count
 * @returns {string | null} Null när ingen har röstat på spelaren.
 */
function describeVoteCount(count) {
  if (count === 0) return null;
  return count === 1 ? '1 röst' : `${count} röster`;
}

/**
 * Nattens offer som en personrad, med rollen direkt när roller visas vid död.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function MorningNews({ view }) {
  const killed = view.players.find((p) => p.id === view.lastNight?.killedId);
  if (!killed) return <p>Någon vakade över staden i natt. Men maffian finns kvar.</p>;
  return <PersonRow player={killed} text={describeDeath(killed, view.me.id, 'mördad i natt')} />;
}
