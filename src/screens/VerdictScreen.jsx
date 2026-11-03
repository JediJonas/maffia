// @ts-check
import { ROLE_INFO } from '../game/roles.js';
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
            <p className="secret-headline">{executed.id === view.me.id ? 'Du' : executed.name} åkte ut</p>
            {executed.revealedRole && <p>{executed.name} var {ROLE_INFO[executed.revealedRole].name.toLowerCase()}.</p>}
          </>
        ) : (
          <p className="secret-headline">Ingen åkte ut</p>
        )}
      </div>
      <VoteTally view={view} title="Så röstade staden" />
      {host && <VerdictHostButton view={view} host={host} />}
      {!host && (
        <p className="muted">
          {view.canShowDeathRole ? 'Värden visar snart rollen …' : 'Värden fortsätter när alla är redo.'}
        </p>
      )}
    </section>
  );
}

/**
 * Först vänds rollen fram, sedan blir det natt.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {import('../host/useHostGame.js').HostControls} props.host
 */
function VerdictHostButton({ view, host }) {
  if (view.canShowDeathRole) {
    return <button type="button" className="primary" onClick={host.showDeathRole}>Visa rollen</button>;
  }
  // Samma knapp oavsett om spelet är avgjort, så att värden inte ser
  // resultatet före de andra.
  return <button type="button" className="primary" onClick={host.endVerdict}>Fortsätt</button>;
}
