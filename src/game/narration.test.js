import { describe, expect, it } from 'vitest';
import { narratePhaseChange } from './narration.js';
import { endDecidedMorning } from './deathReveal.js';
import { buildPlayerView } from './playerView.js';
import { applyAction, endVerdict } from './rules.js';
import { createTestGame, playDay, playNight } from './testGame.js';

const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];

describe('narratePhaseChange', () => {
  const night = createTestGame(ROLES);

  it('säger inget när fasen är densamma', () => {
    const view = buildPlayerView(night, 'p1');
    expect(narratePhaseChange(view, view)).toBeNull();
  });

  it('berättar vem som blev mördad och rollen direkt', () => {
    const state = playNight(night, { p1: 'p3', p2: 'p4', p3: 'p4', p4: 'p2', p5: 'p2' });
    const text = narratePhaseChange(buildPlayerView(night, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toContain('Spelare 3 blev mördad av maffian. Spelare 3 var läkare.');
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const text = narratePhaseChange(null, buildPlayerView(night, 'p1'));
    expect(text).not.toMatch(/maffia/i);
  });

  it('berättar i domslutet att ingen blev förvisad', () => {
    const day = { ...night, phase: /** @type {const} */ ('day') };
    let state = day;
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) state = applyAction(state, id, { type: 'vote', targetId: 'skip' });
    const text = narratePhaseChange(buildPlayerView(day, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toBe('Alla har röstat. Ingen blev förvisad.');
  });
});

describe('slutet på spelet', () => {
  it('säger att spelet är slut före vem som vann', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const verdict = playDay(day, { p1: 'p2', p2: 'p1', p3: 'p1', p4: 'p1', p5: 'p1' });
    const text = narratePhaseChange(buildPlayerView(verdict, 'p2'), buildPlayerView(endVerdict(verdict), 'p2'));
    expect(text).toBe('Spelet är slut. Staden har besegrat maffian.');
  });

  it('säger att spelet är slut efter morgonen när maffian vinner på natten', () => {
    const night = createTestGame(['mafia', 'mafia', 'citizen', 'citizen']);
    const morning = playNight(night, { p1: 'p3', p2: 'p3', p3: 'p1', p4: 'p1' });
    const over = endDecidedMorning(morning);
    const text = narratePhaseChange(buildPlayerView(morning, 'p4'), buildPlayerView(over, 'p4'));
    expect(text).toBe('Spelet är slut. Maffian har tagit över staden.');
  });
});
