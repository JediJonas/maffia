// @ts-check
import { AVATAR_PARTS, NO_CHOICE, createRandomAvatar, stepAvatarPart } from '../avatar/avatarParts.js';
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { SpeechBubble } from './SpeechBubble.jsx';

/** @typedef {import('../avatar/avatarParts.js').Avatar} Avatar */
/** @typedef {import('../avatar/avatarParts.js').AvatarPart} AvatarPart */

const EDITOR_AVATAR_PX = 112;

/**
 * Växlare för varje del av figuren. Varje ändring gäller direkt, så att de
 * andra i lobbyn ser den nya figuren medan man bläddrar.
 * @param {object} props
 * @param {string} props.playerId
 * @param {Avatar} props.avatar
 * @param {(avatar: Avatar) => void} props.onChange
 * @param {() => void} props.onClose
 */
export function AvatarEditor({ playerId, avatar, onChange, onClose }) {
  return (
    <section className="avatar-editor" aria-labelledby="phase-title">
      <div className="avatar-editor-head">
        <PlayerAvatar player={{ id: playerId, avatar }} sizePx={EDITOR_AVATAR_PX} />
        <SpeechBubble>Hur ska jag<br />se ut?</SpeechBubble>
        <button type="button" className="row-button avatar-shuffle" onClick={() => onChange(createRandomAvatar(Math.random))}>
          Slumpa figur
        </button>
      </div>
      <ul className="avatar-parts">
        {AVATAR_PARTS.map((part) => (
          <li key={part.key}>
            <span>{part.label}</span>
            <span className="avatar-part-stepper">
              <button type="button" aria-label={`Föregående ${part.label.toLowerCase()}`} onClick={() => onChange(stepAvatarPart(avatar, part.key, -1))}>‹</button>
              <PartValue part={part} value={avatar[part.key]} />
              <button type="button" aria-label={`Nästa ${part.label.toLowerCase()}`} onClick={() => onChange(stepAvatarPart(avatar, part.key, 1))}>›</button>
            </span>
          </li>
        ))}
      </ul>
      <div className="bottom-actions">
        <button type="button" className="primary" onClick={onClose}>Klar</button>
      </div>
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
