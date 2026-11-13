// @ts-check
// Spelar ett helt parti med fyra telefoner och loggar allt som värden skickar.
// Varje meddelande kontrolleras med läckkontrollen (src/game/leakCheck.js).
// Med SKARMBILDER=1 sparas en skärmbild per telefon och vy i
// test-results/skarmbilder/.
import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { findLeaks } from '../src/game/leakCheck.js';

const PLAYER_NAMES = ['Ada', 'Bo', 'Cissi'];
const HOST_NAME = 'Värden';
const TURN_PAUSE_MS = 400;
// Vyerna tonar över i varandra. Skärmbilden tas när övertoningen är klar.
const TRANSITION_MS = 1500;
const SCREENSHOT_DIR = 'test-results/skarmbilder';
const SAVES_SCREENSHOTS = Boolean(process.env.SKARMBILDER);

/**
 * @typedef {object} Phone
 * @property {string} name
 * @property {import('@playwright/test').Page} page
 * @property {string[]} seenTitles
 */

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {string} name
 * @param {boolean} isHost
 * @returns {Promise<Phone>}
 */
async function openPhone(browser, name, isHost) {
  const context = await browser.newContext();
  if (isHost) await context.addInitScript(() => { /** @type {any} */ (window).__maffiaSentMessages = []; });
  const page = await context.newPage();
  await page.goto('/');
  return { name, page, seenTitles: [] };
}

/**
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ roomCode: string, secret?: string }>}
 */
async function readSession(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('maffia.session') ?? '{}'));
}

/**
 * Gör det som telefonen väntar på: visa rollen, välja på natten och rösta på
 * dagen. Väljer första möjliga, eftersom det bara är trafiken som testas.
 * @param {Phone} phone
 * @returns {Promise<string>} Rubriken, som säger vilken fas telefonen är i.
 */
async function takeTurn(phone) {
  const { page } = phone;
  const title = (await page.locator('#phase-title').textContent()) ?? '';
  if (!phone.seenTitles.includes(title)) {
    phone.seenTitles.push(title);
    if (SAVES_SCREENSHOTS) {
      await page.waitForTimeout(TRANSITION_MS);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${phone.name}-${phone.seenTitles.length}-${title.replace(/\s+/g, '-')}.png`, fullPage: true });
    }
  }
  const options = page.locator('button.picker-option');
  const hasChosen = (await page.locator('button.picker-option[aria-pressed="true"]').count()) > 0;
  if (title === 'Din roll') {
    for (const label of ['Visa min roll', 'Jag har sett min roll']) {
      const button = page.getByRole('button', { name: label });
      if (await button.isVisible()) await button.click();
    }
  } else if ((title.startsWith('Natt') || title.startsWith('Dag')) && !hasChosen && (await options.count()) > 0) {
    await options.first().click();
  }
  return title;
}

/** @param {string} title */
function isGameOver(title) {
  return title.endsWith('vann');
}

test('ingen telefon får veta något den inte ska', async ({ browser }) => {
  if (SAVES_SCREENSHOTS) mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const host = await openPhone(browser, HOST_NAME, true);
  await host.page.getByRole('button', { name: 'Starta nytt spel' }).click();
  await host.page.locator('#name').fill(HOST_NAME);
  await host.page.getByRole('button', { name: 'Skapa spelet' }).click();
  await expect(host.page.locator('#phase-title')).toHaveText('Lobby');
  const { roomCode } = await readSession(host.page);

  const players = [];
  for (const name of PLAYER_NAMES) {
    const phone = await openPhone(browser, name, false);
    await phone.page.getByRole('button', { name: 'Gå med i spel' }).click();
    await phone.page.locator('#room-code').fill(roomCode);
    await phone.page.locator('#name').fill(name);
    await phone.page.getByRole('button', { name: 'Gå med', exact: true }).click();
    await expect(phone.page.locator('#phase-title')).toHaveText('Lobby');
    players.push(phone);
  }

  const startButton = host.page.getByRole('button', { name: 'Starta spelet' });
  await expect(startButton).toBeEnabled();
  await startButton.click();

  const phones = [host, ...players];
  for (;;) {
    const titles = await Promise.all(phones.map(takeTurn));
    if (titles.every(isGameOver)) break;
    await host.page.waitForTimeout(TURN_PAUSE_MS);
  }

  /** @type {import('../src/network/messageLog.js').LoggedMessage[]} */
  const log = await host.page.evaluate(() => /** @type {any} */ (window).__maffiaSentMessages);
  const secrets = await Promise.all(players.map(async (p) => (await readSession(p.page)).secret ?? ''));
  const views = log.flatMap((entry) => (entry.message.type === 'view' ? [{ to: entry.to, view: entry.message.view }] : []));
  const finalView = views.at(-1)?.view;
  expect(finalView?.phase).toBe('gameOver');
  // När spelet är slut visas allas roller, och då vet testet sanningen.
  const roles = Object.fromEntries((finalView?.players ?? []).map((p) => [p.id, p.revealedRole]));
  expect(Object.values(roles).every(Boolean)).toBe(true);

  const leaks = views.flatMap(({ to, view }) => findLeaks(view, { roles, secrets: secrets.filter((s) => s !== to) })
    .map((leak) => `${view.me.name} i ${view.phase} ${view.round}: ${leak}`));
  expect(new Set(views.map((v) => v.to)).size).toBe(PLAYER_NAMES.length);
  expect(views.some((v) => v.view.phase === 'night')).toBe(true);
  expect([...new Set(leaks)]).toEqual([]);
});
