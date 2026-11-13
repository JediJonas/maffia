// @ts-check
import { MAX_PLAYERS, ROLE_INFO } from '../game/roles.js';
import { MAX_BOTS } from '../game/bots.js';
import { MAFIA_COUNT_CHOICES, OPTIONAL_ROLES, stepMafiaCount } from '../game/settings.js';
import { ListCard } from './ListCard.jsx';
import { describeLobbyStatus, findRoleProblem } from './lobbyText.js';

/** @typedef {import('../game/settings.js').GameSettings} GameSettings */

// Rollnamnen står i bestämd form där det bara finns en, som "Du är galningen".
// I listan står alla roller i obestämd form (Jonas 2026-11-07).
/** @type {Partial<Record<import('../game/types.js').Role, string>>} */
const SWITCH_LABELS = { godfather: 'Gudfader', madman: 'Galning' };

/** @param {import('../game/types.js').Role} role */
const labelOf = (role) => SWITCH_LABELS[role] ?? ROLE_INFO[role].name;

// Maffian väljs med en växlare i stället för en strömbrytare men står i samma lista.
/** @type {keyof GameSettings} */
const MAFIA_ROW = 'mafiaCount';

// Rollerna står i bokstavsordning, maffian och gudfadern med (Jonas 2026-11-13).
const ROLE_ROWS = /** @type {[keyof GameSettings, string][]} */ ([
  [MAFIA_ROW, labelOf('mafia')],
  ['hasGodfather', labelOf('godfather')],
  ...OPTIONAL_ROLES.map(([key, role]) => /** @type {[keyof GameSettings, string]} */ ([key, labelOf(role)])),
]).sort(([, a], [, b]) => a.localeCompare(b, 'sv'));

/**
 * Värdens inställningar i en egen vy, som Din figur, så att det finns plats
 * för fler. Varje ändring gäller direkt, och rutan under listan säger vilka
 * roller det blir. Går inställningarna inte ihop står det i den svarta rutan
 * ovanför Klar, precis som i lobbyn.
 * @param {object} props
 * @param {GameSettings} props.settings
 * @param {number} props.playerCount
 * @param {number} props.botCount
 * @param {(changes: Partial<GameSettings>) => void} props.onChange
 * @param {() => void} props.onAddBot
 * @param {() => void} props.onRemoveBot
 * @param {() => void} props.onClose
 */
export function SettingsEditor({ settings, playerCount, botCount, onChange, onAddBot, onRemoveBot, onClose }) {
  const problem = findRoleProblem(settings, playerCount);
  // Tom innan fyra har kommit, så att Inställningar inte upprepar det som står i lobbyn.
  const status = problem ? '' : describeLobbyStatus({ settings, playerCount, hostName: null });
  const isFirstChoice = settings.mafiaCount === MAFIA_COUNT_CHOICES[0];
  const isLastChoice = settings.mafiaCount === MAFIA_COUNT_CHOICES[MAFIA_COUNT_CHOICES.length - 1];
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <ListCard lead="Du bestämmer vilka som bor i staden." isLeadAbove>
          <ul className="settings-list">
            {ROLE_ROWS.map(([key, label]) => (key === MAFIA_ROW ? (
              <li key={key}>
                <span>{label}</span>
                <span className="stepper">
                  <button type="button" aria-label="Färre maffia" disabled={isFirstChoice} onClick={() => onChange({ mafiaCount: stepMafiaCount(settings.mafiaCount, -1) })}>‹</button>
                  <span className="stepper-value" aria-live="polite">{settings.mafiaCount === 'auto' ? 'Auto' : settings.mafiaCount}</span>
                  <button type="button" aria-label="Fler maffia" disabled={isLastChoice} onClick={() => onChange({ mafiaCount: stepMafiaCount(settings.mafiaCount, 1) })}>›</button>
                </span>
              </li>
            ) : (
              <SettingSwitch key={key} settingKey={key} label={label} settings={settings} onChange={onChange} />
            )))}
          </ul>
        </ListCard>
        {/* Botar och Avslöja rollen är inga roller, så de har en egen ruta under
            rollerna, som Rollbild i Din figur (Jonas 2026-11-13). Den står före
            förklaringen, så att den inte flyttar sig när förklaringen kommer och går. */}
        <ul className="settings-list settings-other">
          <li>
            <span>Botar</span>
            <span className="stepper">
              <button type="button" aria-label="Färre botar" disabled={botCount === 0} onClick={onRemoveBot}>‹</button>
              <span className="stepper-value" aria-live="polite">{botCount}</span>
              <button type="button" aria-label="Fler botar" disabled={botCount >= MAX_BOTS || playerCount >= MAX_PLAYERS} onClick={onAddBot}>›</button>
            </span>
          </li>
          <SettingSwitch settingKey="revealsRoleOnDeath" label="Avslöja rollen" settings={settings} onChange={onChange} />
        </ul>
        {status && <p className="explanation">{status}</p>}
      </div>
      {/* Problemet står ovanför knappen, som i lobbyn. Inne i screen-content
          skulle den vanliga rutans vita bakgrund göra den vita texten osynlig. */}
      <div className="bottom-actions">
        {problem && <p className="notice">{problem}</p>}
        <button type="button" className="primary" onClick={onClose}>Klar</button>
      </div>
    </section>
  );
}

/**
 * En rad med strömbrytare för en inställning som är på eller av.
 * @param {object} props
 * @param {keyof GameSettings} props.settingKey
 * @param {string} props.label
 * @param {GameSettings} props.settings
 * @param {(changes: Partial<GameSettings>) => void} props.onChange
 */
function SettingSwitch({ settingKey, label, settings, onChange }) {
  return (
    <li>
      <label htmlFor={`setting-${settingKey}`}>{label}</label>
      <input
        id={`setting-${settingKey}`}
        type="checkbox"
        role="switch"
        className="switch"
        checked={Boolean(settings[settingKey])}
        onChange={(event) => onChange({ [settingKey]: event.target.checked })}
      />
    </li>
  );
}
