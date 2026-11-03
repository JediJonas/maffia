// @ts-check
import { useEffect, useState } from 'react';

const SECOND_MS = 1000;

/**
 * Räknar ned till nästa steg, till exempel att rollen vänds fram. Värdens
 * telefon tar steget efter lika lång tid, så siffran hamnar ungefär rätt på
 * alla telefoner.
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

  return <p className="countdown">{label} {secondsLeft} …</p>;
}
