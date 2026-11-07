// @ts-check
import { describe, expect, it } from 'vitest';
import { chooseStampTilt } from './stampTilt.js';

describe('chooseStampTilt', () => {
  it('lutar varannan stämpel åt vänster och varannan åt höger, lika mycket', () => {
    expect(chooseStampTilt(0)).toBeLessThan(0);
    expect(chooseStampTilt(1)).toBe(-chooseStampTilt(0));
    expect(chooseStampTilt(2)).toBe(chooseStampTilt(0));
  });
});
