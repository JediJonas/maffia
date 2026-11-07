// @ts-check
// Texterna i Regler, som alla kan öppna från lobbyn. Rollerna kommer från
// inställningarna, så att listan bara tar upp de roller som finns i just det
// här spelet och nya roller kommer med av sig själva.
import { MIN_PLAYERS, ROLE_INFO } from '../game/roles.js';
import { buildRoleList } from '../game/settings.js';

/** @typedef {{ title: string, text: string }} RuleRow En rad i en av listorna i Regler. */

const TOWN_RULE = { title: 'Staden', text: 'Alla som inte är maffia. Staden vinner när all maffia är borta.' };
const MAFIA_RULE = { title: 'Maffian', text: 'Maffian vet vilka som hör till den. Den vinner när den är lika många som alla andra tillsammans.' };
const MADMAN_RULE = { title: 'Galningen', text: 'Spelar för sig själv och vinner ensam om staden förvisar honom. Då är spelet slut direkt.' };

/**
 * @param {import('../game/settings.js').GameSettings} settings
 * @returns {{ lead: string, rows: RuleRow[] }} Rutan ovanför listan och en rad för varje sida som kan vinna.
 */
export function describeTeamRules(settings) {
  if (!settings.hasMadman) return { lead: 'Staden har två lag.', rows: [TOWN_RULE, MAFIA_RULE] };
  return { lead: 'Staden har två lag, och en galning.', rows: [TOWN_RULE, MAFIA_RULE, MADMAN_RULE] };
}

/**
 * @param {import('../game/settings.js').GameSettings} settings
 * @param {number} playerCount
 * @returns {RuleRow[]} En rad för varje roll som finns i spelet, i samma ordning som i lobbyns ruta.
 */
export function listRoleRules(settings, playerCount) {
  // Innan alla har kommit visas rollerna som de blir när spelet kan börja.
  const roles = new Set(buildRoleList(settings, Math.max(playerCount, MIN_PLAYERS)));
  return [...roles].map((role) => ({ title: ROLE_INFO[role].name, text: ROLE_INFO[role].description }));
}

/**
 * @param {import('../game/settings.js').GameSettings} settings
 * @returns {RuleRow[]} Natten, dagen och domslutet.
 */
export function listRoundRules(settings) {
  const victimRole = settings.revealsRoleOnDeath ? ' och vilken roll den hade' : '';
  const exiledRole = settings.revealsRoleOnDeath
    ? 'Rollen visas efter en kort stund.'
    : 'Rollerna visas först när ett lag har vunnit.';
  return [
    {
      title: 'Natt',
      text: 'Alla tittar i telefonen och trycker på en spelare, så att ingen ser vem som är vaken. Den som inte har någon uppgift på natten väljer också, men det valet räknas inte. Maffian måste välja samma offer, och natten är slut när alla har valt.',
    },
    {
      title: 'Dag',
      text: `Staden vaknar och får veta vem som blev mördad${victimRole}. Sedan diskuterar alla och röstar öppet om vem som ska förvisas.`,
    },
    {
      title: 'Domslut',
      text: `Den som får flest röster blir förvisad ur staden. ${exiledRole} Blir det lika, eller avstår lika många eller fler, blir ingen förvisad.`,
    },
  ];
}
