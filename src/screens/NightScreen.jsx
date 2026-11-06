// @ts-check
import { PlayerPicker } from './PlayerPicker.jsx';
import { capitalize, writeNumber } from '../game/numberWords.js';

/** @type {Record<import('../game/types.js').Role, string>} */
const NIGHT_INSTRUCTIONS = {
  mafia: 'Välj vem maffian ska mörda. Ni måste välja samma person.',
  detective: 'Välj vem du vill undersöka. Svaret får du när staden vaknar.',
  doctor: 'Välj vem du vill skydda i natt.',
  citizen: 'Välj vem du misstänker mest.',
};

/**
 * Alla levande gör ett val, även medborgare, så att ingen avslöjas av att
 * sitta still med telefonen. Medborgarens val används inte. Ett tryck är
 * valet, och natten tar slut av sig själv när alla har valt.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function NightScreen({ view, sendAction }) {
  const progress = <p className="muted">{describeNightProgress(view)}</p>;
  if (!view.me.isAlive) {
    return (
      <section aria-labelledby="phase-title">
        <p>Du är ute ur spelet. Håll tyst och vänta på morgonen.</p>
        {progress}
      </section>
    );
  }

  const nameOf = (/** @type {string | null} */ id) => view.players.find((p) => p.id === id)?.name;
  /** @param {import('../game/playerView.js').PublicPlayer} player */
  function describeTeamChoices(player) {
    const choosers = view.mafiaTeam.filter((m) => m.choiceId === player.id).map((m) => nameOf(m.id));
    return choosers.length ? `vald av ${choosers.join(', ')}` : null;
  }

  return (
    <section aria-labelledby="phase-title">
      <p>{view.me.role && NIGHT_INSTRUCTIONS[view.me.role]}</p>
      <PlayerPicker
        players={view.players}
        selectableIds={view.nightTargetIds}
        selectedId={view.myNightChoice}
        onSelect={(targetId) => sendAction({ type: 'nightChoice', targetId })}
        describe={view.mafiaTeam.length ? describeTeamChoices : undefined}
      />
      {view.mafiaTeam.length > 0 && view.myNightChoice && (
        <p>{view.hasMafiaAgreed ? 'Ni är överens.' : 'Ni har valt olika.'}</p>
      )}
      {progress}
    </section>
  );
}

/**
 * @param {import('../game/playerView.js').PlayerView} view
 * @returns {string} Till exempel "Tre av fem har valt."
 */
function describeNightProgress(view) {
  return capitalize(`${writeNumber(view.nightChosenCount)} av ${writeNumber(view.livingCount)} har valt.`);
}
