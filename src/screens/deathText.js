// @ts-check
import { ROLE_INFO, isMafia } from '../game/roles.js';

/**
 * Vad den förvisade säger, en rad i taget. Hen säger något först när rollen
 * har visats, så att bubblan inte avslöjar något i förväg. Visas rollen
 * aldrig säger hen inget. Maffian hotar, galningen jublar och alla andra
 * säger sig vara oskyldiga.
 * @param {import('../game/playerView.js').PublicPlayer} executed
 * @returns {string[] | null}
 */
export function writeLastWords(executed) {
  if (executed.revealedRole === null) return null;
  if (isMafia(executed.revealedRole)) return ['Ni kommer', 'ångra er!'];
  if (executed.revealedRole === 'madman') return ['Ha haha', 'ha ha!'];
  return ['Jag är', 'oskyldig!'];
}

/**
 * Texten bredvid den som har dött. Den döda själv får veta vad som hände,
 * de andra får rollen när den visas. Efter nedräkningen i domslutet får alla
 * samma text med rollen, även den förvisade, så att ingen får en annan text.
 * @param {import('../game/playerView.js').PublicPlayer} dead
 * @param {string} myId
 * @param {string} how Till exempel "mördad".
 * @param {{ showsRoleToAll?: boolean }} [options]
 * @returns {string} Till exempel "Cissi var stadsbo." eller "Du blev mördad."
 */
export function describeDeath(dead, myId, how, { showsRoleToAll = false } = {}) {
  if (dead.id === myId && !(showsRoleToAll && dead.revealedRole)) return `Du blev ${how}.`;
  if (dead.revealedRole) return `${dead.name} var ${ROLE_INFO[dead.revealedRole].name.toLowerCase()}.`;
  return `${dead.name} blev ${how}.`;
}
