// @ts-check
import { sortByName } from './playerName.js';
import { SKIP_VOTE } from '../game/rules.js';
import { describeVoteProgress } from './progressText.js';
import { describeDeath } from './deathText.js';
import { CaseFile } from './CaseFile.jsx';
import { buildCaseFile } from './caseFile.js';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';

// Rutan på listan är densamma för alla, levande som döda (Jonas 2026-11-08).
const VOTE_LEAD = 'Staden röstar om vem som ska förvisas.';

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
  // Borgmästarens röst räknas två gånger, och det syns när borgmästaren har röstat.
  const votesFor = (/** @type {string} */ id) => Object.entries(view.dayVotes)
    .filter(([, target]) => target === id)
    .reduce((sum, [voterId]) => sum + (view.doubleVoterIds.includes(voterId) ? 2 : 1), 0);
  // Röster på en själv syns också, men man kan inte rösta på sig själv.
  const listed = sortByName(living).filter((p) => p.id !== view.me.id || votesFor(p.id) > 0);
  const progress = describeVoteProgress(votedCount, living.length);
  /** @param {import('../game/playerView.js').PublicPlayer} player */
  const describeVotes = (player) => describeVoteCount(votesFor(player.id));
  const caseFile = buildCaseFile(view);

  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <MorningNews view={view} />
        <SilencedNews view={view} />
        {caseFile && <CaseFile key={view.round} content={caseFile} players={view.players} />}
        {view.me.isAlive ? (
          <ListCard lead={VOTE_LEAD} tag={progress} isTagCounting>
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
            <ListCard lead={VOTE_LEAD} tag={progress} isTagCounting>
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
 * En lugn natt står bara i bildrutan.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function MorningNews({ view }) {
  const killed = view.players.find((p) => p.id === view.lastNight?.killedId);
  if (!killed) return null;
  return <PersonRow player={killed} text={describeDeath(killed, view.me.id, 'mördad')} />;
}

/**
 * Den som fick korvgubbens korv får inte prata i dag. Alla ser vem det är,
 * så att staden kan hålla koll, och den själv får veta att den får rösta.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
function SilencedNews({ view }) {
  const silenced = view.players.find((p) => p.id === view.lastNight?.silencedId && p.isAlive);
  if (!silenced) return null;
  const isMe = silenced.id === view.me.id;
  return (
    <>
      <PersonRow
        player={silenced}
        text={isMe ? 'Du får inte prata i dag.' : `${silenced.name} får inte prata i dag.`}
        speech="Mmff …"
      />
      {isMe && <p className="explanation">Du har munnen full av korv och kan inte prata i dag, men du får rösta.</p>}
    </>
  );
}
