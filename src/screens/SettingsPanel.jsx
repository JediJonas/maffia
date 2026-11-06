// @ts-check
import { useState } from 'react';
import { MIN_PLAYERS } from '../game/roles.js';
import { MAFIA_COUNT_CHOICES, findSettingsProblem } from '../game/settings.js';

/** @typedef {import('../game/settings.js').GameSettings} GameSettings */

/**
 * Värdens inställningar, bakom en knapp så att lobbyn hålls kort. Rutan
 * under spelarlistan berättar för alla vilka roller det blir.
 * @param {object} props
 * @param {GameSettings} props.settings
 * @param {number} props.playerCount
 * @param {(changes: Partial<GameSettings>) => void} props.onChange
 */
export function SettingsPanel({ settings, playerCount, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const problem = playerCount >= MIN_PLAYERS ? findSettingsProblem(settings, playerCount) : null;
  return (
    <>
      {isEditing && <SettingsForm settings={settings} onChange={onChange} />}
      {problem && <p className="notice">{problem}</p>}
      {/* Samma knapp byter text i stället för att bytas ut, så att fokus stannar kvar. */}
      <button type="button" className="secondary" aria-expanded={isEditing} onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Klar' : 'Inställningar'}
      </button>
    </>
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
