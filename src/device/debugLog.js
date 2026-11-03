// @ts-check
// Felsökning i en riktig telefon, där ingen konsol finns. Slås på med
// ?debug=1 i adressen och visar en logg längst ner som inte tar emot tryck.

const MAX_LINES = 30;
const isDebugEnabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

/** @type {HTMLPreElement | null} */
let logElement = null;

/** @param {string} message */
export function logDebug(message) {
  if (!isDebugEnabled) return;
  if (!logElement) {
    logElement = document.createElement('pre');
    logElement.className = 'debug-log';
    logElement.textContent = `Bygget ${import.meta.env.VITE_BUILD_TIME}\n`;
    document.body.append(logElement);
  }
  const time = new Date().toLocaleTimeString('sv-SE');
  const lines = `${logElement.textContent}${time} ${message}\n`.split('\n');
  logElement.textContent = lines.slice(-MAX_LINES).join('\n');
}
