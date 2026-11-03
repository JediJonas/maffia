// @ts-check
// Meddelanderutan längst ner, ovanpå sidan, som i Låtquiz. Den ligger fast
// så att sidan inte hoppar när ett meddelande kommer eller går. Bara ett
// meddelande åt gången: ett fel går före en status om förbindelsen.

/**
 * @param {object} props
 * @param {import('../host/useHostGame.js').ConnectionStatus} props.status
 * @param {string | null} props.notice
 */
export function MessageBar({ status, notice }) {
  const message = notice ? { text: notice, isProblem: true } : status;
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
