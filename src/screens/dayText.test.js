import { describe, expect, it } from 'vitest';
import { describeVoteProgress } from './dayText.js';

describe('describeVoteProgress', () => {
  it('skriver "ingen" i stället för noll', () => {
    expect(describeVoteProgress(0, 4)).toBe('Ingen har röstat');
  });

  it('skriver antalen med bokstäver', () => {
    expect(describeVoteProgress(3, 5)).toBe('Tre av fem har röstat');
  });
});
