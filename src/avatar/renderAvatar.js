// @ts-check
// Ritar en avatar till en bild med DiceBear. Varje telefon ritar själv
// utifrån valen, och samma val ger alltid samma bild.
import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { AVATAR_PARTS, NO_CHOICE } from './avatarParts.js';

/** @typedef {import('./avatarParts.js').Avatar} Avatar */

const ALWAYS_PERCENT = 100;
const NEVER_PERCENT = 0;

/**
 * Översätter valen till DiceBears alternativ, som vill ha listor och en
 * sannolikhet för de delar som kan saknas.
 * @param {Avatar} avatar
 * @returns {Record<string, string[] | number>}
 */
export function toDiceBearOptions(avatar) {
  /** @type {Record<string, string[] | number>} */
  const options = {};
  for (const part of AVATAR_PARTS) {
    const value = avatar[part.key];
    if (part.kind === 'optional') {
      options[`${part.key}Probability`] = value === NO_CHOICE ? NEVER_PERCENT : ALWAYS_PERCENT;
      if (value !== NO_CHOICE) options[part.key] = [value];
    } else {
      options[part.key] = [value];
    }
  }
  return options;
}

/**
 * Spelare utan egen avatar, till exempel från ett spel som sparades innan
 * avatarerna fanns, får en som slumpas fram ur deras id.
 * @param {string} seed
 * @returns {Record<string, string[] | string>}
 */
function buildSeededOptions(seed) {
  const colorChoices = Object.fromEntries(
    AVATAR_PARTS.filter((part) => part.kind === 'color').map((part) => [part.key, [...part.choices]]),
  );
  return { seed, ...colorChoices };
}

/** @type {Map<string, string>} Samma avatar ritas på många ställen, så bilden sparas. */
const imageCache = new Map();

/**
 * @param {Avatar | null} avatar
 * @param {string} fallbackSeed Används när avatar saknas.
 * @returns {string} En data-URL med SVG-bilden.
 */
export function buildAvatarImage(avatar, fallbackSeed) {
  const cacheKey = avatar ? JSON.stringify(avatar) : `seed:${fallbackSeed}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;
  const options = avatar ? toDiceBearOptions(avatar) : buildSeededOptions(fallbackSeed);
  const image = createAvatar(lorelei, options).toDataUri();
  imageCache.set(cacheKey, image);
  return image;
}
