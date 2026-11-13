// @ts-check
// Webbläsartester som spelar hela partier med flera telefoner. De körs mot
// utvecklingsservern och en egen PeerJS-server, så att inget går via nätet.
import { defineConfig, devices } from '@playwright/test';

const PEER_PORT = 9000;
const APP_PORT = 5173;
// Ett parti tar ungefär en minut. Sex minuter räcker även för en långsam dator.
const GAME_TIMEOUT_MS = 360000;
const SERVER_START_TIMEOUT_MS = 60000;

export default defineConfig({
  testDir: 'e2e',
  testMatch: '*.e2e.js',
  timeout: GAME_TIMEOUT_MS,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['iPhone 13'],
    deviceScaleFactor: 2,
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    baseURL: `https://localhost:${APP_PORT}`,
    ignoreHTTPSErrors: true,
    trace: 'off',
  },
  webServer: [
    {
      command: `npx peerjs --host 127.0.0.1 --port ${PEER_PORT}`,
      port: PEER_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: SERVER_START_TIMEOUT_MS,
    },
    {
      command: `npx vite --port ${APP_PORT} --strictPort`,
      url: `https://localhost:${APP_PORT}`,
      ignoreHTTPSErrors: true,
      reuseExistingServer: !process.env.CI,
      timeout: SERVER_START_TIMEOUT_MS,
      env: {
        VITE_PEER_HOST: '127.0.0.1',
        VITE_PEER_PORT: String(PEER_PORT),
        VITE_PEER_SECURE: 'false',
      },
    },
  ],
});
