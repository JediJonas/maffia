import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, buildRoleList } from './settings.js';
import {
  RuleError, SKIP_VOTE, addPlayer, applyAction, createGame, endVerdict, findExecutedId, findWinner, startGame,
} from './rules.js';
import { createTestGame, playDay, playNight } from './testGame.js';
import { createRandomAvatar } from '../avatar/avatarParts.js';

/** Spelarna p1 maffia, p2 detektiv, p3 läkare, p4–p5 medborgare. */
const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];

describe('buildRoleList', () => {
  it('ger en maffia, detektiv och läkare för fyra spelare', () => {
    expect(buildRoleList(DEFAULT_SETTINGS, 4)).toEqual(['mafia', 'detective', 'doctor', 'citizen']);
  });

  it('ger ungefär en fjärdedel maffia', () => {
    expect(buildRoleList(DEFAULT_SETTINGS, 8).filter((r) => r === 'mafia')).toHaveLength(2);
    expect(buildRoleList(DEFAULT_SETTINGS, 12).filter((r) => r === 'mafia')).toHaveLength(3);
  });
});

describe('lobbyn', () => {
  it('nekar dubbla namn oavsett skiftläge', () => {
    const state = addPlayer(createGame(), { id: 'a', name: 'Lisa' });
    expect(() => addPlayer(state, { id: 'b', name: ' lisa ' })).toThrow(RuleError);
  });

  it('kräver minst fyra spelare för att starta', () => {
    let state = createGame();
    for (const id of ['a', 'b', 'c']) state = addPlayer(state, { id, name: id });
    expect(() => startGame(state, Math.random)).toThrow(RuleError);
  });

  it('delar ut en roll till var och en och går till rollvisningen', () => {
    let state = createGame();
    for (const id of ['a', 'b', 'c', 'd', 'e']) state = addPlayer(state, { id, name: id });
    const started = startGame(state, () => 0);
    expect(started.phase).toBe('roleReveal');
    expect(started.players.map((p) => p.role).sort()).toEqual(buildRoleList(DEFAULT_SETTINGS, 5).sort());
  });

  it('nekar nya spelare när spelet har börjat', () => {
    const state = createTestGame(ROLES);
    expect(() => addPlayer(state, { id: 'x', name: 'Sen' })).toThrow('redan börjat');
  });
});

