// @ts-check
// En spelares telefon: skickar handlingar till värden och visar den vy som
// värden skickar tillbaka. Telefonen räknar aldrig ut något om spelet själv.
import { useCallback, useEffect, useRef, useState } from 'react';
import { openClientNetwork } from '../network/clientNetwork.js';

/** @typedef {import('../host/useHostGame.js').GameConnection} GameConnection */

/** @type {Record<import('../network/clientNetwork.js').ClientStatus, string>} */
const STATUS_TEXT = {
  connecting: 'Ansluter till värden …',
  open: '',
  reconnecting: 'Tappade kontakten med värden. Ansluter igen …',
};

/**
 * @param {{ roomCode: string, name: string, secret: string, onRejected: (message: string) => void }} options
 * @returns {GameConnection}
 */
export function useRemoteGame({ roomCode, name, secret, onRejected }) {
  const [view, setView] = useState(/** @type {GameConnection['view']} */ (null));
  const [status, setStatus] = useState(STATUS_TEXT.connecting);
  const [notice, setNotice] = useState(/** @type {string | null} */ (null));
  const networkRef = useRef(/** @type {ReturnType<typeof openClientNetwork> | null} */ (null));
  const onRejectedRef = useRef(onRejected);
  useEffect(() => {
    onRejectedRef.current = onRejected;
  }, [onRejected]);

  useEffect(() => {
    const network = openClientNetwork({
      roomCode,
      name,
      secret,
      onStatus: (clientStatus) => setStatus(STATUS_TEXT[clientStatus]),
      onMessage(message) {
        if (message.type === 'view') {
          setView(message.view);
        } else if (message.type === 'error') {
          setNotice(message.message);
        } else if (message.type === 'rejected') {
          network.close();
          onRejectedRef.current(message.message);
        }
      },
    });
    networkRef.current = network;
    return () => network.close();
  }, [roomCode, name, secret]);

  const sendAction = useCallback((/** @type {import('../game/types.js').PlayerAction} */ action) => {
    setNotice(null);
    networkRef.current?.sendAction(action);
  }, []);

  return { view, status, notice, sendAction, host: null };
}
