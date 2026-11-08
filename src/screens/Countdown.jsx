// @ts-check
import { useEffect, useState } from 'react';
import { writeNumber } from '../game/numberWords.js';

const SECOND_MS = 1000;

/**
 * Räknar ned till nästa steg, till exempel att rollen vänds fram. Värdens
 * telefon tar steget efter lika lång tid, så talet hamnar ungefär rätt på
 * alla telefoner. Talet skrivs med bokstäver, som i serierutorna.
 * @param {object} props
 * @param {number} props.durationMs
 * @param {string} props.label Till exempel "Rollen visas om".
 */
export function Countdown({ durationMs, label }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.round(durationMs / SECOND_MS));

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(1, s - 1)), SECOND_MS);
    return () => clearInterval(timer);
  }, []);

  // Alla texter ligger i samma ruta, men bara den aktuella syns. Då är rutan
  // lika bred som den bredaste texten hela tiden och ändrar inte bredd när
  // talet byts.
  const counts = Array.from({ length: Math.round(durationMs / SECOND_MS) }, (_, index) => index + 1);
  return (
    <span className="countdown">
      {counts.map((count) => (
        <span key={count} aria-hidden={count !== secondsLeft} className={count === secondsLeft ? undefined : 'countdown-hidden'}>
          {label} {writeNumber(count)} …
        </span>
      ))}
    </span>
  );
}
