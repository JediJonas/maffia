// @ts-check
import { MAX_PLAYERS, MIN_PLAYERS, ROLE_INFO } from '../game/roles.js';
import { MAX_BOTS } from '../game/bots.js';
import { MAFIA_COUNT_CHOICES, OPTIONAL_ROLES, findSettingsProblem, stepMafiaCount } from '../game/settings.js';
import { ListCard } from './ListCard.jsx';
import { describeLobbyStatus } from './lobbyText.js';

/** @typedef {import('../game/settings.js').GameSettings} GameSettings */

// Gudfadern står bland stadens roller i listan, fast han tar en av maffians platser.
const GODFATHER_POSITION = OPTIONAL_ROLES.findIndex(([, role]) => role === 'mayor');

// Rollnamnen står i bestämd form där det bara finns en, som "Du är galningen".
// I listan står alla roller i obestämd form (Jonas 2026-11-07).
/** @type {Partial<Record<import('../game/types.js').Role, string>>} */
const SWITCH_LABELS = { godfather: 'Gudfader', madman: 'Galning' };

/** @param {import('../game/types.js').Role} role */
const labelOf = (role) => SWITCH_LABELS[role] ?? ROLE_INFO[role].name;

/** @type {[keyof GameSettings, string][]} */
const ROLE_SWITCHES = OPTIONAL_ROLES.map(([key, role]) => [key, labelOf(role)]);

/** @type {[keyof GameSettings, string][]} */
const SWITCHES = [
  ...ROLE_SWITCHES.slice(0, GODFATHER_POSITION),
  ['hasGodfather', labelOf('godfather')],
  ...ROLE_SWITCHES.slice(GODFATHER_POSITION),
  ['revealsRoleOnDeath', 'Avslöja rollen'],
];

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
  const problem = playerCount >= MIN_PLAYERS ? findSettingsProblem(settings, playerCount) : null;
  const isFirstChoice = settings.mafiaCount === MAFIA_COUNT_CHOICES[0];
  const isLastChoice = settings.mafiaCount === MAFIA_COUNT_CHOICES[MAFIA_COUNT_CHOICES.length - 1];
  return (
    <section className="screen" aria-labelledby="phase-title">
      <div className="screen-content">
        <ListCard lead="Du bestämmer vilka som bor i staden.">
          <ul className="settings-list">
            <li>
              <span>Maffia</span>
              <span className="stepper">
                <button type="button" aria-label="Färre maffia" disabled={isFirstChoice} onClick={() => onChange({ mafiaCount: stepMafiaCount(settings.mafiaCount, -1) })}>‹</button>
                <span className="stepper-value" aria-live="polite">{settings.mafiaCount === 'auto' ? 'Auto' : settings.mafiaCount}</span>
                <button type="button" aria-label="Fler maffia" disabled={isLastChoice} onClick={() => onChange({ mafiaCount: stepMafiaCount(settings.mafiaCount, 1) })}>›</button>
              </span>
            </li>
            <li>
              <span>Botar</span>
              <span className="stepper">
                <button type="button" aria-label="Färre botar" disabled={botCount === 0} onClick={onRemoveBot}>‹</button>
                <span className="stepper-value" aria-live="polite">{botCount}</span>
                <button type="button" aria-label="Fler botar" disabled={botCount >= MAX_BOTS || playerCount >= MAX_PLAYERS} onClick={onAddBot}>›</button>
              </span>
            </li>
            {SWITCHES.map(([key, label]) => (
              <li key={key}>
                <label htmlFor={`setting-${key}`}>{label}</label>
                <input
                  id={`setting-${key}`}
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={Boolean(settings[key])}
                  onChange={(event) => onChange({ [key]: event.target.checked })}
                />
              </li>
            ))}
          </ul>
        </ListCard>
        {!problem && <p className="explanation">{describeLobbyStatus({ settings, playerCount, hostName: null })}</p>}
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
