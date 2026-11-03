// @ts-check
import { useEffect, useState } from 'react';
import { ROLE_REVEAL_DELAY_MS } from '../game/deathReveal.js';

const SECOND_MS = 1000;

/**
 * Räknar ned till att rollen vänds fram. Värdens telefon vänder fram den
 * efter lika lång tid, så siffran hamnar ungefär rätt på alla telefoner.
 */
export function RoleCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(Math.round(ROLE_REVEAL_DELAY_MS / SECOND_MS));

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(1, s - 1)), SECOND_MS);
    return () => clearInterval(timer);
  }, []);

  return <p className="countdown">Rollen visas om {secondsLeft} …</p>;
}
