// @ts-check
// Håller värdens skärm tänd. Webbläsaren släpper låset varje gång sidan
// göms, så det måste begäras igen när sidan syns.

/** @returns {() => void} Släpper låset. */
export function keepScreenAwake() {
  if (!('wakeLock' in navigator)) return () => {};
  /** @type {WakeLockSentinel | null} */
  let sentinel = null;
  let isReleased = false;

  async function request() {
    if (isReleased || document.visibilityState !== 'visible') return;
    try {
      sentinel = await navigator.wakeLock.request('screen');
    } catch {
      // Nekas till exempel i strömsparläge. Spelet fungerar ändå.
    }
  }

  document.addEventListener('visibilitychange', request);
  request();
  return () => {
    isReleased = true;
    document.removeEventListener('visibilitychange', request);
    sentinel?.release();
  };
}
