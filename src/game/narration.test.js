import { describe, expect, it } from 'vitest';
import { narratePhaseChange } from './narration.js';
import { buildPlayerView } from './playerView.js';
import { applyAction } from './rules.js';
import { createTestGame } from './testGame.js';

const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];

describe('narratePhaseChange', () => {
  const night = createTestGame(ROLES);

  it('säger inget när fasen är densamma', () => {
    const view = buildPlayerView(night, 'p1');
    expect(narratePhaseChange(view, view)).toBeNull();
  });

  it('berättar vem som dog och vilken roll den hade', () => {
    let state = night;
    const choices = { p1: 'p3', p2: 'p4', p3: 'p4', p4: 'p2', p5: 'p2' };
    for (const [id, targetId] of Object.entries(choices)) state = applyAction(state, id, { type: 'nightChoice', targetId });
    for (const id of Object.keys(choices)) state = applyAction(state, id, { type: 'nightDone' });
    const text = narratePhaseChange(buildPlayerView(night, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toContain('I natt dog Spelare 3, som var läkare.');
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const text = narratePhaseChange(null, buildPlayerView(night, 'p1'));
    expect(text).not.toMatch(/maffia/i);
  });

  it('berättar att ingen röstades ut när dagen slutar utan beslut', () => {
    const day = { ...night, phase: /** @type {const} */ ('day') };
    let state = day;
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) state = applyAction(state, id, { type: 'vote', targetId: 'skip' });
    const text = narratePhaseChange(buildPlayerView(day, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toMatch(/^Ingen röstades ut i dag\. Natten faller/);
  });
});
