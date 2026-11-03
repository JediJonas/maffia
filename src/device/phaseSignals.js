// @ts-check
// Hur telefonerna märker att fasen byts, utöver skärmens färgbyte.
// Berättarröst kommer senare; texten finns redan i narration.js.

// Två korta stötar: vibrera, paus, vibrera.
// eslint-disable-next-line no-magic-numbers -- ett mönster, inte tal med var sin betydelse
const PHASE_VIBRATION_MS = [200, 100, 200];

export function vibrateForPhaseChange() {
  // Safari på iPhone saknar Vibration API, där räcker skärmens färgbyte.
  if ('vibrate' in navigator) navigator.vibrate(PHASE_VIBRATION_MS);
}
