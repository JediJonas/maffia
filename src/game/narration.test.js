import { describe, expect, it } from 'vitest';
import { narrateAloud, narratePhaseChange } from './narration.js';
import { showDeathRole } from './deathReveal.js';
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

  it('berättar vem som dog men sparar rollen till värden vänder fram den', () => {
    const state = playNight(night, { p1: 'p3', p2: 'p4', p3: 'p4', p4: 'p2', p5: 'p2' });
    const text = narratePhaseChange(buildPlayerView(night, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toContain('Spelare 3 blev mördad av maffian.');
    expect(text).not.toContain('läkare');
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const text = narratePhaseChange(null, buildPlayerView(night, 'p1'));
    expect(text).not.toMatch(/maffia/i);
  });

  it('berättar i domslutet att ingen blev utvisad', () => {
    const day = { ...night, phase: /** @type {const} */ ('day') };
    let state = day;
    for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) state = applyAction(state, id, { type: 'vote', targetId: 'skip' });
    const text = narratePhaseChange(buildPlayerView(day, 'p1'), buildPlayerView(state, 'p1'));
    expect(text).toBe('Alla har röstat. Ingen blev utvisad.');
  });
});

describe('slutet på spelet', () => {
  it('säger att spelet är slut före vem som vann', () => {
    const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
    const verdict = playDay(day, { p1: 'p2', p2: 'p1', p3: 'p1', p4: 'p1', p5: 'p1' });
    const text = narratePhaseChange(buildPlayerView(verdict, 'p2'), buildPlayerView(endVerdict(verdict), 'p2'));
    expect(text).toBe('Spelet är slut. Staden har besegrat maffian.');
  });

  it('berättar om nattens mord först när maffian vinner på natten', () => {
    const night = createTestGame(['mafia', 'mafia', 'citizen', 'citizen']);
    const over = playNight(night, { p1: 'p3', p2: 'p3', p3: 'p1', p4: 'p1' });
    const text = narratePhaseChange(buildPlayerView(night, 'p4'), buildPlayerView(over, 'p4'));
    expect(text).toBe('Staden vaknar. Spelare 3 blev mördad av maffian. Spelare 3 var medborgare. Spelet är slut. Maffian har tagit över staden.');
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

  it('säger först bara vem som blev mördad', () => {
    expect(aloud(night, morning)).toBe('Staden vaknar. Spelare 4 blev mördad av maffian.');
  });

  it('säger rollen när nedräkningen är slut', () => {
    expect(aloud(morning, showDeathRole(morning))).toBe('Spelare 4 var medborgare.');
  });

  it('säger vem som blev utvisad och sedan rollen', () => {
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p3: 'p2', p5: 'p2' });
    expect(aloud(morning, verdict)).toBe('Spelare 2 blev utvisad ur staden.');
    expect(aloud(verdict, showDeathRole(verdict))).toBe('Spelare 2 var detektiv.');
  });

  it('säger inget om roller när de inte ska visas', () => {
    const hidden = { ...night, settings: { ...night.settings, revealsRoleOnDeath: false } };
    const dawn = playNight(hidden, { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(aloud(hidden, dawn)).toBe('Staden vaknar. Spelare 4 blev mördad av maffian.');
    expect(aloud(dawn, playDay(dawn, { p1: 'p2' }))).toBeNull();
  });

  it('avslöjar aldrig värdens egen roll', () => {
    const lines = [aloud(night, morning), aloud(morning, showDeathRole(morning))].join(' ');
    // "mördad av maffian" är tillåtet, men inte vem som är maffia.
    expect(lines).not.toMatch(/(var|är) maffia|Spelare 1/i);
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
