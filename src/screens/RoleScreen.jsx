// @ts-check
import { useState } from 'react';
import { ROLE_INFO } from '../game/roles.js';

/**
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function RoleScreen({ view, sendAction }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const role = view.me.role ? ROLE_INFO[view.me.role] : null;
  const teammates = view.players.filter((p) => view.mafiaTeam.some((m) => m.id === p.id));

  return (
    <section aria-labelledby="role-title">
      <h1 id="role-title">Din roll</h1>
      <p className="muted">Se till att ingen annan tittar på din skärm.</p>
      {isRevealed && role ? (
        <div className="role-card">
          <p className="role-name">{role.name}</p>
          <p>{role.description}</p>
          {teammates.length > 0 && <p>Din maffia: {teammates.map((p) => p.name).join(', ')}</p>}
          <button type="button" onClick={() => setIsRevealed(false)}>Dölj</button>
        </div>
      ) : (
        <button type="button" className="role-card role-hidden" onClick={() => setIsRevealed(true)}>
          Tryck för att se din roll
        </button>
      )}
      {view.isReady ? (
        <p>Väntar på de andra ({view.readyCount} av {view.players.length} klara).</p>
      ) : (
        <button type="button" className="primary" onClick={() => sendAction({ type: 'ready' })}>
          Jag har sett min roll
        </button>
      )}
    </section>
  );
}
