// @ts-check
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
// Typsnitten följer med appen, så att inget hämtas från Google. Bara de vikter och tecken som används.
import '@fontsource-variable/archivo';
import '@fontsource/big-shoulders-display/latin-900';
import '@fontsource/comic-neue/latin-700';
import './styles.css';
import { waitForFonts } from './device/fontsReady.js';

// Utan StrictMode: dess dubbla effekter skulle öppna värdens PeerJS-id två
// gånger, och servern håller kvar det första en stund.
// Ritas först när typsnitten finns, så att texten inte blinkar i ett annat typsnitt.
waitForFonts().then(() => {
  createRoot(/** @type {HTMLElement} */ (document.getElementById('root'))).render(<App />);
});
