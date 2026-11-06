// @ts-check
// Hur telefonerna märker att fasen byts, utöver att rastret bakom sidan byts.
// Berättarrösten finns i narratorVoice.js och talar bara på värdens telefon.

// Två korta stötar: vibrera, paus, vibrera.
// eslint-disable-next-line no-magic-numbers -- ett mönster, inte tal med var sin betydelse
const PHASE_VIBRATION_MS = [200, 100, 200];

export function vibrateForPhaseChange() {
  // Safari på iPhone saknar Vibration API, där räcker det att rastret byts.
  if ('vibrate' in navigator) navigator.vibrate(PHASE_VIBRATION_MS);
}
