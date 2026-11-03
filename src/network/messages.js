// @ts-check
// Meddelanden mellan telefonerna. Klienter skickar bara handlingar, och
// värden svarar med klientens egen vy av spelet (stjärntopologi).

/**
 * @typedef {{ type: 'join', name: string, secret: string }
 *   | { type: 'action', id: number, action: import('../game/types.js').PlayerAction }
 *   | { type: 'pong' }} ClientMessage
 */

/**
 * @typedef {{ type: 'view', view: import('../game/playerView.js').PlayerView, handledActionId?: number }
 *   | { type: 'error', message: string, handledActionId?: number }
 *   | { type: 'rejected', message: string }
 *   | { type: 'ping' }} HostMessage
 * handledActionId är den senaste handlingen värden har tagit emot från telefonen.
 * rejected betyder att anslutningen inte fick gå med, till exempel för att spelet redan börjat.
 */

// Telefoner som låses eller byter app tappar ofta förbindelsen utan att
// någon av sidorna får veta det, så värden pingar och klienten håller koll.
export const HEARTBEAT_INTERVAL_MS = 4000;
export const CONNECTION_TIMEOUT_MS = 12000;

export {};
