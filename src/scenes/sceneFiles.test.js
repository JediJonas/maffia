// Bildernas filer och namn, som bildansvarig (.claude/agents/bildansvarig.md)
// annars skulle kontrollera för hand. Reglerna står i CLAUDE.md under Bilder.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROLE_INFO } from '../game/roles.js';
import { buildPlayerView } from '../game/playerView.js';
import { createTestGame } from '../game/testGame.js';
import { MURDER_IMAGES, chooseRoleImage, describeScene } from './describeScene.js';
import { SCENE_IMAGES } from './sceneImages.js';

const IMAGE_DIR = new URL('./images/', import.meta.url);
const files = readdirSync(IMAGE_DIR);
const source = readFileSync(new URL('./sceneImages.js', import.meta.url), 'utf8');
/** Variabelnamnet i sceneImages.js och filen det pekar på. */
const fileByImport = Object.fromEntries([...source.matchAll(/^import (\w+) from '\.\/images\/([^']+)';$/gm)].map((m) => [m[1], m[2]]));
/** Nyckeln i SCENE_IMAGES och filen. */
const fileByKey = Object.fromEntries([...source.matchAll(/^ {2}(\w+): \{ src: (\w+),/gm)].map((m) => [m[1], fileByImport[m[2]]]));

const VIEWS = ['roll', 'natt', 'morgon', 'dom', 'slut', 'start', 'ga-med', 'skapa', 'lobby'];
const FILE_NAME = new RegExp(`^(${VIEWS.join('|')})(-[a-z0-9]+)*\\.webp$`);
const SUFFIX = { woman: '-kvinna.webp', man: '-man.webp' };
const VARIANTS = /** @type {const} */ (['woman', 'man']);
const MAFIA_ROLES = ['mafia', 'godfather'];
// Startsidans bild fyller hela skärmen och används direkt av StartScreen.jsx.
const IMAGES_OUTSIDE_PANEL = ['start.webp'];

describe('bildernas filer', () => {
  it('har namn på svenska med små bokstäver, utan å, ä och ö, som börjar med vyn', () => {
    expect(files.filter((f) => !FILE_NAME.test(f))).toEqual([]);
  });

  it('används alla, och alla som används finns', () => {
    const imported = [...Object.values(fileByImport), ...IMAGES_OUTSIDE_PANEL];
    expect(files.filter((f) => !imported.includes(f))).toEqual([]);
    expect(imported.filter((f) => !files.includes(f))).toEqual([]);
  });

  it('har alt-text och utsnitt', () => {
    for (const [key, image] of Object.entries(SCENE_IMAGES)) {
      expect(fileByKey[key], key).toBeTruthy();
      expect(image.alt, key).toMatch(/^[A-ZÅÄÖ].{20,}\.$/);
      expect(image.position, key).toMatch(/^\d+% \d+%$/);
    }
  });

  it('har en kvinna och en man i rätt fil för varje roll', () => {
    for (const role of /** @type {import('../game/types.js').Role[]} */ (Object.keys(ROLE_INFO))) {
      for (const variant of VARIANTS) {
        const file = fileByKey[chooseRoleImage(role, variant)];
        expect(file, `${role} ${variant}`).toMatch(/^roll-/);
        expect(file.endsWith(SUFFIX[variant]), `${role} ${variant}: ${file}`).toBe(true);
      }
    }
  });

  it('har en nattbild för varje roll, med kvinna och man utom för maffian', () => {
    for (const role of /** @type {import('../game/types.js').Role[]} */ (Object.keys(ROLE_INFO))) {
      const state = createTestGame([role, role === 'mafia' ? 'citizen' : 'mafia', 'citizen', 'citizen']);
      for (const variant of VARIANTS) {
        const image = describeScene(buildPlayerView(state, 'p1'), false, false, variant).image;
        const file = image ? fileByKey[image] : undefined;
        expect(file, `${role} ${variant}`).toMatch(/^natt-/);
        if (!MAFIA_ROLES.includes(role)) expect(file?.endsWith(SUFFIX[variant]), `${role} ${variant}: ${file}`).toBe(true);
      }
    }
  });

  it('har mordbilder med rätt kön och lika många av varje', () => {
    for (const variant of VARIANTS) {
      for (const key of MURDER_IMAGES[variant]) expect(fileByKey[key].endsWith(SUFFIX[variant]), key).toBe(true);
    }
    expect(MURDER_IMAGES.woman.length).toBe(MURDER_IMAGES.man.length);
  });
});
