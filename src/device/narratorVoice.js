// @ts-check
// Värdens telefon läser upp berättaren med webbläsarens inbyggda talsyntes.
// Talsyntesen följer samma regel som ljud: iPhone talar bara om sidan redan
// har talat i ett tryck, så varje tryck låser upp den och en replik som kom
// för tidigt sparas till nästa tryck.
import { logDebug } from './debugLog.js';

const LANGUAGE = 'sv-SE';
const IS_ENABLED_KEY = 'maffia.narratorVoice';

/**
 * @typedef {object} NarratorVoice
 * @property {() => void} unlock Anropas från varje tryck.
 * @property {(text: string) => void} speak Köar repliken efter den som redan läses.
 * @property {() => void} stop
 */

/**
 * Föredrar en svensk röst som finns i telefonen, eftersom den läser direkt
 * utan nätet. Utan svensk röst väljer telefonen själv utifrån språket.
 * @param {Pick<SpeechSynthesisVoice, 'lang' | 'localService'>[]} voices
 * @returns {number} Platsen i listan, eller -1.
 */
export function findSwedishVoiceIndex(voices) {
  const isSwedish = (/** @type {{ lang: string }} */ v) => v.lang.toLowerCase().replace('_', '-').startsWith('sv');
  const localIndex = voices.findIndex((v) => isSwedish(v) && v.localService);
  return localIndex >= 0 ? localIndex : voices.findIndex(isSwedish);
}

/** @returns {NarratorVoice} */
export function createNarratorVoice() {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let isUnlocked = false;
  /** @type {string[]} */
  let waitingLines = [];

  /** @param {string} text */
  function speakNow(text) {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE;
    const voices = synth.getVoices();
    const voiceIndex = findSwedishVoiceIndex(voices);
    if (voiceIndex >= 0) utterance.voice = voices[voiceIndex];
    utterance.onstart = () => logDebug(`talar (${utterance.voice?.name ?? 'standardröst'}): ${text}`);
    utterance.onerror = (event) => {
      logDebug(`talet misslyckades: ${event.error}`);
      // Chrome säger not-allowed när inget tryck har låst upp talet.
      if (event.error === 'not-allowed') {
        isUnlocked = false;
        waitingLines.push(text);
      }
    };
    // Chrome kan bli stående pausad efter att sidan legat i bakgrunden.
    if (synth.paused) synth.resume();
    synth.speak(utterance);
  }

  function unlock() {
    if (!synth || (isUnlocked && waitingLines.length === 0)) return;
    // Annars tystar ljudlös-knappen på iPhone ljudet från sidan.
    const audioSession = /** @type {{ audioSession?: { type: string } }} */ (/** @type {unknown} */ (navigator)).audioSession;
    if (audioSession && audioSession.type !== 'playback') audioSession.type = 'playback';
    if (!isUnlocked) {
      // En tyst replik i trycket räcker för att iPhone ska tala senare utan tryck.
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0;
      synth.speak(silent);
      isUnlocked = true;
      logDebug(`talet upplåst, ${synth.getVoices().length} röster, svensk: ${findSwedishVoiceIndex(synth.getVoices()) >= 0 ? 'ja' : 'nej'}`);
    }
    const lines = waitingLines;
    waitingLines = [];
    lines.forEach(speakNow);
  }

  /** @param {string} text */
  function speak(text) {
    if (!synth) {
      logDebug('webbläsaren saknar talsyntes');
      return;
    }
    if (!isUnlocked) {
      logDebug(`väntar på tryck: ${text}`);
      waitingLines.push(text);
      return;
    }
    speakNow(text);
  }

  function stop() {
    waitingLines = [];
    synth?.cancel();
  }

  return { unlock, speak, stop };
}

/** @returns {boolean} På som standard. Sparas per telefon, eftersom det gäller just den högtalaren. */
export function loadIsVoiceEnabled() {
  try {
    return localStorage.getItem(IS_ENABLED_KEY) !== 'off';
  } catch {
    return true;
  }
}

/** @param {boolean} isEnabled */
export function saveIsVoiceEnabled(isEnabled) {
  try {
    localStorage.setItem(IS_ENABLED_KEY, isEnabled ? 'on' : 'off');
  } catch {
    // Privat läge kan neka. Valet gäller då bara tills sidan laddas om.
  }
}
