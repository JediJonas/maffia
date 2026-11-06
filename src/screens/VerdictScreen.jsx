// @ts-check
import { ROLE_INFO } from '../game/roles.js';
import { LARGE_AVATAR_PX, PlayerAvatar } from './PlayerAvatar.jsx';
import { ROLE_REVEAL_DELAY_MS, VERDICT_PAUSE_MS } from '../game/deathReveal.js';
import { Countdown } from './Countdown.jsx';
import { VoteTally } from './VoteTally.jsx';

/**
 * Pausen efter omröstningen, så att alla hinner se utfallet. Spelet går
 * vidare av sig självt efter en nedräkning.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
export function VerdictScreen({ view }) {
  const executed = view.players.find((p) => p.id === view.lastDay?.executedId);
  return (
    <section aria-labelledby="phase-title">
      <div className="secret-card verdict-card">
        {executed ? (
          <>
            <PlayerAvatar player={executed} sizePx={LARGE_AVATAR_PX} isDead />
            <p className="secret-headline">{executed.id === view.me.id ? 'Du' : executed.name} blev utvisad</p>
            {executed.revealedRole && <p>{executed.name} var {ROLE_INFO[executed.revealedRole].name.toLowerCase()}.</p>}
            {view.isRoleRevealPending && <Countdown durationMs={ROLE_REVEAL_DELAY_MS} label="Rollen visas om" />}
          </>
        ) : (
          <p className="secret-headline">Ingen blev utvisad</p>
        )}
      </div>
      <VoteTally view={view} title="Så röstade staden" />
      {/* Samma text oavsett om spelet är avgjort, så att ingen ser resultatet i förväg. */}
      {!view.isRoleRevealPending && <Countdown durationMs={VERDICT_PAUSE_MS} label="Spelet fortsätter om" />}
    </section>
  );
}

