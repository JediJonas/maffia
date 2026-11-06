// @ts-check
import { describe, expect, it } from 'vitest';
import { sortByName, writeListName } from './playerName.js';

describe('writeListName', () => {
  it('skriver (bot) efter en bots namn', () => {
    expect(writeListName({ name: 'Vito', isBot: true })).toBe('Vito (bot)');
  });

  it('lämnar en människas namn som det är', () => {
    expect(writeListName({ name: 'Anna', isBot: false })).toBe('Anna');
  });
});

describe('sortByName', () => {
  it('sorterar i svensk bokstavsordning', () => {
    const players = [{ name: 'Örjan' }, { name: 'bertil' }, { name: 'Åsa' }, { name: 'Anna' }, { name: 'Zack' }];
    expect(sortByName(players).map((p) => p.name)).toEqual(['Anna', 'bertil', 'Zack', 'Åsa', 'Örjan']);
  });
});
