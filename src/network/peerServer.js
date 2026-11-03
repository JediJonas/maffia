// @ts-check
// Vilken PeerJS-server telefonerna hittar varandra genom. Utan inställning
// används PeerJS publika server. VITE_PEER_HOST pekar om till en egen,
// till exempel den lokala som testerna startar.

/** @returns {import('peerjs').PeerOptions} */
export function readPeerOptions() {
  const host = import.meta.env.VITE_PEER_HOST;
  if (!host) return {};
  const DEFAULT_PORT = 443;
  return {
    host,
    port: Number(import.meta.env.VITE_PEER_PORT ?? DEFAULT_PORT),
    path: import.meta.env.VITE_PEER_PATH ?? '/',
    secure: import.meta.env.VITE_PEER_SECURE !== 'false',
  };
}
