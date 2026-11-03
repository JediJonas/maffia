// @ts-check
import { useState } from 'react';

/**
 * Hemlig information som man själv trycker fram och döljer igen, så att
 * grannen inte hinner läsa med. Används för rollen och detektivens svar.
 * @param {object} props
 * @param {string} props.revealLabel Texten på kortet innan det har vänts.
 * @param {import('react').ReactNode} props.children
 */
export function SecretCard({ revealLabel, children }) {
  const [isRevealed, setIsRevealed] = useState(false);
  if (!isRevealed) {
    return (
      <button type="button" className="secret-card secret-hidden" onClick={() => setIsRevealed(true)}>
        {revealLabel}
      </button>
    );
  }
  return (
    <div className="secret-card">
      {children}
      <button type="button" onClick={() => setIsRevealed(false)}>Dölj</button>
    </div>
  );
}
