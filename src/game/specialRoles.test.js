import { describe, expect, it } from 'vitest';
import { SKIP_VOTE, endVerdict, findExecutedId, findWinner, listNightTargets } from './rules.js';
import { buildPlayerView } from './playerView.js';
import { createTestGame, playDay, playNight } from './testGame.js';

/**
 * p1 gudfader, p2 bartender, p3 detektiv, p4 läkare, p5 taxichaufför,
 * p6 fönstertittare, p7 korvgubbe, p8 borgmästare, p9 galning.
 */
const ROLES = ['godfather', 'bartender', 'detective', 'doctor', 'taxiDriver', 'windowWatcher', 'sausageVendor', 'mayor', 'madman'];
const night = createTestGame(ROLES);
const QUIET = { p8: 'p1', p9: 'p1' };

describe('specialrollerna på natten', () => {
  it('låter gudfadern se ut som oskyldig för detektiven', () => {
    const day = playNight(night, { p1: 'p9', p2: 'p8', p3: 'p1', p4: 'p4', p5: 'p1', p6: 'p1', p7: 'p8', ...QUIET });
    expect(day.investigations.p3).toEqual([{ round: 1, targetId: 'p1', isMafia: false }]);
  });

  it('låter bartendern stoppa läkarens skydd utan att någon märker det', () => {
    const day = playNight(night, { p1: 'p9', p2: 'p4', p3: 'p2', p4: 'p9', p5: 'p1', p6: 'p1', p7: 'p8', ...QUIET });
    expect(day.lastNight?.killedId).toBe('p9');
    expect(day.investigations.p3).toEqual([{ round: 1, targetId: 'p2', isMafia: false }]);
  });

  it('stoppar mordet när bartendern bjuder någon i maffian', () => {
    const day = playNight(night, { p1: 'p9', p2: 'p1', p3: 'p2', p4: 'p4', p5: 'p1', p6: 'p9', p7: 'p8', ...QUIET });
    expect(day.lastNight?.killedId).toBeNull();
    expect(day.sightings?.p6?.[0].seenIds).toEqual(['p1']);
  });

  it('visar taxichauffören vem den följda besökte och fönstertittaren vilka som kom', () => {
    const day = playNight(night, { p1: 'p9', p2: 'p8', p3: 'p9', p4: 'p4', p5: 'p1', p6: 'p9', p7: 'p8', ...QUIET });
    expect(day.sightings?.p5).toEqual([{ round: 1, targetId: 'p1', seenIds: ['p9'] }]);
    expect(day.sightings?.p6).toEqual([{ round: 1, targetId: 'p9', seenIds: ['p1', 'p3'] }]);
  });

  it('räknar inte taxichauffören, fönstertittaren eller blinda val som besök', () => {
    const day = playNight(night, { p1: 'p8', p2: 'p4', p3: 'p4', p4: 'p3', p5: 'p9', p6: 'p9', p7: 'p3', p8: 'p9', p9: 'p8' });
    expect(day.sightings?.p5?.[0].seenIds).toEqual([]);
    expect(day.sightings?.p6?.[0].seenIds).toEqual([]);
  });

  it('ger den som bartendern bjöd ett tomt svar', () => {
    const day = playNight(night, { p1: 'p9', p2: 'p5', p3: 'p9', p4: 'p4', p5: 'p1', p6: 'p9', p7: 'p8', ...QUIET });
    expect(day.sightings?.p5?.[0].seenIds).toEqual([]);
  });

  it('låter korvgubben tysta någon, men inte den som blev mördad', () => {
    const silenced = playNight(night, { p1: 'p9', p2: 'p6', p3: 'p9', p4: 'p4', p5: 'p1', p6: 'p1', p7: 'p8', ...QUIET });
    expect(silenced.lastNight).toEqual({ killedId: 'p9', silencedId: 'p8', imageRoll: expect.any(Number) });
    const murdered = playNight(night, { p1: 'p8', p2: 'p6', p3: 'p9', p4: 'p4', p5: 'p1', p6: 'p1', p7: 'p8', p8: 'p1', p9: 'p1' });
    expect(murdered.lastNight).toEqual({ killedId: 'p8', imageRoll: expect.any(Number) });
  });

  it('låter gudfadern mörda bartendern, som maffian inte känner', () => {
    expect(listNightTargets(night, night.players[0])).toContain('p2');
    expect(buildPlayerView(night, 'p2').mafiaTeam).toEqual([]);
  });
});

describe('specialrollerna på dagen', () => {
  const day = /** @type {import('./types.js').GameState} */ ({ ...night, phase: 'day' });

  it('räknar borgmästarens röst två gånger', () => {
    expect(findExecutedId({ a: 'x', b: 'y', c: 'y', m: 'x' }, ['m'])).toBe('x');
    const verdict = playDay(day, { p8: 'p1', p2: 'p1', p3: 'p2', p4: 'p2', p5: 'p2', p6: SKIP_VOTE, p7: SKIP_VOTE, p1: SKIP_VOTE, p9: SKIP_VOTE });
    expect(verdict.lastDay?.executedId).toBeNull();
    expect(buildPlayerView(verdict, 'p3').doubleVoterIds).toEqual(['p8']);
  });

  it('låter galningen vinna ensam när staden förvisar honom', () => {
    const verdict = playDay(day, { p1: 'p9', p2: 'p9', p3: 'p9', p4: 'p9', p5: 'p9', p6: 'p9', p7: 'p9', p8: 'p1', p9: 'p1' });
    expect(endVerdict(verdict)).toMatchObject({ phase: 'gameOver', winner: 'madman' });
  });

  it('räknar varken bartendern som maffia eller galningen som vinnare när de lever', () => {
    const players = night.players.map((p) => ({ ...p, isAlive: ['p1', 'p2', 'p9'].includes(p.id) }));
    expect(findWinner({ ...night, players })).toBeNull();
    const twoLeft = night.players.map((p) => ({ ...p, isAlive: ['p1', 'p9'].includes(p.id) }));
    expect(findWinner({ ...night, players: twoLeft })).toBe('mafia');
  });
});
