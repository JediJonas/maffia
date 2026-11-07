// @ts-check
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { preloadFonts } from './build/preloadFonts.js';

export default defineConfig({
  // Relativ bas så att bygget fungerar även under en undermapp,
  // till exempel GitHub Pages på /maffia/.
  base: './',
  // Wake Lock kräver https, även när telefonerna testar mot datorn på wifi.
  plugins: [react(), basicSsl(), preloadFonts()],
});
