// @ts-check
import { ROLE_INFO } from '../game/roles.js';
import { capitalize, writeNumber } from '../game/numberWords.js';
import { PersonRow } from './PersonRow.jsx';

/**
 * Först ligger rollen i en stängd akt. "Visa min roll" öppnar den, och
 * "Jag har sett min roll" stänger den igen, så att grannen inte hinner läsa
 * med. Akten går att öppna igen tills spelet startar.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 * @param {boolean} props.isRoleShown
 * @param {(isShown: boolean) => void} props.setIsRoleShown
 */
export function RoleScreen({ view, sendAction, isRoleShown, setIsRoleShown }) {
  const role = view.me.role ? ROLE_INFO[view.me.role] : null;
  const teammates = view.players.filter((p) => p.id !== view.me.id && view.mafiaTeam.some((m) => m.id === p.id));

  function closeRole() {
    setIsRoleShown(false);
    if (!view.isReady) sendAction({ type: 'ready' });
  }

  if (isRoleShown && role) {
    return (
      <section aria-labelledby="phase-title">
        <p>{role.description}</p>
        {teammates.map((teammate, index) => (
          <PersonRow
            key={teammate.id}
            player={teammate}
            text={`${teammate.name} är också maffia.`}
            speech={index === 0 && <>Vi gör det<br />tillsammans.</>}
          />
        ))}
        <div className="bottom-actions">
          <button type="button" className="primary" onClick={closeRole}>Jag har sett min roll</button>
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="phase-title">
      <p>Se till att ingen tittar över din axel. Öppna sedan akten.</p>
      {view.isReady && (
        <p>Väntar på de andra. {capitalize(writeNumber(view.readyCount))} av {writeNumber(view.players.length)} har sett sin roll.</p>
      )}
      <div className="bottom-actions">
        <button type="button" className="primary" onClick={() => setIsRoleShown(true)}>Visa min roll</button>
      </div>
    </section>
  );
}
