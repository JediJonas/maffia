// @ts-check
import { PlayerPicker } from './PlayerPicker.jsx';

/** @type {Record<import('../game/types.js').Role, string>} */
const NIGHT_INSTRUCTIONS = {
  mafia: 'Välj vem maffian ska döda. Ni måste välja samma person.',
  detective: 'Välj vem du vill undersöka. Svaret får du när staden vaknar.',
  doctor: 'Välj vem du vill skydda i natt.',
  citizen: 'Välj vem du misstänker mest.',
};

/**
 * Alla levande gör ett val, även medborgare, så att ingen avslöjas av att
 * sitta still med telefonen. Medborgarens val används inte.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function NightScreen({ view, sendAction }) {
  const progress = <p className="muted">{view.nightDoneCount} av {view.livingCount} är klara.</p>;
  if (!view.me.isAlive) {
    return (
      <section aria-labelledby="night-title">
        <h1 id="night-title">Natt {view.round}</h1>
        <p>Du är död. Håll tyst och vänta på morgonen.</p>
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
    <section aria-labelledby="night-title">
      <h1 id="night-title">Natt {view.round}</h1>
      <p>{view.me.role && NIGHT_INSTRUCTIONS[view.me.role]}</p>
      <PlayerPicker
        players={view.players}
        selectableIds={view.nightTargetIds}
        selectedId={view.myNightChoice}
        onSelect={(targetId) => sendAction({ type: 'nightChoice', targetId })}
        describe={view.mafiaTeam.length ? describeTeamChoices : undefined}
      />
      {view.isNightDone ? (
        <p>Klart. Väntar på de andra.</p>
      ) : (
        <button
          type="button"
          className="primary"
          disabled={!view.canConfirmNight}
          onClick={() => sendAction({ type: 'nightDone' })}
        >
          Bekräfta
        </button>
      )}
      {progress}
    </section>
  );
}
