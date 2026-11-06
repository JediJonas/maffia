// @ts-check
import { ROLE_INFO } from '../game/roles.js';

/**
 * Vad den förvisade säger, en rad i taget. Hen säger något först när rollen
 * har visats, så att bubblan inte avslöjar något i förväg. Visas rollen
 * aldrig säger hen inget. Maffian hotar, alla andra säger sig vara oskyldiga.
 * @param {import('../game/playerView.js').PublicPlayer} executed
 * @returns {string[] | null}
 */
export function writeLastWords(executed) {
  if (executed.revealedRole === null) return null;
  return executed.revealedRole === 'mafia' ? ['Ni kommer', 'ångra er!'] : ['Jag är', 'oskyldig!'];
}

/**
 * Texten bredvid den som har dött. Den döda själv får veta vad som hände,
 * de andra får rollen när den visas.
 * @param {import('../game/playerView.js').PublicPlayer} dead
 * @param {string} myId
 * @param {string} how Till exempel "mördad i natt".
 * @returns {string} Till exempel "Cissi var stadsbo." eller "Du blev mördad i natt."
 */
export function describeDeath(dead, myId, how) {
  if (dead.id === myId) return `Du blev ${how}.`;
  if (dead.revealedRole) return `${dead.name} var ${ROLE_INFO[dead.revealedRole].name.toLowerCase()}.`;
  return `${dead.name} blev ${how}.`;
}
