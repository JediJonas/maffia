// @ts-check
import { describe, expect, it } from 'vitest';
import { writeListName } from './playerName.js';

describe('writeListName', () => {
  it('skriver (bot) efter en bots namn', () => {
    expect(writeListName({ name: 'Vito', isBot: true })).toBe('Vito (bot)');
  });

  it('lämnar en människas namn som det är', () => {
    expect(writeListName({ name: 'Anna', isBot: false })).toBe('Anna');
  });
});
