import { describe, expect, it } from 'vitest';
import { listNightTargets } from './rules.js';
import { buildPlayerView } from './playerView.js';
import { narratePhaseChange } from './narration.js';
import { createTestGame, playNight } from './testGame.js';
import { findLeaks } from './leakCheck.js';

/**
 * p1 maffia, p2 gudfader, p3 livvakt, p4 läkare, p5 bartender,
 * p6 fönstertittare, p7 stadsbo, p8 stadsbo, p9 stadsbo.
 */
const ROLES = /** @type {import('./types.js').Role[]} */ ([
  'mafia', 'godfather', 'bodyguard', 'doctor', 'bartender', 'windowWatcher', 'citizen', 'citizen', 'citizen',
]);
const night = createTestGame(ROLES);
// Maffian går hem till p7, som livvakten skyddar. Övriga gör inget som påverkar.
const ATTACK = { p1: 'p7', p2: 'p7', p3: 'p7', p4: 'p4', p5: 'p8', p6: 'p7', p7: 'p1', p8: 'p1', p9: 'p1' };

/**
 * Slumptal i tur och ordning, sedan noll.
 * @param {number[]} values
 * @returns {() => number}
 */
function fixedRandom(...values) {
  const queue = [...values];
  return () => queue.shift() ?? 0;
}

/** @param {import('./types.js').GameState} state */
const isAlive = (state, /** @type {string} */ id) => state.players.find((p) => p.id === id)?.isAlive;

describe('livvakten', () => {
  it('räddar den skyddade och skjuter en i maffian när livvakten vinner striden', () => {
    const day = playNight(night, ATTACK, fixedRandom(0.1, 0.2));
    expect(isAlive(day, 'p7')).toBe(true);
    expect(day.lastNight?.killedId).toBe('p1');
    expect(day.lastNight?.isShotByBodyguard).toBe(true);
  });

  it('lottar vem i maffian som blir skjuten, även gudfadern', () => {
    const day = playNight(night, ATTACK, fixedRandom(0.1, 0.9));
    expect(day.lastNight?.killedId).toBe('p2');
  });

  it('blir mördad i stället när maffian vinner striden, och den skyddade överlever', () => {
    const day = playNight(night, ATTACK, fixedRandom(0.7));
    expect(isAlive(day, 'p7')).toBe(true);
    expect(day.lastNight?.killedId).toBe('p3');
    expect(day.lastNight?.isShotByBodyguard).toBeUndefined();
  });

  it('slåss inte när maffian går till någon annan', () => {
    const day = playNight(night, { ...ATTACK, p3: 'p8' }, fixedRandom(0.1));
    expect(day.lastNight?.killedId).toBe('p7');
  });

  it('låter läkaren rädda livvakten som förlorar striden', () => {
    const day = playNight(night, { ...ATTACK, p4: 'p3' }, fixedRandom(0.7));
    expect(day.lastNight?.killedId).toBeNull();
  });

  it('misslyckas med skyddet efter bartenderns drink, så offret blir mördat', () => {
    const day = playNight(night, { ...ATTACK, p5: 'p3' }, fixedRandom(0.1));
    expect(day.lastNight?.killedId).toBe('p7');
    expect(isAlive(day, 'p1')).toBe(true);
  });

  it('får inte skydda sig själv men samma person flera nätter i rad', () => {
    const bodyguard = night.players[2];
    expect(listNightTargets(night, bodyguard)).not.toContain('p3');
    const day = playNight(night, { ...ATTACK, p1: 'p8', p2: 'p8' }, fixedRandom(0.5));
    const nextNight = { ...day, phase: /** @type {const} */ ('night'), round: 2, nightChoices: {} };
    expect(listNightTargets(nextNight, bodyguard)).toContain('p7');
  });

  it('räknas som besök av fönstertittaren', () => {
    const day = playNight(night, ATTACK, fixedRandom(0.7));
    expect(day.sightings?.p6?.[0].seenIds.sort()).toEqual(['p1', 'p2', 'p3']);
  });

  it('berättar att maffian blev skjuten av livvakten, även när rollerna inte visas', () => {
    const hidden = { ...night, settings: { ...night.settings, revealsRoleOnDeath: false } };
    const day = playNight(hidden, ATTACK, fixedRandom(0.1, 0.2));
    const view = buildPlayerView(day, 'p8');
    expect(view.players[0].revealedRole).toBeNull();
    expect(narratePhaseChange(buildPlayerView(hidden, 'p8'), view)).toContain('Spelare 1 blev skjuten av livvakten.');
    const roles = Object.fromEntries(day.players.map((p) => [p.id, p.role]));
    expect(findLeaks(view, { roles })).toEqual([]);
  });

  it('berättar som vanligt att livvakten blev mördad av maffian', () => {
    const day = playNight(night, ATTACK, fixedRandom(0.7));
    const text = narratePhaseChange(buildPlayerView(night, 'p8'), buildPlayerView(day, 'p8'));
    expect(text).toContain('Spelare 3 blev mördad av maffian. Spelare 3 var livvakt.');
  });
});
