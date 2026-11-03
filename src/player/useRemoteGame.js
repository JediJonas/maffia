// @ts-check
// En spelares telefon: skickar handlingar till värden och visar den vy som
// värden skickar tillbaka. Telefonen räknar aldrig ut något om spelet själv.
import { useCallback, useEffect, useRef, useState } from 'react';
import { openClientNetwork } from '../network/clientNetwork.js';

/** @typedef {import('../host/useHostGame.js').GameConnection} GameConnection */

/** @type {Record<import('../network/clientNetwork.js').ClientStatus, string>} */
/** @type {Record<string, import('../host/useHostGame.js').ConnectionStatus>} */
const STATUS = {
  connecting: { text: 'Ansluter till värden …', isProblem: false },
  open: { text: '', isProblem: false },
  reconnecting: { text: 'Tappade kontakten med värden. Ansluter igen …', isProblem: false },
  noServer: { text: 'Når inte anslutningsservern. Kontrollera nätet. Försöker igen …', isProblem: true },
  // Vanligast när värd och spelare sitter på olika nät, eller i olika
  // webbläsare på samma dator, och ingen väg mellan dem hittas utan TURN-server.
  unreachable: { text: 'Hittar ingen väg till värdens telefon. Sitter ni på samma wifi? Försöker igen …', isProblem: true },
};

/**
 * @param {{ roomCode: string, name: string, secret: string, avatar?: import('../avatar/avatarParts.js').Avatar, onRejected: (message: string) => void }} options
 * @returns {GameConnection}
 */
export function useRemoteGame({ roomCode, name, secret, avatar, onRejected }) {
  const [view, setView] = useState(/** @type {GameConnection['view']} */ (null));
  const [status, setStatus] = useState(STATUS.connecting);
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
      avatar,
      onStatus: (clientStatus) => setStatus(STATUS[clientStatus]),
      onRoomMissing() {
        network.close();
        onRejectedRef.current(`Hittar inget spel med koden ${roomCode}. Kontrollera koden, eller be värden visa QR-koden igen.`);
      },
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
  }, [roomCode, name, secret, avatar]);

  const sendAction = useCallback((/** @type {import('../game/types.js').PlayerAction} */ action) => {
    setNotice(null);
    networkRef.current?.sendAction(action);
  }, []);

  return { view, status, notice, sendAction, host: null };
}
