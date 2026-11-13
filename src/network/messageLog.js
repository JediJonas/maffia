// @ts-check
// Webbläsartestet (e2e/lackkontroll.e2e.js) loggar allt som värden skickar,
// för att se att ingen telefon får veta något den inte ska. Loggen finns
// bara i utvecklingsläget och bara när testet har skapat den.

/**
 * @typedef {object} LoggedMessage
 * @property {string} to Mottagarens hemliga nyckel.
 * @property {import('./messages.js').HostMessage} message
 */

/**
 * @param {string} secret
 * @param {import('./messages.js').HostMessage} message
 */
export function logSentMessage(secret, message) {
  if (!import.meta.env.DEV) return;
  const log = /** @type {{ __maffiaSentMessages?: LoggedMessage[] }} */ (globalThis).__maffiaSentMessages;
  if (Array.isArray(log)) log.push({ to: secret, message: structuredClone(message) });
}
