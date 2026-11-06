import { describe, expect, it } from 'vitest';
import { describeArrivals, describeLobbyStatus } from './lobbyText.js';
import { DEFAULT_SETTINGS } from '../game/settings.js';

describe('describeArrivals', () => {
  it('skriver antalet med bokstäver', () => {
    expect(describeArrivals(3)).toBe('Tre har kommit hittills.');
    expect(describeArrivals(1)).toBe('Bara en har kommit hittills.');
  });
});

describe('describeLobbyStatus', () => {
  const settings = { ...DEFAULT_SETTINGS, mafiaCount: 1, hasDetective: true, hasDoctor: false };

  it('säger hur många som behövs innan fyra har kommit', () => {
    expect(describeLobbyStatus({ settings, playerCount: 3, hostName: null })).toBe('Det behövs minst fyra för att börja.');
  });

  it('berättar vilka roller som finns i staden för värden', () => {
    expect(describeLobbyStatus({ settings, playerCount: 4, hostName: null })).toBe('I staden finns en maffia, en detektiv och två medborgare.');
  });

  it('säger också vem som startar för de andra', () => {
    expect(describeLobbyStatus({ settings, playerCount: 4, hostName: 'Bertil' })).toBe(
      'I staden finns en maffia, en detektiv och två medborgare. Bertil startar när alla är på plats.',
    );
  });

  it('nämner inte rollerna när inställningarna inte går ihop', () => {
    const tooMany = { ...settings, mafiaCount: 2 };
    expect(describeLobbyStatus({ settings: tooMany, playerCount: 4, hostName: null })).toBe('Ändra inställningarna innan ni börjar.');
  });
});
