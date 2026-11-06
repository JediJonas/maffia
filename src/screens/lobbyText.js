// @ts-check
// Serierutorna i lobbyn: hur många som har kommit och vad som saknas.
import { MIN_PLAYERS } from '../game/roles.js';
import { buildRoleList, describeRoles, findSettingsProblem } from '../game/settings.js';
import { capitalize, writeNumber } from '../game/numberWords.js';

/**
 * @param {number} playerCount
 * @returns {string} Rutan ovanför spelarlistan.
 */
export function describeArrivals(playerCount) {
  if (playerCount === 1) return 'Bara en har kommit hittills.';
  return `${capitalize(writeNumber(playerCount))} har kommit hittills.`;
}

/**
 * Rutan under listan. Ett problem med inställningarna visas i stället vid
 * inställningarna, så då står här bara vem som startar.
 * @param {object} options
 * @param {import('../game/settings.js').GameSettings} options.settings
 * @param {number} options.playerCount
 * @param {string | null} options.hostName Null på värdens egen telefon.
 * @returns {string}
 */
export function describeLobbyStatus({ settings, playerCount, hostName }) {
  if (playerCount < MIN_PLAYERS) return `Det behövs minst ${writeNumber(MIN_PLAYERS)} för att börja.`;
  const whoStarts = hostName ? `${hostName} startar när alla är på plats.` : '';
  if (findSettingsProblem(settings, playerCount)) return whoStarts || 'Ändra inställningarna innan ni börjar.';
  const roles = `I staden finns ${describeRoles(buildRoleList(settings, playerCount))}.`;
  return whoStarts ? `${roles} ${whoStarts}` : roles;
}
