// @ts-check
import { describe, expect, it } from 'vitest';
import { isWinner, orderForGameOver } from './gameOver.js';

/**
 * @param {string} name
 * @param {import('../game/types.js').Role} role
 * @param {boolean} [isAlive]
 * @returns {import('../game/playerView.js').PublicPlayer}
 */
function makePlayer(name, role, isAlive = true) {
  return { id: name, name, isAlive, isConnected: true, isBot: false, avatar: null, revealedRole: role };
}

describe('isWinner', () => {
  it('räknar hela laget som vinnare, även de döda', () => {
    expect(isWinner(makePlayer('Erik', 'mafia', false), 'mafia')).toBe(true);
    expect(isWinner(makePlayer('Anna', 'detective'), 'mafia')).toBe(false);
  });

  it('låter galningen vinna ensam', () => {
    expect(isWinner(makePlayer('Doris', 'madman'), 'madman')).toBe(true);
    expect(isWinner(makePlayer('Anna', 'detective'), 'madman')).toBe(false);
  });

  it('markerar ingen när ingen har vunnit', () => {
    expect(isWinner(makePlayer('Anna', 'detective'), null)).toBe(false);
  });
});

describe('orderForGameOver', () => {
  it('ställer vinnarna först, båda grupperna i bokstavsordning', () => {
    const players = [
      makePlayer('Cissi', 'doctor'),
      makePlayer('Erik', 'mafia'),
      makePlayer('Anna', 'detective'),
      makePlayer('Bertil', 'mafia'),
    ];
    expect(orderForGameOver(players, 'mafia').map((p) => p.name)).toEqual(['Bertil', 'Erik', 'Anna', 'Cissi']);
  });
});
