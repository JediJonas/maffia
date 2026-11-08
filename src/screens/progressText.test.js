import { describe, expect, it } from 'vitest';
import { describeNightProgress, describeVoteProgress, listNightProgress, listVoteProgress } from './progressText.js';

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

describe('alla rutor i en lista', () => {
  it('går från ingen till alla, så att lappen kan få den längstas bredd', () => {
    expect(listNightProgress(3)).toEqual(['Ingen är klar', 'En av tre är klara', 'Två av tre är klara', 'Tre av tre är klara']);
    expect(listVoteProgress(2)).toEqual(['Ingen har röstat', 'En av två har röstat', 'Två av två har röstat']);
  });
});
