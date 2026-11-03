// @ts-check
import { ROLE_INFO } from '../game/roles.js';
import { LARGE_AVATAR_PX, PlayerAvatar } from './PlayerAvatar.jsx';
import { RoleCountdown } from './RoleCountdown.jsx';
import { VoteTally } from './VoteTally.jsx';

/**
 * Pausen efter omröstningen, så att alla hinner se utfallet. Värden
 * bestämmer när det blir natt.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls | null} props.host
 */
export function VerdictScreen({ view, host }) {
  const executed = view.players.find((p) => p.id === view.lastDay?.executedId);
  return (
    <section aria-labelledby="verdict-title">
      <h1 id="verdict-title">Domslut</h1>
      <div className="secret-card verdict-card">
        {executed ? (
          <>
            <PlayerAvatar player={executed} sizePx={LARGE_AVATAR_PX} isDead />
            <p className="secret-headline">{executed.id === view.me.id ? 'Du' : executed.name} åkte ut</p>
            {executed.revealedRole && <p>{executed.name} var {ROLE_INFO[executed.revealedRole].name.toLowerCase()}.</p>}
            {view.isRoleRevealPending && <RoleCountdown />}
          </>
        ) : (
          <p className="secret-headline">Ingen åkte ut</p>
        )}
      </div>
      <VoteTally view={view} title="Så röstade staden" />
      {!view.isRoleRevealPending && (host
        // Samma knapp oavsett om spelet är avgjort, så att värden inte ser
        // resultatet före de andra.
        ? <button type="button" className="primary" onClick={host.endVerdict}>Fortsätt</button>
        : <p className="muted">Värden fortsätter när alla är redo.</p>)}
    </section>
  );
}

