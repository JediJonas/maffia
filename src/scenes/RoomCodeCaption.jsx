// @ts-check
import { useEffect, useState } from 'react';

/** Så länge "(kopierad)" står kvar efter koden. */
const COPIED_NOTICE_MS = 3000;

/**
 * Serierutan med rumskoden. Hela rutan är en knapp: ett tryck kopierar koden
 * och skriver "(kopierad)" efter den en stund (ägaren 2026-11-08).
 * @param {{ roomCode: string }} props
 */
export function RoomCodeCaption({ roomCode }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => setIsCopied(false), COPIED_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  function copyRoomCode() {
    // Urklippet finns bara på https och kan nekas. Då händer inget, och koden står kvar att läsa av.
    navigator.clipboard?.writeText(roomCode).then(() => setIsCopied(true), () => {});
  }

  return (
    <button type="button" className="scene-caption scene-caption-bottom room-code-button" onClick={copyRoomCode}>
      Koden är <span className="room-code-text" aria-label={[...roomCode].join(' ')}>{roomCode}</span>
      <span aria-live="polite">{isCopied ? ' (kopierad)' : ''}</span>.
    </button>
  );
}
