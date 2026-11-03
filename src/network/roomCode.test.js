import { describe, expect, it } from 'vitest';
import { buildJoinUrl, generateRoomCode, normalizeRoomCode, readRoomCodeFromUrl } from './roomCode.js';

describe('rumskoder', () => {
  it('skapar fyra bokstäver som går att läsa tillbaka', () => {
    const code = generateRoomCode(() => 0.5);
    expect(code).toMatch(/^[A-Z]{4}$/);
    expect(normalizeRoomCode(code.toLowerCase())).toBe(code);
  });

  it('nekar koder med förväxlingsbara tecken', () => {
    expect(normalizeRoomCode('AB0I')).toBeNull();
    expect(normalizeRoomCode('ABC')).toBeNull();
  });

  it('bygger en länk som går att läsa koden ur', () => {
    const url = buildJoinUrl('KLMN', 'https://exempel.se/maffia/?rum=GAML#x');
    expect(url).toBe('https://exempel.se/maffia/?rum=KLMN');
    expect(readRoomCodeFromUrl(url)).toBe('KLMN');
  });
});
