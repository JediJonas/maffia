// @ts-check
// Meddelanden mellan telefonerna. Klienter skickar bara handlingar, och
// värden svarar med klientens egen vy av spelet (stjärntopologi).

/**
 * @typedef {{ type: 'join', name: string, secret: string, avatar?: import('../avatar/avatarParts.js').Avatar }
 *   | { type: 'action', id: number, action: import('../game/types.js').PlayerAction }
 *   | { type: 'ping' }} ClientMessage
 */

/**
 * @typedef {{ type: 'view', view: import('../game/playerView.js').PlayerView, handledActionId?: number }
 *   | { type: 'error', message: string, handledActionId?: number }
 *   | { type: 'rejected', message: string }
 *   | { type: 'pong' }} HostMessage
 * handledActionId är den senaste handlingen värden har tagit emot från telefonen.
 * rejected betyder att anslutningen inte fick gå med, till exempel för att spelet redan börjat.
 */

// Telefoner som låses eller byter app tappar ofta förbindelsen utan att
// någon av sidorna får veta det. Spelaren pingar och värden svarar direkt,
// så att värdens egna timers inte spelar roll: webbläsare bromsar timers i
// flikar som ligger i bakgrunden, ibland till en gång i minuten.
export const HEARTBEAT_INTERVAL_MS = 4000;
export const CONNECTION_TIMEOUT_MS = 12000;
// Värden släpper en spelare först efter längre tystnad, eftersom en spelare
// med fliken i bakgrunden kan pinga så sällan som en gång i minuten.
export const HOST_DROP_AFTER_MS = 90000;

export {};
