import { describe, expect, it } from 'vitest';
import { findSwedishVoiceIndex } from './narratorVoice.js';

describe('findSwedishVoiceIndex', () => {
  it('föredrar en svensk röst som finns i telefonen', () => {
    const voices = [
      { lang: 'en-US', localService: true },
      { lang: 'sv-SE', localService: false },
      { lang: 'sv_SE', localService: true },
    ];
    expect(findSwedishVoiceIndex(voices)).toBe(2);
  });

  it('tar en svensk röst från nätet när ingen annan finns', () => {
    expect(findSwedishVoiceIndex([{ lang: 'en-GB', localService: true }, { lang: 'sv-SE', localService: false }])).toBe(1);
  });

  it('säger -1 utan svensk röst', () => {
    expect(findSwedishVoiceIndex([{ lang: 'nb-NO', localService: true }])).toBe(-1);
  });
});
