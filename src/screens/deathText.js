// @ts-check
import { ROLE_INFO } from '../game/roles.js';

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
