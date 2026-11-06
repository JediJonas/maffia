// @ts-check
// Serierutorna skriver tal med bokstäver ("tre av fem har röstat"), som i en
// berättelse. Siffror står bara i rubriker och koder.

const WORDS = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo'];

/**
 * @param {number} count
 * @returns {string} Till exempel "tre". Större tal än tjugo skrivs med siffror.
 */
export function writeNumber(count) {
  return WORDS[count] ?? String(count);
}

/**
 * @param {string} text
 * @returns {string} Texten med stor första bokstav, för tal först i en mening.
 */
export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
