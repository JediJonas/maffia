// @ts-check
// Vem rollbilden visar, en kvinna eller en man. Valet görs i Ändra figur och
// stannar i telefonen. Det skickas aldrig till värden, eftersom ingen annan
// ser ens rollbild.

/** @typedef {'random' | 'woman' | 'man'} RoleImageChoice */
/** @typedef {'woman' | 'man'} RoleImageVariant */

/** @type {readonly { value: RoleImageChoice, label: string }[]} I den ordning växlaren bläddrar. */
export const ROLE_IMAGE_CHOICES = [
  { value: 'random', label: 'Slumpa' },
  { value: 'woman', label: 'Kvinna' },
  { value: 'man', label: 'Man' },
];

/** @type {RoleImageChoice} */
export const DEFAULT_ROLE_IMAGE_CHOICE = 'random';

/**
 * @param {unknown} input
 * @returns {RoleImageChoice}
 */
export function sanitizeRoleImageChoice(input) {
  return ROLE_IMAGE_CHOICES.find((c) => c.value === input)?.value ?? DEFAULT_ROLE_IMAGE_CHOICE;
}

/**
 * @param {RoleImageChoice} choice
 * @param {1 | -1} direction
 * @returns {RoleImageChoice}
 */
export function stepRoleImageChoice(choice, direction) {
  const index = ROLE_IMAGE_CHOICES.findIndex((c) => c.value === choice);
  const count = ROLE_IMAGE_CHOICES.length;
  return ROLE_IMAGE_CHOICES[(Math.max(0, index) + direction + count) % count].value;
}

/**
 * @param {() => number} random Ett tal från 0 till 1, som Math.random.
 * @returns {RoleImageVariant}
 */
export function rollRoleImageVariant(random) {
  return random() < 1 / 2 ? 'woman' : 'man';
}

/**
 * Slumpen dras i lobbyn och efter spelet, inför nästa spel, och sparas. Då
 * visar rollbilden samma person hela spelet, även om sidan laddas om.
 * @param {object} options
 * @param {RoleImageChoice} options.choice
 * @param {{ gameKey: string, variant: RoleImageVariant } | null} options.savedRoll
 * @param {string} options.gameKey Rumskoden och spelarens id.
 * @returns {RoleImageVariant}
 */
export function resolveRoleImageVariant({ choice, savedRoll, gameKey }) {
  if (choice !== 'random') return choice;
  if (savedRoll?.gameKey === gameKey) return savedRoll.variant;
  // Utan sparad slump, till exempel i privat läge, avgör spelarens id.
  return hashText(gameKey) % 2 === 0 ? 'woman' : 'man';
}

/**
 * Ett tal som alltid blir detsamma för samma text, på alla telefoner.
 * @param {string} text
 * @returns {number}
 */
export function hashText(text) {
  const MULTIPLIER = 31;
  let hash = 0;
  for (const char of text) hash = (hash * MULTIPLIER + char.charCodeAt(0)) >>> 0;
  return hash;
}
