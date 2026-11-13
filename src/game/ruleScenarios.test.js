// Regler ur docs/regler.md som inte hade ett eget test. Varje test är ett
// bestämt parti där det går att räkna ut i förväg vad som ska hända.
// ruleCoverage.test.js kopplar varje regel i docs/regler.md till sina tester.
import { describe, expect, it } from 'vitest';
import { RuleError, SKIP_VOTE, applyAction, endVerdict, setConnected } from './rules.js';
import { DEFAULT_SETTINGS, OPTIONAL_ROLES } from './settings.js';
import { createTestGame, playDay, playNight } from './testGame.js';

/** @typedef {import('./types.js').GameState} GameState */

/** @param {GameState} state */
const asDay = (state) => /** @type {GameState} */ ({ ...state, phase: 'day' });

describe('reglerna på natten', () => {
  /** p1 maffia, p2 detektiv, p3 läkare, p4 stadsbo, p5 borgmästare, p6 galning. */
  const night = createTestGame(['mafia', 'detective', 'doctor', 'citizen', 'mayor', 'madman']);

  it('låter stadsbons, borgmästarens och galningens nattval inte göra något', () => {
    const base = { p1: 'p2', p2: 'p1', p3: 'p3' };
    const towardsVictim = playNight(night, { ...base, p4: 'p2', p5: 'p2', p6: 'p2' });
    const elsewhere = playNight(night, { ...base, p4: 'p1', p5: 'p1', p6: 'p1' });
    expect(towardsVictim.lastNight?.killedId).toBe('p2');
    expect(elsewhere.lastNight?.killedId).toBe('p2');
  });

  it('låter läkaren skydda sig själv', () => {
    const day = playNight(night, { p1: 'p3', p2: 'p1', p3: 'p3', p4: 'p1', p5: 'p1', p6: 'p1' });
    expect(day.lastNight?.killedId).toBeNull();
  });

  it('väntar på en spelare som har tappat förbindelsen', () => {
    const disconnected = setConnected(night, 'p4', false);
    const waiting = playNight(disconnected, { p1: 'p2', p2: 'p1', p3: 'p3', p5: 'p1', p6: 'p1' });
    expect(waiting.phase).toBe('night');
  });

  it('låter inte maffian välja gudfadern, som räknas som maffia', () => {
    const withGodfather = createTestGame(['mafia', 'godfather', 'detective', 'citizen', 'citizen']);
    expect(() => applyAction(withGodfather, 'p1', { type: 'nightChoice', targetId: 'p2' })).toThrow(RuleError);
  });
});

describe('besök på natten', () => {
  /** p1 maffia, p2 maffia, p3 detektiv, p4 läkare, p5 bartender, p6 korvgubbe, p7 fönstertittare, p8 stadsbo. */
  const night = createTestGame(['mafia', 'mafia', 'detective', 'doctor', 'bartender', 'sausageVendor', 'windowWatcher', 'citizen']);

  it('räknar alla i maffian som valde offret, läkaren, detektiven, bartendern och korvgubben som besök', () => {
    const day = playNight(night, { p1: 'p8', p2: 'p8', p3: 'p8', p4: 'p8', p5: 'p8', p6: 'p8', p7: 'p8', p8: 'p1' });
    expect(day.sightings?.p7?.[0].seenIds.sort()).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']);
  });
});

describe('bartendern', () => {
  /** p1 maffia, p2 bartender, p3 detektiv, p4 läkare, p5 korvgubbe, p6 stadsbo, p7 stadsbo. */
  const night = createTestGame(['mafia', 'bartender', 'detective', 'doctor', 'sausageVendor', 'citizen', 'citizen']);
  const OTHERS = { p4: 'p4', p6: 'p1', p7: 'p1' };

  it('får detektiven att se "inte maffia" även när målet är maffia', () => {
    const day = playNight(night, { p1: 'p6', p2: 'p3', p3: 'p1', p5: 'p7', ...OTHERS });
    expect(day.investigations.p3).toEqual([{ round: 1, targetId: 'p1', isMafia: false }]);
  });

  it('stoppar korvgubben, så att alla får prata nästa dag', () => {
    const day = playNight(night, { p1: 'p6', p2: 'p5', p3: 'p2', p5: 'p7', ...OTHERS });
    expect(day.lastNight?.silencedId).toBeUndefined();
  });

  it('gör ingen skillnad för en stadsbo', () => {
    const day = playNight(night, { p1: 'p6', p2: 'p7', p3: 'p2', p5: 'p4', ...OTHERS });
    expect(day.lastNight?.killedId).toBe('p6');
    expect(day.lastNight?.silencedId).toBe('p4');
  });
});

describe('reglerna på dagen', () => {
  /** p1 maffia, p2 korvgubbe, p3 detektiv, p4 stadsbo, p5 stadsbo, p6 galning. */
  const night = createTestGame(['mafia', 'sausageVendor', 'detective', 'citizen', 'citizen', 'madman']);

  it('låter den som fick korvgubbens korv rösta', () => {
    const day = playNight(night, { p1: 'p5', p2: 'p4', p3: 'p1', p4: 'p1', p5: 'p1', p6: 'p1' });
    expect(day.lastNight?.silencedId).toBe('p4');
    expect(applyAction(day, 'p4', { type: 'vote', targetId: 'p1' }).dayVotes.p4).toBe('p1');
  });

  it('låter inte den som är ute ur spelet rösta', () => {
    const day = playNight(night, { p1: 'p5', p2: 'p4', p3: 'p1', p4: 'p1', p5: 'p1', p6: 'p1' });
    expect(day.phase).toBe('day');
    expect(() => applyAction(day, 'p5', { type: 'vote', targetId: 'p1' })).toThrow(RuleError);
  });

  it('låter spelarna ändra sin röst tills alla har röstat', () => {
    let day = asDay(night);
    day = applyAction(day, 'p2', { type: 'vote', targetId: 'p6' });
    day = applyAction(day, 'p2', { type: 'vote', targetId: 'p1' });
    const verdict = playDay(day, { p1: 'p6', p3: 'p1', p4: 'p1', p5: SKIP_VOTE, p6: 'p1' });
    expect(verdict.lastDay?.executedId).toBe('p1');
  });

  it('låter galningen vinna även när maffian också hade vunnit', () => {
    const fewLeft = { ...asDay(night), players: night.players.map((p) => ({ ...p, isAlive: ['p1', 'p4', 'p6'].includes(p.id) })) };
    const verdict = playDay(fewLeft, { p1: 'p6', p4: 'p6', p6: 'p1' });
    expect(endVerdict(verdict)).toMatchObject({ phase: 'gameOver', winner: 'madman' });
  });
});

describe('inställningarna från början', () => {
  it('har de nya rollerna avslagna och detektiv och läkare påslagna', () => {
    const switchedOn = OPTIONAL_ROLES.filter(([key]) => DEFAULT_SETTINGS[key]).map(([, role]) => role);
    expect(switchedOn).toEqual(['detective', 'doctor']);
    expect(DEFAULT_SETTINGS.hasGodfather).toBe(false);
  });
});
