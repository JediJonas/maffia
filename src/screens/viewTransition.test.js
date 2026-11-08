import { describe, expect, it } from 'vitest';
import { chooseViewTransition } from './viewTransition.js';

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
