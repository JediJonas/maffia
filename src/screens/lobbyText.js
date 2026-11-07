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
 * Varför värden inte kan starta, eller null om spelet kan starta. Står i den
 * svarta rutan ovanför knapparna hos värden, vars Starta-knapp är spärrad
 * (ägaren 2026-11-07).
 * @param {import('../game/settings.js').GameSettings} settings
 * @param {number} playerCount
 * @returns {string | null}
 */
export function findStartProblem(settings, playerCount) {
  if (playerCount < MIN_PLAYERS) return describeTooFew();
  return findSettingsProblem(settings, playerCount);
}

function describeTooFew() {
  return `Det behövs minst ${writeNumber(MIN_PLAYERS)} för att börja.`;
}

/**
 * Rutan under listan. Varför värden inte kan starta står i den svarta rutan
 * ovanför knapparna, så på värdens egen telefon blir det då ingen text alls
 * och ingen vit ruta. De andra ser att det behövs fler, eller bara vem som
 * startar när inställningarna inte går ihop.
 * @param {object} options
 * @param {import('../game/settings.js').GameSettings} options.settings
 * @param {number} options.playerCount
 * @param {string | null} options.hostName Null på värdens egen telefon.
 * @returns {string} Tom när rutan inte ska visas.
 */
export function describeLobbyStatus({ settings, playerCount, hostName }) {
  const isHost = !hostName;
  if (isHost && findStartProblem(settings, playerCount)) return '';
  if (playerCount < MIN_PLAYERS) return describeTooFew();
  const whoStarts = `${hostName} startar när alla är på plats.`;
  if (findSettingsProblem(settings, playerCount)) return whoStarts;
  const roles = `I staden finns ${describeRoles(buildRoleList(settings, playerCount))}.`;
  return isHost ? roles : `${roles} ${whoStarts}`;
}
