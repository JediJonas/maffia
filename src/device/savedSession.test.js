import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSavedName, saveName } from './savedSession.js';
import { MAX_NAME_LENGTH } from '../game/rules.js';

describe('sparat namn', () => {
  beforeEach(() => {
    /** @type {Map<string, string>} */
    const store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (/** @type {string} */ key) => store.get(key) ?? null,
      setItem: (/** @type {string} */ key, /** @type {string} */ value) => store.set(key, value),
      removeItem: (/** @type {string} */ key) => store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('är tomt första gången', () => {
    expect(loadSavedName()).toBe('');
  });

  it('kommer ihåg namnet till nästa gång', () => {
    saveName('Anna');
    expect(loadSavedName()).toBe('Anna');
  });

  it('kortar ett för långt sparat namn', () => {
    localStorage.setItem('maffia.name', JSON.stringify('x'.repeat(MAX_NAME_LENGTH + 5)));
    expect(loadSavedName()).toHaveLength(MAX_NAME_LENGTH);
  });

  it('ignorerar ett sparat värde som inte är text', () => {
    localStorage.setItem('maffia.name', '42');
    expect(loadSavedName()).toBe('');
  });
});
