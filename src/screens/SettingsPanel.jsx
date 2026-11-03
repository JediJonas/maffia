// @ts-check
import { useState } from 'react';
import { MIN_PLAYERS } from '../game/roles.js';
import { MAFIA_COUNT_CHOICES, findSettingsProblem } from '../game/settings.js';

/** @typedef {import('../game/settings.js').GameSettings} GameSettings */

/**
 * Alla ser en sammanfattning. Värden öppnar formuläret med Ändra, så att lobbyn
 * blir kort och samma för alla, som i Låtquiz.
 * @param {object} props
 * @param {GameSettings} props.settings
 * @param {number} props.playerCount
 * @param {((changes: Partial<GameSettings>) => void) | null} props.onChange Null för de som inte är värd.
 */
export function SettingsPanel({ settings, playerCount, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const problem = playerCount >= MIN_PLAYERS ? findSettingsProblem(settings, playerCount) : null;
  return (
    <section className="settings" aria-labelledby="settings-title">
      <h2 id="settings-title">Inställningar</h2>
      {onChange && isEditing ? (
        <SettingsForm settings={settings} onChange={onChange} />
      ) : (
        <SettingsSummary settings={settings} />
      )}
      {onChange && (
        // Samma knapp byter text i stället för att bytas ut, så att fokus stannar kvar.
        <button
          type="button"
          className="secondary"
          aria-expanded={isEditing}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Klar' : 'Ändra inställningar'}
        </button>
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
    ['revealsRoleOnDeath', 'Avslöja rollen'],
    ['hasNarratorVoice', 'Berättarröst'],
  ];
  return (
    <div className="settings-form">
      <label htmlFor="mafia-count">Maffia</label>
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
      <li>Avslöja rollen: {settings.revealsRoleOnDeath ? 'ja' : 'nej'}</li>
      <li>Berättarröst: {settings.hasNarratorVoice ? 'ja' : 'nej'}</li>
    </ul>
  );
}
