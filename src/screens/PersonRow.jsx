// @ts-check
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { SpeechBubble } from './SpeechBubble.jsx';

const PERSON_AVATAR_PX = 112;

/**
 * En stor figur med en textruta som går in under cirkeln, och ibland en
 * pratbubbla. Som när serien zoomar in på en person.
 * @param {object} props
 * @param {{ id: string, avatar: import('../avatar/avatarParts.js').Avatar | null }} props.player
 * @param {import('react').ReactNode} props.text
 * @param {import('react').ReactNode} [props.speech] Vad personen säger i bubblan.
 * @param {boolean} [props.reservesSpeech] Plats för en bubbla som visas senare, så att sidan inte hoppar.
 */
export function PersonRow({ player, text, speech, reservesSpeech = false }) {
  return (
    <div className={speech || reservesSpeech ? 'person-row person-row-speaking' : 'person-row'}>
      {speech && <SpeechBubble className="person-speech">{speech}</SpeechBubble>}
      <div className="person-figure">
        <PlayerAvatar player={player} sizePx={PERSON_AVATAR_PX} />
        <p className="person-text">{text}</p>
      </div>
    </div>
  );
}
