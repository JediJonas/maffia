// @ts-check
import { MIN_PLAYERS } from '../game/roles.js';
import { MAFIA_COUNT_CHOICES, buildRoleList, findSettingsProblem } from '../game/settings.js';

/** @typedef {import('../game/settings.js').GameSettings} GameSettings */

/**
 * Värden ändrar inställningarna, de andra ser vad som gäller.
 * @param {object} props
 * @param {GameSettings} props.settings
 * @param {number} props.playerCount
 * @param {((changes: Partial<GameSettings>) => void) | null} props.onChange Null för de som inte är värd.
 */
export function SettingsPanel({ settings, playerCount, onChange }) {
  const problem = playerCount >= MIN_PLAYERS ? findSettingsProblem(settings, playerCount) : null;
  return (
    <section className="settings" aria-labelledby="settings-title">
      <h2 id="settings-title">Inställningar</h2>
      {onChange ? <SettingsForm settings={settings} onChange={onChange} /> : <SettingsSummary settings={settings} />}
      {playerCount >= MIN_PLAYERS && !problem && (
        <p className="muted">Roller: {describeRoles(buildRoleList(settings, playerCount))}.</p>
      )}
      {problem && <p className="notice">{problem}</p>}
    </section>
  );
}

/**
 * @param {{ settings: GameSettings, onChange: (changes: Partial<GameSettings>) => void }} props
 */
function SettingsForm({ settings, onChange }) {
  /** @type {[keyof GameSettings, string][]} */
  const toggles = [
    ['hasDetective', 'Detektiv'],
    ['hasDoctor', 'Läkare'],
    ['revealsRoleOnDeath', 'Visa rollen när någon dör'],
    ['hasNarratorVoice', 'Berättarröst från värdens telefon'],
  ];
  return (
    <div className="settings-form">
      <label htmlFor="mafia-count">Antal maffia</label>
      <select
        id="mafia-count"
        value={String(settings.mafiaCount)}
        onChange={(event) => {
          const value = event.target.value;
          onChange({ mafiaCount: value === 'auto' ? 'auto' : Number(value) });
        }}
      >
        {MAFIA_COUNT_CHOICES.map((choice) => (
          <option key={choice} value={String(choice)}>
            {choice === 'auto' ? 'Automatiskt (en per fyra spelare)' : choice}
          </option>
        ))}
      </select>
      {toggles.map(([key, label]) => (
        <label key={key} className="toggle">
          <input
            type="checkbox"
            checked={Boolean(settings[key])}
            onChange={(event) => onChange({ [key]: event.target.checked })}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

/** @param {{ settings: GameSettings }} props */
function SettingsSummary({ settings }) {
  return (
    <ul className="settings-summary">
      <li>Maffia: {settings.mafiaCount === 'auto' ? 'automatiskt' : settings.mafiaCount}</li>
      <li>Detektiv: {settings.hasDetective ? 'ja' : 'nej'}</li>
      <li>Läkare: {settings.hasDoctor ? 'ja' : 'nej'}</li>
      <li>Rollen visas när någon dör: {settings.revealsRoleOnDeath ? 'ja' : 'nej'}</li>
      <li>Berättarröst: {settings.hasNarratorVoice ? 'ja' : 'nej'}</li>
    </ul>
  );
}

/**
 * @param {import('../game/types.js').Role[]} roles
 * @returns {string} Till exempel "1 maffia, detektiv, läkare och 2 medborgare".
 */
function describeRoles(roles) {
  const count = (/** @type {string} */ role) => roles.filter((r) => r === role).length;
  const parts = [
    `${count('mafia')} maffia`,
    count('detective') ? 'detektiv' : null,
    count('doctor') ? 'läkare' : null,
    count('citizen') ? `${count('citizen')} medborgare` : null,
  ].filter((part) => part !== null);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} och ${parts[parts.length - 1]}` : parts[0];
}
