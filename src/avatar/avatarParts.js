// @ts-check
// Avataren är bara en uppsättning val, ett per del. Den skickas som de valen
// och ritas av varje telefon själv, så att ingen bild går över nätet och
// värden kan kontrollera varje värde mot listorna här.
// Ritningarna är DiceBear-stilen Lorelei av Lisa Wischofsky (CC0 1.0).

/** @typedef {Record<string, string>} Avatar Delens nyckel till valt alternativ. */

/**
 * @typedef {object} AvatarPart
 * @property {string} key Samma namn som DiceBear-stilens alternativ.
 * @property {string} label
 * @property {readonly string[]} choices
 * @property {'shape' | 'optional'} kind optional har NO_CHOICE som första alternativ.
 */

export const NO_CHOICE = 'none';

/**
 * @param {string} prefix
 * @param {number} count
 * @returns {string[]} Till exempel variant01, variant02 och så vidare, som DiceBear namnger dem.
 */
function listVariants(prefix, count) {
  return Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
}

/** @param {string[]} choices */
function withNoChoice(choices) {
  return [NO_CHOICE, ...choices];
}

// Antalet former av varje del i Lorelei. Ett test jämför med stilens egen lista.
const LORELEI_SHAPE_COUNTS = {
  hair: 48,
  head: 4,
  eyes: 24,
  eyebrows: 13,
  nose: 6,
  happyMouth: 18,
  sadMouth: 9,
  glasses: 5,
  earrings: 3,
  beard: 2,
};

/** @type {readonly AvatarPart[]} I den ordning de visas i byggaren. */
export const AVATAR_PARTS = [
  { key: 'hair', label: 'Frisyr', kind: 'shape', choices: listVariants('variant', LORELEI_SHAPE_COUNTS.hair) },
  { key: 'head', label: 'Ansikte', kind: 'shape', choices: listVariants('variant', LORELEI_SHAPE_COUNTS.head) },
  { key: 'eyes', label: 'Ögon', kind: 'shape', choices: listVariants('variant', LORELEI_SHAPE_COUNTS.eyes) },
  { key: 'eyebrows', label: 'Ögonbryn', kind: 'shape', choices: listVariants('variant', LORELEI_SHAPE_COUNTS.eyebrows) },
  { key: 'nose', label: 'Näsa', kind: 'shape', choices: listVariants('variant', LORELEI_SHAPE_COUNTS.nose) },
  {
    key: 'mouth',
    label: 'Mun',
    kind: 'shape',
    choices: [...listVariants('happy', LORELEI_SHAPE_COUNTS.happyMouth), ...listVariants('sad', LORELEI_SHAPE_COUNTS.sadMouth)],
  },
  { key: 'glasses', label: 'Glasögon', kind: 'optional', choices: withNoChoice(listVariants('variant', LORELEI_SHAPE_COUNTS.glasses)) },
  { key: 'earrings', label: 'Örhängen', kind: 'optional', choices: withNoChoice(listVariants('variant', LORELEI_SHAPE_COUNTS.earrings)) },
  { key: 'beard', label: 'Skägg', kind: 'optional', choices: withNoChoice(listVariants('variant', LORELEI_SHAPE_COUNTS.beard)) },
  { key: 'freckles', label: 'Fräknar', kind: 'optional', choices: withNoChoice(['variant01']) },
  { key: 'hairAccessories', label: 'Blommor i håret', kind: 'optional', choices: withNoChoice(['flowers']) },
];

// Slumpen ska ge vanliga ansikten, så tillbehören kommer bara ibland.
const OPTIONAL_PART_CHANCE = 0.2;

/**
 * @param {() => number} random Ett tal från 0 till 1, som Math.random.
 * @returns {Avatar}
 */
export function createRandomAvatar(random) {
  return Object.fromEntries(AVATAR_PARTS.map((part) => {
    if (part.kind === 'optional' && random() >= OPTIONAL_PART_CHANCE) return [part.key, NO_CHOICE];
    const choices = part.kind === 'optional' ? part.choices.slice(1) : part.choices;
    return [part.key, choices[Math.floor(random() * choices.length)]];
  }));
}

/**
 * Det värden släpper igenom från en telefon. Okända delar tas bort och
 * saknade delar får sitt första alternativ.
 * @param {unknown} input
 * @returns {Avatar | null} Null när det inte är en avatar alls, eller när något värde är otillåtet.
 */
export function sanitizeAvatar(input) {
  if (!input || typeof input !== 'object') return null;
  const values = /** @type {Record<string, unknown>} */ (input);
  /** @type {Avatar} */
  const avatar = {};
  for (const part of AVATAR_PARTS) {
    const value = values[part.key] ?? part.choices[0];
    if (typeof value !== 'string' || !part.choices.includes(value)) return null;
    avatar[part.key] = value;
  }
  return avatar;
}

/**
 * Bläddrar ett steg i en del och börjar om från början efter sista alternativet.
 * @param {Avatar} avatar
 * @param {string} partKey
 * @param {1 | -1} direction
 * @returns {Avatar}
 */
export function stepAvatarPart(avatar, partKey, direction) {
  const part = AVATAR_PARTS.find((p) => p.key === partKey);
  if (!part) return avatar;
  const index = Math.max(0, part.choices.indexOf(avatar[partKey]));
  const nextIndex = (index + direction + part.choices.length) % part.choices.length;
  return { ...avatar, [partKey]: part.choices[nextIndex] };
}
