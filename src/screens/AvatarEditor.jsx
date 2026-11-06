// @ts-check
import { AVATAR_PARTS, NO_CHOICE, createRandomAvatar, stepAvatarPart } from '../avatar/avatarParts.js';
import { LARGE_AVATAR_PX, PlayerAvatar } from './PlayerAvatar.jsx';

/** @typedef {import('../avatar/avatarParts.js').Avatar} Avatar */
/** @typedef {import('../avatar/avatarParts.js').AvatarPart} AvatarPart */

/**
 * Växlare för varje del av avataren. Varje ändring gäller direkt, så att de
 * andra i lobbyn ser den nya avataren medan man bläddrar.
 * @param {object} props
 * @param {string} props.playerId
 * @param {Avatar} props.avatar
 * @param {(avatar: Avatar) => void} props.onChange
 * @param {() => void} props.onClose
 */
export function AvatarEditor({ playerId, avatar, onChange, onClose }) {
  return (
    <section className="avatar-editor" aria-labelledby="avatar-editor-title">
      <h2 id="avatar-editor-title">Din figur</h2>
      <div className="avatar-preview">
        <PlayerAvatar player={{ id: playerId, avatar }} sizePx={LARGE_AVATAR_PX} />
      </div>
      <button type="button" className="secondary" onClick={() => onChange(createRandomAvatar(Math.random))}>
        Slumpa fram figur
      </button>
      <ul className="avatar-parts">
        {AVATAR_PARTS.map((part) => (
          <li key={part.key}>
            <span className="avatar-part-label">{part.label}</span>
            <button type="button" aria-label={`Föregående ${part.label.toLowerCase()}`} onClick={() => onChange(stepAvatarPart(avatar, part.key, -1))}>‹</button>
            <PartValue part={part} value={avatar[part.key]} />
            <button type="button" aria-label={`Nästa ${part.label.toLowerCase()}`} onClick={() => onChange(stepAvatarPart(avatar, part.key, 1))}>›</button>
          </li>
        ))}
      </ul>
      <button type="button" className="secondary" onClick={onClose}>Klar</button>
    </section>
  );
}

/**
 * Formerna visas som platsen i listan, eftersom de saknar namn.
 * @param {{ part: AvatarPart, value: string }} props
 */
function PartValue({ part, value }) {
  if (value === NO_CHOICE) return <span className="avatar-part-value">Nej</span>;
  const choices = part.kind === 'optional' ? part.choices.slice(1) : part.choices;
  return <span className="avatar-part-value">{choices.indexOf(value) + 1} av {choices.length}</span>;
}
