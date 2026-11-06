// @ts-check
import { PlayerPicker } from './PlayerPicker.jsx';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { capitalize, writeNumber } from '../game/numberWords.js';

/** @type {Record<import('../game/types.js').Role, string>} */
const NIGHT_QUESTIONS = {
  mafia: 'Ni väljer vem som ska dö i natt.',
  detective: 'Du väljer vem du ska undersöka.',
  doctor: 'Du väljer vem du ska vaka över.',
  citizen: 'I drömmen väljer du en misstänkt.',
};

/** @type {Record<import('../game/types.js').Role, string | null>} */
const NIGHT_NOTES = {
  mafia: null,
  detective: 'Du får veta om personen är maffia. Svaret får du när staden vaknar.',
  doctor: 'Du skyddar personen från maffian. Du får inte skydda samma person två nätter i rad.',
  citizen: 'Ditt val räknas inte, men alla väljer så att ingen kan se vem som är vaken och vem som sover.',
};

/**
 * Alla levande gör ett val, även stadsbor, så att ingen avslöjas av att
 * sitta still med telefonen. Stadsbons val används inte. Ett tryck är
 * valet, och natten tar slut av sig själv när alla har valt.
 * @param {object} props
 * @param {import('../game/playerView.js').PlayerView} props.view
 * @param {(action: import('../game/types.js').PlayerAction) => void} props.sendAction
 */
export function NightScreen({ view, sendAction }) {
  const progress = capitalize(`${writeNumber(view.nightChosenCount)} av ${writeNumber(view.livingCount)} är klara`);
  if (!view.me.isAlive || !view.me.role) {
    return (
      <section aria-labelledby="phase-title">
        <p className="explanation">Du är ute ur spelet. Håll tyst och vänta på morgonen.</p>
        <p className="explanation">{progress}.</p>
      </section>
    );
  }

  const isMafia = view.me.role === 'mafia';
  const nameOf = (/** @type {string | null} */ id) => view.players.find((p) => p.id === id)?.name ?? '';
  /** @param {import('../game/playerView.js').PublicPlayer} player */
  function describeTeamChoices(player) {
    const choosers = view.mafiaTeam.filter((m) => m.choiceId === player.id).map((m) => nameOf(m.id));
    return choosers.length ? choosers.join(', ') : null;
  }
  const note = NIGHT_NOTES[view.me.role];

  return (
    <section aria-labelledby="phase-title">
      <ListCard lead={NIGHT_QUESTIONS[view.me.role]} tag={isMafia ? describeMafiaTag(view) ?? progress : progress}>
        <PlayerPicker
          players={view.players.filter((p) => view.nightTargetIds.includes(p.id))}
          selectableIds={view.nightTargetIds}
          selectedId={view.myNightChoice}
          onSelect={(targetId) => sendAction({ type: 'nightChoice', targetId })}
          describe={isMafia ? describeTeamChoices : undefined}
        />
      </ListCard>
      {note && <p className="explanation">{note}</p>}
      {view.mafiaTeam.map((teammate) => {
        const player = view.players.find((p) => p.id === teammate.id);
        if (!player) return null;
        return (
          <PersonRow
            key={teammate.id}
            player={player}
            text={`${player.name} är med dig.`}
            speech={teammate.choiceId && <>Jag väljer<br />{nameOf(teammate.choiceId)}.</>}
          />
        );
      })}
    </section>
  );
}

/**
 * @param {import('../game/playerView.js').PlayerView} view
 * @returns {string | null} Om maffian är överens, när jag har valt.
 */
function describeMafiaTag(view) {
  if (!view.myNightChoice || !view.mafiaTeam.length) return null;
  return view.hasMafiaAgreed ? 'Ni är överens' : 'Ni har valt olika';
}
