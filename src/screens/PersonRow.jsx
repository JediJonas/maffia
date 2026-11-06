// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { SpeechBubble } from './SpeechBubble.jsx';

const PERSON_AVATAR_PX = 112;

/**
 * En stor figur med en textruta som går in under cirkeln, och ibland en
 * pratbubbla. Som när serien zoomar in på en person.
 * @param {object} props
 * @param {{ id: string, avatar: import('../avatar/avatarParts.js').Avatar | null }} props.player
 * @param {string} props.text
 * @param {import('react').ReactNode} [props.speech] Vad personen säger i bubblan.
 */
export function PersonRow({ player, text, speech }) {
  return (
    <div className="person-row">
      {speech && <SpeechBubble className="person-speech">{speech}</SpeechBubble>}
      <PlayerAvatar player={player} sizePx={PERSON_AVATAR_PX} />
      <p className="person-text">{text}</p>
    </div>
  );
}
