// @ts-check
// Värdens inställningar för ett parti. De väljs i lobbyn, där värden ser
// hur många som har anslutit, och visas för alla.
import { joinWithAnd, writeNumber } from './numberWords.js';

/** @typedef {import('./types.js').Role} Role */

/**
 * @typedef {object} GameSettings
 * @property {'auto' | number} mafiaCount auto ger en maffia per fyra spelare.
 * @property {boolean} hasDetective
 * @property {boolean} hasDoctor
 * @property {boolean} hasTaxiDriver
 * @property {boolean} hasWindowWatcher
 * @property {boolean} hasBartender
 * @property {boolean} hasSausageVendor
 * @property {boolean} hasGodfather Gudfadern tar en av maffians platser.
 * @property {boolean} hasMayor
 * @property {boolean} hasMadman
 * @property {boolean} revealsRoleOnDeath Av gör spelet svårare: rollerna visas först när spelet är slut.
 */

/** @type {GameSettings} */
export const DEFAULT_SETTINGS = {
  mafiaCount: 'auto',
  hasDetective: true,
  hasDoctor: true,
  hasTaxiDriver: false,
  hasWindowWatcher: false,
  hasBartender: false,
  hasSausageVendor: false,
  hasGodfather: false,
  hasMayor: false,
  hasMadman: false,
  revealsRoleOnDeath: true,
};

/**
 * Rollerna som värden kan slå på och av, i den ordning de står i
 * inställningarna. Gudfadern står inte här, eftersom den ersätter en maffia.
 * @type {[keyof GameSettings, Role][]}
 */
export const OPTIONAL_ROLES = [
  ['hasDetective', 'detective'],
  ['hasDoctor', 'doctor'],
  ['hasTaxiDriver', 'taxiDriver'],
  ['hasWindowWatcher', 'windowWatcher'],
  ['hasBartender', 'bartender'],
  ['hasSausageVendor', 'sausageVendor'],
  ['hasMayor', 'mayor'],
  ['hasMadman', 'madman'],
];

// Fler än tre maffia kräver fler spelare än en vanlig sällskapskväll har.
const MAX_CHOSEN_MAFIA = 3;
/** @type {('auto' | number)[]} */
export const MAFIA_COUNT_CHOICES = ['auto', ...Array.from({ length: MAX_CHOSEN_MAFIA }, (_, i) => i + 1)];

/**
 * Ett steg åt höger eller vänster bland maffiavalen. Stannar vid ändarna i
 * stället för att börja om, eftersom valen är en skala och inte en lista.
 * @param {'auto' | number} current
 * @param {1 | -1} direction
 * @returns {'auto' | number}
 */
export function stepMafiaCount(current, direction) {
  const index = Math.max(0, MAFIA_COUNT_CHOICES.indexOf(current));
  const next = Math.min(MAFIA_COUNT_CHOICES.length - 1, Math.max(0, index + direction));
  return MAFIA_COUNT_CHOICES[next];
}

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
  if (settings.hasGodfather) roles[0] = 'godfather';
  for (const [key, role] of OPTIONAL_ROLES) {
    if (settings[key]) roles.push(role);
  }
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
  const roleCount = buildRoleList(settings, playerCount).length;
  if (roleCount > playerCount) return `Det finns ${roleCount} roller men bara ${playerCount} spelare. Slå av någon roll.`;
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
 * @returns {string} Till exempel "en maffia, en detektiv, en läkare och två stadsbor".
 */
export function describeRoles(roles) {
  /** @type {[Role, string, string][]} Rollen, namnet för en och namnet för flera. */
  const names = [
    ['godfather', 'gudfader', 'gudfäder'],
    ['mafia', 'maffia', 'maffia'],
    ['detective', 'detektiv', 'detektiver'],
    ['doctor', 'läkare', 'läkare'],
    ['taxiDriver', 'taxichaufför', 'taxichaufförer'],
    ['windowWatcher', 'fönstertittare', 'fönstertittare'],
    ['bartender', 'bartender', 'bartendrar'],
    ['sausageVendor', 'korvgubbe', 'korvgubbar'],
    ['mayor', 'borgmästare', 'borgmästare'],
    ['madman', 'galning', 'galningar'],
    ['citizen', 'stadsbo', 'stadsbor'],
  ];
  const parts = names
    .map(([role, one, many]) => ({ count: roles.filter((r) => r === role).length, one, many }))
    .filter(({ count }) => count > 0)
    .map(({ count, one, many }) => `${writeNumber(count)} ${count === 1 ? one : many}`);
  return joinWithAnd(parts);
}
