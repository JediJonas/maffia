// @ts-check
import { Fragment } from 'react';
import { ROLE_REVEAL_DELAY_MS, VERDICT_PAUSE_MS } from '../game/deathReveal.js';
import { SKIP_VOTE } from '../game/rules.js';
import { tallyVotes } from '../game/voteTally.js';
import { capitalize, writeNumber } from '../game/numberWords.js';
import { Countdown } from './Countdown.jsx';
import { describeDeath, writeLastWords } from './deathText.js';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { PlayerPicker } from './PlayerPicker.jsx';

/**
 * Pausen efter omröstningen, så att alla hinner se utfallet. Spelet går
 * vidare av sig självt efter en nedräkning.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
export function VerdictScreen({ view }) {
  const executed = view.players.find((p) => p.id === view.lastDay?.executedId);
  const lastWords = executed && writeLastWords(executed);
  const rows = tallyVotes(view.dayVotes, view.players.map((p) => p.id));
  const nameOf = (/** @type {string} */ id) => view.players.find((p) => p.id === id)?.name ?? '';
  const voted = rows.filter((row) => row.targetId !== SKIP_VOTE);
  const skipCount = rows.find((row) => row.targetId === SKIP_VOTE)?.voterIds.length ?? 0;
  /** @param {import('../game/playerView.js').PublicPlayer} player */
  const describeVoters = (player) => voted.find((row) => row.targetId === player.id)?.voterIds
    .map((id) => (view.doubleVoterIds.includes(id) ? `${nameOf(id)} ×2` : nameOf(id))).join(', ') ?? null;

  return (
    <section aria-labelledby="phase-title">
      {executed && (
        <PersonRow
          player={executed}
          speech={lastWords && lastWords.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}
          reservesSpeech={view.settings.revealsRoleOnDeath}
          hasWideText
          text={view.isRoleRevealPending
            ? <Countdown durationMs={ROLE_REVEAL_DELAY_MS} label="Rollen visas om" />
            : describeDeath(executed, view.me.id, 'förvisad', { showsRoleToAll: true })}
        />
      )}
      {voted.length > 0 ? (
        <ListCard lead="Så röstade staden." tag={skipCount ? capitalize(`${writeNumber(skipCount)} avstod`) : null}>
          <PlayerPicker
            players={voted.map((row) => view.players.find((p) => p.id === row.targetId)).filter((p) => p !== undefined)}
            describe={describeVoters}
            showsDead={false}
          />
        </ListCard>
      ) : (
        <p>Alla avstod från att rösta.</p>
      )}
      {/* Samma text oavsett om spelet är avgjort, så att ingen ser resultatet i förväg. */}
      {!view.isRoleRevealPending && <p className="explanation"><Countdown durationMs={VERDICT_PAUSE_MS} label="Spelet fortsätter om" /></p>}
    </section>
  );
}
