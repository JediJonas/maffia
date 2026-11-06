// @ts-check
import { SKIP_VOTE } from '../game/rules.js';
import { capitalize, writeNumber } from '../game/numberWords.js';
import { describeDeath } from './deathText.js';
import { DetectiveFile } from './DetectiveFile.jsx';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';

const QUIET_NIGHT_NEWS = 'Någon vakade över staden i natt.';

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
  const isQuietNight = !view.players.some((p) => p.id === view.lastNight?.killedId);
  // En lugn natt har ingen personrad. Då står nyheten i listans ruta, så att det blir en ruta i stället för två.
  const voteLead = isQuietNight
    ? `${QUIET_NIGHT_NEWS} Men maffian finns kvar, och staden röstar om vem som ska förvisas.`
    : 'Någon av er ljuger. Staden röstar om vem som ska förvisas.';

  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <MorningNews view={view} isNewsInList={view.me.isAlive} />
        {view.investigations.length > 0 && <DetectiveFile key={view.round} view={view} />}
        {view.me.isAlive ? (
          <ListCard lead={voteLead} tag={progress}>
            <PlayerPicker
              players={listed}
              selectableIds={living.filter((p) => p.id !== view.me.id).map((p) => p.id)}
              selectedId={myVote}
              onSelect={(targetId) => sendAction({ type: 'vote', targetId })}
              describe={describeVotes}
            />
          </ListCard>
        ) : (
          <>
            <ListCard lead="Staden röstar utan dig." tag={progress}>
              <PlayerPicker players={listed} describe={describeVotes} />
            </ListCard>
            <p className="explanation">Du är borta nu. Se på, men säg inget.</p>
          </>
        )}
      </div>
      {view.me.isAlive && (
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
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {boolean} props.isNewsInList Sant när en lugn natt redan står i listans ruta.
 */
function MorningNews({ view, isNewsInList }) {
  const killed = view.players.find((p) => p.id === view.lastNight?.killedId);
  if (!killed) return isNewsInList ? null : <p>{QUIET_NIGHT_NEWS} Men maffian finns kvar.</p>;
  return <PersonRow player={killed} text={describeDeath(killed, view.me.id, 'mördad i natt')} />;
}
