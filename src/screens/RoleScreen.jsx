// @ts-check
import { preload } from 'react-dom';
import { ROLE_INFO } from '../game/roles.js';
import { ROLE_IMAGES } from '../scenes/describeScene.js';
import { SCENE_IMAGES } from '../scenes/sceneImages.js';
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
  const roleImageSrc = view.me.role ? SCENE_IMAGES[ROLE_IMAGES[view.me.role]].src : null;
  // Rollbilden laddas redan medan akten är stängd. Annars blir bildrutan
  // svart ett ögonblick när akten öppnas, innan bilden hunnit komma.
  if (roleImageSrc) preload(roleImageSrc, { as: 'image' });
  const teammates = view.players.filter((p) => p.id !== view.me.id && view.mafiaTeam.some((m) => m.id === p.id));

  /** Bilden avkodas innan akten öppnas, så att den byts utan att blinka. */
  function openRole() {
    if (!roleImageSrc) return;
    const image = new Image();
    image.src = roleImageSrc;
    image.decode().catch(() => {}).finally(() => setIsRoleShown(true));
  }

  function closeRole() {
    setIsRoleShown(false);
    if (!view.isReady) sendAction({ type: 'ready' });
  }

  if (isRoleShown && role) {
    return (
      <section className="screen" aria-labelledby="phase-title">
        <div className="screen-content">
          <p className="explanation">{role.description}</p>
          {teammates.map((teammate, index) => (
            <PersonRow
              key={teammate.id}
              player={teammate}
              text={`${teammate.name} är också maffia.`}
              speech={index === 0 && <>Vi gör det<br />tillsammans.</>}
            />
          ))}
        </div>
        <div className="bottom-actions">
          <button type="button" className="primary" onClick={closeRole}>Jag har sett min roll</button>
        </div>
      </section>
    );
  }
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <p className="explanation">Se till att ingen tittar över din axel. Öppna sedan akten.</p>
        {view.isReady && (
          <p className="explanation">Väntar på de andra. {capitalize(writeNumber(view.readyCount))} av {writeNumber(view.players.length)} har sett sin roll.</p>
        )}
      </div>
      <div className="bottom-actions">
        <button type="button" className="primary" onClick={openRole}>Visa min roll</button>
      </div>
    </section>
  );
}
