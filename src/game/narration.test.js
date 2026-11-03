import { describe, expect, it } from 'vitest';
import { narrateAloud, narratePhaseChange } from './narration.js';
import { showDeathRole } from './deathReveal.js';
import { buildPlayerView } from './playerView.js';
import { applyAction } from './rules.js';
import { createTestGame, playDay, playNight } from './testGame.js';

const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];

describe('narratePhaseChange', () => {
  const night = createTestGame(ROLES);

  it('säger inget när fasen är densamma', () => {
    const view = buildPlayerView(night, 'p1');
    expect(narratePhaseChange(view, view)).toBeNull();
  });

  it('berättar vem som dog men sparar rollen till värden vänder fram den', () => {
    const state = playNight(night, { p1: 'p3', p2: 'p4', p3: 'p4', p4: 'p2', p5: 'p2' });
    const text = narratePhaseChange(buildPlayerView(night, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toContain('I natt dog Spelare 3.');
    expect(text).not.toContain('läkare');
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const text = narratePhaseChange(null, buildPlayerView(night, 'p1'));
    expect(text).not.toMatch(/maffia/i);
  });

  it('berättar i domslutet att ingen röstades ut', () => {
    const day = { ...night, phase: /** @type {const} */ ('day') };
    let state = day;
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) state = applyAction(state, id, { type: 'vote', targetId: 'skip' });
    const text = narratePhaseChange(buildPlayerView(day, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toBe('Alla har röstat. Ingen röstades ut i dag.');
  });
});

describe('narrateAloud', () => {
  const night = createTestGame(ROLES);
  // Maffian (p1) tar p4, läkaren (p3) skyddar p5.
  const morning = playNight(night, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
  const aloud = (/** @type {any} */ before, /** @type {any} */ after) =>
    narrateAloud(buildPlayerView(before, 'p1'), buildPlayerView(after, 'p1'));

  it('läser inget när sidan just har öppnats', () => {
    expect(narrateAloud(null, buildPlayerView(morning, 'p1'))).toBeNull();
  });

  it('säger först bara vem som dog i natt', () => {
    expect(aloud(night, morning)).toBe('Staden vaknar. I natt dog Spelare 4.');
  });

  it('säger rollen när nedräkningen är slut', () => {
    expect(aloud(morning, showDeathRole(morning))).toBe('Spelare 4 var medborgare.');
  });

  it('säger vem som röstades ut och sedan rollen', () => {
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p3: 'p2', p5: 'p2' });
    expect(aloud(morning, verdict)).toBe('Staden röstade ut Spelare 2.');
    expect(aloud(verdict, showDeathRole(verdict))).toBe('Spelare 2 var detektiv.');
  });

  it('säger inget om roller när de inte ska visas', () => {
    const hidden = { ...night, settings: { ...night.settings, revealsRoleOnDeath: false } };
    const dawn = playNight(hidden, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(aloud(hidden, dawn)).toBe('Staden vaknar. I natt dog Spelare 4.');
    expect(aloud(dawn, playDay(dawn, { p1: 'p2' }))).toBeNull();
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const lines = [aloud(night, morning), aloud(morning, showDeathRole(morning))].join(' ');
    expect(lines).not.toMatch(/maffia/i);
  });

  it('ger ett ljudprov när rösten slås på i lobbyn', () => {
    const off = { ...night, phase: 'lobby', settings: { ...night.settings, hasNarratorVoice: false } };
    const on = { ...off, settings: { ...off.settings, hasNarratorVoice: true } };
    expect(aloud(off, on)).toBe('Berättarrösten är på.');
    expect(aloud(on, off)).toBeNull();
  });

  it('säger inget när natten börjar', () => {
    expect(aloud({ ...night, phase: 'verdict' }, night)).toBeNull();
  });
});
