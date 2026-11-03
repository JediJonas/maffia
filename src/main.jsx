// @ts-check
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

// Utan StrictMode: dess dubbla effekter skulle öppna värdens PeerJS-id två
// gånger, och servern håller kvar det första en stund.
createRoot(/** @type {HTMLElement} */ (document.getElementById('root'))).render(<App />);
