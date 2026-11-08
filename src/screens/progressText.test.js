import { describe, expect, it } from 'vitest';
import { describeNightProgress, describeVoteProgress } from './progressText.js';

describe('describeVoteProgress', () => {
  it('skriver "ingen" i stället för noll', () => {
    expect(describeVoteProgress(0, 4)).toBe('Ingen har röstat');
  });

  it('skriver antalen med bokstäver', () => {
    expect(describeVoteProgress(3, 5)).toBe('Tre av fem har röstat');
  });
});

describe('describeNightProgress', () => {
  it('skriver "ingen" i stället för noll', () => {
    expect(describeNightProgress(0, 4)).toBe('Ingen är klar');
  });

  it('skriver antalen med bokstäver', () => {
    expect(describeNightProgress(2, 5)).toBe('Två av fem är klara');
  });
});
