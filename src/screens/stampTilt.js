// @ts-check
// Stämplarna lutar åt olika håll, som riktiga stämplar gjorda för hand
// (Jonas 2026-11-07). Maffia-stämpeln har sin egen lutning och berörs inte.

const STAMP_TILT_DEG = 4;

/**
 * Varannan stämpel lutar åt vänster och varannan åt höger, så att två
 * stämplar under varandra aldrig lutar lika. Lika mycket åt båda hållen.
 * @param {number} index Stämpelns plats i listan, från 0.
 * @returns {number} Grader, negativt åt vänster.
 */
export function chooseStampTilt(index) {
  return index % 2 === 0 ? -STAMP_TILT_DEG : STAMP_TILT_DEG;
}

/**
 * Lutningen som stil, som CSS-regeln för stämplarna läser.
 * @param {number} index
 * @returns {import('react').CSSProperties}
 */
export function styleStampTilt(index) {
  return /** @type {import('react').CSSProperties} */ ({ '--stamp-tilt': `${chooseStampTilt(index)}deg` });
}
