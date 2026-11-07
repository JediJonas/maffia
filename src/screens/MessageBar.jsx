// @ts-check
// Meddelanderutan längst ner, ovanpå sidan, som i Låtquiz. Den ligger fast
// så att sidan inte hoppar när ett meddelande kommer eller går. Bara ett
// meddelande åt gången: ett fel går före en status om förbindelsen.
import { useEffect, useState } from 'react';

/**
 * Så länge en status om förbindelsen ska pågå innan rutan visas. Oftast är
 * rummet öppet eller kontakten tillbaka innan dess, och då blinkar rutan
 * inte till i onödan. Fel visas alltid direkt.
 */
const STATUS_DELAY_MS = 1000;

/**
 * @param {object} props
 * @param {import('../host/useHostGame.js').ConnectionStatus} props.status
 * @param {string | null} props.notice
 */
export function MessageBar({ status, notice }) {
  const delayedStatus = useDelayedStatus(status);
  const message = notice ? { text: notice, isProblem: true } : delayedStatus;
  return (
    <aside aria-label="Meddelanden">
      {/* Fel läses upp direkt, annat när skärmläsaren hinner. */}
      <div role={message.isProblem ? 'alert' : 'status'}>
        {message.text && (
          <p className={message.isProblem ? 'message problem' : 'message'}>
            <span className="message-icon" aria-hidden="true">
              {message.isProblem ? '!' : <span className="spinner" />}
            </span>
            {message.text}
          </p>
        )}
      </div>
    </aside>
  );
}

/**
 * Ger tillbaka statusen först när samma text har stått kvar i
 * STATUS_DELAY_MS. Fel och tom text släpps igenom direkt.
 * @param {import('../host/useHostGame.js').ConnectionStatus} status
 * @returns {import('../host/useHostGame.js').ConnectionStatus}
 */
function useDelayedStatus(status) {
  const [settledText, setSettledText] = useState('');
  const [lastText, setLastText] = useState(status.text);
  const isImmediate = status.isProblem || !status.text;

  // Ny text börjar om väntan, även om samma text har visats tidigare.
  if (status.text !== lastText) {
    setLastText(status.text);
    setSettledText('');
  }

  useEffect(() => {
    if (isImmediate) return undefined;
    const timer = setTimeout(() => setSettledText(status.text), STATUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status.text, isImmediate]);

  if (isImmediate || settledText === status.text) return status;
  return { text: '', isProblem: false };
}
