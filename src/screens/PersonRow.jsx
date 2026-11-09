// @ts-check
import { useState } from 'react';
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
 * @param {boolean} [props.isDead] Kryss över figuren, som för maffiakamraten som är borta.
 * @param {boolean} [props.hasWideText] Textrutan har nedräkningens fasta bredd. Bara medan den räknar ned, så att andra texter får den bredd de behöver.
 */
export function PersonRow({ player, text, speech, reservesSpeech = false, isDead = false, hasWideText = false }) {
  // En bubbla som finns från början väntar in figuren. En som kommer senare,
  // som i domslutet, har bara sin vanliga fördröjning.
  const [isSpeakingOnArrival] = useState(Boolean(speech));
  return (
    <div className={speech || reservesSpeech ? 'person-row person-row-speaking' : 'person-row'}>
      {speech && (
        <SpeechBubble className={isSpeakingOnArrival ? 'person-speech person-speech-with-figure' : 'person-speech'}>
          {speech}
        </SpeechBubble>
      )}
      <div className="person-figure">
        <PlayerAvatar player={player} sizePx={PERSON_AVATAR_PX} isDead={isDead} />
        <p className={hasWideText ? 'person-text person-text-wide' : 'person-text'}>{text}</p>
      </div>
    </div>
  );
}
