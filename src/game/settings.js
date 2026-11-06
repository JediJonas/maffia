// @ts-check
// Värdens inställningar för ett parti. De väljs i lobbyn, där värden ser
// hur många som har anslutit, och visas för alla.
import { writeNumber } from './numberWords.js';

/** @typedef {import('./types.js').Role} Role */

/**
 * @typedef {object} GameSettings
 * @property {'auto' | number} mafiaCount auto ger en maffia per fyra spelare.
 * @property {boolean} hasDetective
 * @property {boolean} hasDoctor
 * @property {boolean} revealsRoleOnDeath Av gör spelet svårare: rollerna visas först när spelet är slut.
 * @property {boolean} hasNarratorVoice Värdens telefon läser upp vem som dog och rollen.
 */

/** @type {GameSettings} */
export const DEFAULT_SETTINGS = {
  mafiaCount: 'auto',
  hasDetective: true,
  hasDoctor: true,
  revealsRoleOnDeath: true,
  hasNarratorVoice: true,
};

// Fler än tre maffia kräver fler spelare än en vanlig sällskapskväll har.
const MAX_CHOSEN_MAFIA = 3;
/** @type {('auto' | number)[]} */
export const MAFIA_COUNT_CHOICES = ['auto', ...Array.from({ length: MAX_CHOSEN_MAFIA }, (_, i) => i + 1)];

// En maffia per fyra spelare ger ungefär en fjärdedel maffia, vilket är
// den klassiska balansen.
const PLAYERS_PER_MAFIA = 4;

/**
 * @param {GameSettings} settings
 * @param {number} playerCount
 * @returns {number}
 */
export function countMafia(settings, playerCount) {
  if (settings.mafiaCount !== 'auto') return settings.mafiaCount;
  return Math.max(1, Math.floor(playerCount / PLAYERS_PER_MAFIA));
}

/**
 * @param {GameSettings} settings
 * @param {number} playerCount
 * @returns {Role[]} Rollerna i fast ordning, innan de blandas.
 */
export function buildRoleList(settings, playerCount) {
  /** @type {Role[]} */
  const roles = Array(countMafia(settings, playerCount)).fill('mafia');
  if (settings.hasDetective) roles.push('detective');
  if (settings.hasDoctor) roles.push('doctor');
  while (roles.length < playerCount) roles.push('citizen');
  return roles;
}

/**
 * @param {GameSettings} settings
 * @param {number} playerCount
 * @returns {string | null} Varför spelet inte kan starta, eller null.
 */
export function findSettingsProblem(settings, playerCount) {
  const mafiaCount = countMafia(settings, playerCount);
  // Är maffian minst hälften har den redan vunnit innan första natten.
  if (mafiaCount * 2 >= playerCount) return `${mafiaCount} maffia är för många för ${playerCount} spelare.`;
  return null;
}

/**
 * @param {Partial<GameSettings> | undefined} saved Från ett spel som sparades av en äldre version.
 * @returns {GameSettings}
 */
export function completeSettings(saved) {
  return { ...DEFAULT_SETTINGS, ...saved };
}

/**
 * Varje roll får sitt antal, så att det syns att det är en av varje.
 * @param {Role[]} roles
 * @returns {string} Till exempel "en maffia, en detektiv, en läkare och två medborgare".
 */
export function describeRoles(roles) {
  /** @type {[Role, string][]} */
  const names = [['mafia', 'maffia'], ['detective', 'detektiv'], ['doctor', 'läkare'], ['citizen', 'medborgare']];
  const parts = names
    .map(([role, name]) => ({ count: roles.filter((r) => r === role).length, name }))
    .filter(({ count }) => count > 0)
    .map(({ count, name }) => `${writeNumber(count)} ${name}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} och ${parts[parts.length - 1]}` : parts[0];
}
