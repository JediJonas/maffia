// @ts-check
import { useState } from 'react';
import { sortByName } from './playerName.js';
import { PlayerPicker } from './PlayerPicker.jsx';
import { ListCard } from './ListCard.jsx';
import { PersonRow } from './PersonRow.jsx';
import { describeNightProgress } from './progressText.js';
import { isMafia as isMafiaRole } from '../game/roles.js';

/** @type {Record<import('../game/types.js').Role, string>} */
const NIGHT_QUESTIONS = {
  mafia: 'Ni väljer vem som ska dö i natt.',
  godfather: 'Ni väljer vem som ska dö i natt.',
  detective: 'Du väljer vem du ska undersöka.',
  doctor: 'Du väljer vem du ska vaka över.',
  taxiDriver: 'Du väljer vem du ska följa.',
  windowWatcher: 'Du väljer vems hem du ska bevaka.',
  bartender: 'Du väljer vem du ska bjuda på en drink.',
  sausageVendor: 'Du väljer vem som ska få en korv.',
  mayor: 'I drömmen väljer du en misstänkt.',
  madman: 'I drömmen väljer du en misstänkt.',
  citizen: 'I drömmen väljer du en misstänkt.',
};

const BLIND_CHOICE_NOTE = 'Ditt val räknas inte, men alla väljer så att ingen ser vem som är vaken.';

/** @type {Record<import('../game/types.js').Role, string | null>} */
const NIGHT_NOTES = {
  mafia: null,
  godfather: null,
  detective: 'Du får veta om personen är maffia. Svaret får du när staden vaknar.',
  doctor: 'Du skyddar personen från maffian. Samma person får inte skyddas två nätter i rad.',
  taxiDriver: 'Du får veta vem personen besöker i natt. Svaret får du när staden vaknar.',
  windowWatcher: 'Du får veta vem som besöker personen i natt. Svaret får du när staden vaknar.',
  bartender: 'Personen misslyckas med sin uppgift i natt men märker inget.',
  sausageVendor: 'Med munnen full får personen inte prata i morgon, men den får rösta.',
  mayor: BLIND_CHOICE_NOTE,
  madman: BLIND_CHOICE_NOTE,
  citizen: BLIND_CHOICE_NOTE,
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
  // Natten slutar på det sista valet, innan värden hinner svara. Det egna
  // trycket syns ändå medan vyn tonar ut.
  const [sentChoice, setSentChoice] = useState(/** @type {string | null} */ (null));
  const progress = describeNightProgress(view.nightChosenCount, view.livingCount);
  if (!view.me.isAlive || !view.me.role) {
    return (
      <section aria-labelledby="phase-title">
        <p className="explanation">Du är ute ur spelet. Håll tyst och vänta på morgonen.</p>
        <p className="explanation">{progress}.</p>
      </section>
    );
  }

  const isMafia = isMafiaRole(view.me.role);
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
          players={sortByName(view.players.filter((p) => view.nightTargetIds.includes(p.id)))}
          selectableIds={view.nightTargetIds}
          selectedId={view.myNightChoice ?? sentChoice}
          onSelect={(targetId) => {
            setSentChoice(targetId);
            sendAction({ type: 'nightChoice', targetId });
          }}
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
