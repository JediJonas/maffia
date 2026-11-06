// @ts-check
import { useEffect, useState } from 'react';
import { buildJoinUrl } from '../network/roomCode.js';

const QR_SIZE_PX = 230;

/**
 * QR-koden som öppnar spelet med rumskoden ifylld. Står i värdens bildruta i lobbyn.
 * @param {{ roomCode: string }} props
 */
export function RoomQrCode({ roomCode }) {
  const [qrDataUrl, setQrDataUrl] = useState(/** @type {string | null} */ (null));
  const joinUrl = buildJoinUrl(roomCode, window.location.href);

  useEffect(() => {
    // Bara värden visar QR-koden, så biblioteket laddas först här.
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(joinUrl, { width: QR_SIZE_PX, margin: 1 }))
      .then(setQrDataUrl, () => setQrDataUrl(null));
  }, [joinUrl]);

  if (!qrDataUrl) return null;
  return <img className="qr" src={qrDataUrl} alt="QR-kod som öppnar spelet med rumskoden ifylld" width={QR_SIZE_PX} height={QR_SIZE_PX} />;
}
