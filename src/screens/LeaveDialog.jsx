// @ts-check
import { useEffect, useRef } from 'react';

/**
 * Frågar innan man lämnar, eftersom ett tryck på hatten annars tar en ur
 * spelet direkt. Värden får veta att spelet tar slut för alla.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {boolean} props.isHost
 * @param {() => void} props.onStay
 * @param {() => void} props.onLeave
 */
export function LeaveDialog({ isOpen, isHost, onStay, onLeave }) {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));

  // showModal ger fokusfälla, Esc och mörk bakgrund utan egen kod.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="leave-dialog" aria-labelledby="leave-title" onClose={onStay}>
      <h2 id="leave-title" className="leave-title">Lämna spelet?</h2>
      {isHost && <p>Du är värd. Om du lämnar avslutas spelet för alla.</p>}
      <div className="bottom-actions">
        <button type="button" className="secondary" autoFocus onClick={onStay}>Stanna kvar</button>
        <button type="button" className="primary" onClick={onLeave}>{isHost ? 'Avsluta för alla' : 'Lämna'}</button>
      </div>
    </dialog>
  );
}