describe('natten', () => {
  const night = createTestGame(ROLES);

  it('dödar maffians offer', () => {
    const day = playNight(night, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(day.phase).toBe('day');
    expect(day.lastNight).toEqual({ killedId: 'p4', isRoleShown: false });
    expect(day.players.find((p) => p.id === 'p4')?.isAlive).toBe(false);
  });

  it('låter läkaren rädda offret', () => {
    const day = playNight(night, { p1: 'p4', p2: 'p5', p3: 'p4', p4: 'p2', p5: 'p2' });
    expect(day.lastNight).toEqual({ killedId: null, isRoleShown: false });
    expect(day.players.every((p) => p.isAlive)).toBe(true);
  });

  it('ger detektiven svar på om målet är maffia', () => {
    const day = playNight(night, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(day.investigations.p2).toEqual([{ round: 1, targetId: 'p1', isMafia: true }]);
  });

  it('väntar tills alla levande har bekräftat', () => {
    const partial = playNight(night, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2' });
    expect(partial.phase).toBe('night');
  });

  it('låter inte maffian välja en annan maffia', () => {
    expect(() => applyAction(night, 'p1', { type: 'nightChoice', targetId: 'p1' })).toThrow(RuleError);
  });

  it('kräver att maffian är överens innan de bekräftar', () => {
    const twoMafia = createTestGame(['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen', 'citizen', 'citizen']);
    let state = applyAction(twoMafia, 'p1', { type: 'nightChoice', targetId: 'p5' });
    state = applyAction(state, 'p2', { type: 'nightChoice', targetId: 'p6' });
    expect(() => applyAction(state, 'p1', { type: 'nightDone' })).toThrow('samma offer');
  });

  it('gör om maffians bekräftelse när en av dem byter offer', () => {
    const twoMafia = createTestGame(['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen', 'citizen', 'citizen']);
    let state = applyAction(twoMafia, 'p1', { type: 'nightChoice', targetId: 'p5' });
    state = applyAction(state, 'p2', { type: 'nightChoice', targetId: 'p5' });
    state = applyAction(state, 'p1', { type: 'nightDone' });
    state = applyAction(state, 'p2', { type: 'nightChoice', targetId: 'p6' });
    expect(state.nightDoneIds).not.toContain('p1');
  });

  it('låter inte läkaren skydda samma spelare två nätter i rad', () => {
    const day = playNight(night, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    const nextNight = endVerdict(playDay(day, { p1: SKIP_VOTE, p2: SKIP_VOTE, p3: SKIP_VOTE, p5: SKIP_VOTE }));
    expect(nextNight.phase).toBe('night');
    expect(() => applyAction(nextNight, 'p3', { type: 'nightChoice', targetId: 'p5' })).toThrow(RuleError);
  });
});

describe('dagen', () => {
  it('röstar ut den som får flest röster och visar domslutet', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const verdict = playDay(day, { p1: 'p2', p2: 'p4', p3: 'p4', p4: 'p1', p5: 'p4' });
    expect(verdict.phase).toBe('verdict');
    expect(verdict.lastDay).toEqual({ executedId: 'p4', isRoleShown: false });
    expect(verdict.players.find((p) => p.id === 'p4')?.isAlive).toBe(false);
    expect(verdict.dayVotes.p2).toBe('p4');
  });

  it('låter rösterna vara låsta under domslutet', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const verdict = playDay(day, { p1: 'p2', p2: 'p4', p3: 'p4', p4: 'p1', p5: 'p4' });
    expect(() => applyAction(verdict, 'p1', { type: 'vote', targetId: 'p3' })).toThrow(RuleError);
  });

  it('går till nästa natt när värden avslutar domslutet', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const night = endVerdict(playDay(day, { p1: 'p2', p2: 'p4', p3: 'p4', p4: 'p1', p5: 'p4' }));
    expect(night.phase).toBe('night');
    expect(night.round).toBe(2);
  });

  it('ger staden vinsten när sista maffian blir utvisad', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const over = endVerdict(playDay(day, { p1: 'p2', p2: 'p1', p3: 'p1', p4: 'p1', p5: 'p1' }));
    expect(over.phase).toBe('gameOver');
    expect(over.winner).toBe('town');
  });

  it('ger maffian vinsten när de är lika många som resten', () => {
    const night = createTestGame(['mafia', 'detective', 'citizen', 'doctor']);
    const deadDoctor = { ...night, players: night.players.map((p) => (p.id === 'p4' ? { ...p, isAlive: false } : p)) };
    const morning = playNight(deadDoctor, { p1: 'p2', p2: 'p1', p3: 'p1' });
    // Morgonen visas först, och spelet tar slut när den är över.
    expect(morning.phase).toBe('day');
    expect(findWinner(morning)).toBe('mafia');
  });

  it('låter inte en spelare rösta på sig själv', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    expect(() => applyAction(day, 'p1', { type: 'vote', targetId: 'p1' })).toThrow(RuleError);
  });
});

describe('findExecutedId', () => {
  it('röstar inte ut någon vid lika', () => {
    expect(findExecutedId({ a: 'x', b: 'y' })).toBeNull();
  });

  it('röstar inte ut någon när lika många avstår', () => {
    expect(findExecutedId({ a: 'x', b: SKIP_VOTE })).toBeNull();
  });

  it('röstar ut ensam flest', () => {
    expect(findExecutedId({ a: 'x', b: 'x', c: 'y' })).toBe('x');
  });
});

describe('avatar', () => {
  const avatar = createRandomAvatar(Math.random);
  const lobby = addPlayer(createGame(), { id: 'p1', name: 'Ada', avatar });

  it('sparar en giltig avatar när spelaren går med', () => {
    expect(lobby.players[0].avatar).toEqual(avatar);
  });

  it('ger ingen avatar när telefonen skickar något otillåtet', () => {
    const state = addPlayer(createGame(), { id: 'p1', name: 'Ada', avatar: { hair: 'okänd' } });
    expect(state.players[0].avatar).toBeNull();
  });

  it('låter spelaren byta avatar i lobbyn', () => {
    const changed = { ...avatar, head: avatar.head === 'variant01' ? 'variant02' : 'variant01' };
    const state = applyAction(lobby, 'p1', { type: 'setAvatar', avatar: changed });
    expect(state.players[0].avatar).toEqual(changed);
  });

  it('nekar byte av avatar under spelet och otillåtna värden', () => {
    const game = createTestGame(ROLES);
    expect(() => applyAction(game, 'p1', { type: 'setAvatar', avatar })).toThrow(RuleError);
    expect(() => applyAction(lobby, 'p1', { type: 'setAvatar', avatar: { ...avatar, eyes: 'x' } })).toThrow(RuleError);
  });
});
