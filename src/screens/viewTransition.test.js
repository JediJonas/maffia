import { describe, expect, it } from 'vitest';
import { chooseViewTransition, settleOutgoingView } from './viewTransition.js';
import { buildPlayerView } from '../game/playerView.js';
import { applyAction } from '../game/rules.js';
import { createTestGame, playNight } from '../game/testGame.js';
import { describeNightProgress, describeVoteProgress } from './progressText.js';

const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];

describe('chooseViewTransition', () => {
  it('går genom svart när natten börjar', () => {
    expect(chooseViewTransition('roleReveal', 'night')).toBe('dusk');
    expect(chooseViewTransition('verdict', 'night')).toBe('dusk');
  });

  it('går genom svart när natten slutar', () => {
    expect(chooseViewTransition('night', 'day')).toBe('dawn');
    expect(chooseViewTransition('night', 'gameOver')).toBe('dawn');
  });

  it('tonar över vid andra byten', () => {
    expect(chooseViewTransition('lobby', 'roleReveal')).toBe('fade');
    expect(chooseViewTransition('day', 'verdict')).toBe('fade');
    expect(chooseViewTransition(undefined, 'lobby')).toBe('fade');
  });
});

describe('settleOutgoingView', () => {
  it('visar alla klara när natten tar slut, inte läget före sista valet', () => {
    const almost = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2' });
    const morning = applyAction(almost, 'p5', { type: 'nightChoice', targetId: 'p2' });
    const outgoing = settleOutgoingView(buildPlayerView(almost, 'p2'), buildPlayerView(morning, 'p2'));
    expect(describeNightProgress(outgoing?.nightChosenCount ?? 0, outgoing?.livingCount ?? 0)).toBe('Fem av fem är klara');
  });

  it('visar alla röster när omröstningen tar slut', () => {
    const morning = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    const living = morning.players.filter((p) => p.isAlive).map((p) => p.id);
    const others = living.slice(0, -1);
    const almost = others.reduce((s, id) => applyAction(s, id, { type: 'vote', targetId: 'p1' === id ? 'p2' : 'p1' }), morning);
    const verdict = applyAction(almost, living.at(-1) ?? '', { type: 'vote', targetId: 'p1' });
    expect(verdict.phase).toBe('verdict');
    const outgoing = settleOutgoingView(buildPlayerView(almost, 'p2'), buildPlayerView(verdict, 'p2'));
    expect(describeVoteProgress(Object.keys(outgoing?.dayVotes ?? {}).length, living.length)).toBe('Fyra av fyra har röstat');
  });
});
