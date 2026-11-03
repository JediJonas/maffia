import { describe, expect, it } from 'vitest';
import { schema } from '@dicebear/lorelei';
import { AVATAR_PARTS, NO_CHOICE, createRandomAvatar, sanitizeAvatar, stepAvatarPart } from './avatarParts.js';
import { buildAvatarImage, toDiceBearOptions } from './renderAvatar.js';

/** @param {number[]} values */
function sequence(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('AVATAR_PARTS', () => {
  it('har samma former som Lorelei', () => {
    for (const part of AVATAR_PARTS.filter((p) => p.kind !== 'color')) {
      const known = /** @type {any} */ (schema.properties)[part.key].items.enum;
      const ownChoices = part.choices.filter((c) => c !== NO_CHOICE);
      expect([...ownChoices].sort(), part.key).toEqual([...known].sort());
    }
  });
});

describe('createRandomAvatar', () => {
  it('ger en giltig avatar', () => {
    const avatar = createRandomAvatar(Math.random);
    expect(sanitizeAvatar(avatar)).toEqual(avatar);
  });

  it('lägger bara till tillbehör ibland', () => {
    const avatar = createRandomAvatar(sequence([0.99]));
    expect(avatar.glasses).toBe(NO_CHOICE);
    expect(avatar.hair).toBe('variant48');
  });
});

describe('sanitizeAvatar', () => {
  const valid = createRandomAvatar(sequence([0.1, 0.5]));

  it('nekar okända värden', () => {
    expect(sanitizeAvatar({ ...valid, hair: '<script>' })).toBeNull();
    expect(sanitizeAvatar({ ...valid, glasses: 'variant99' })).toBeNull();
    expect(sanitizeAvatar({ ...valid, backgroundColor: 'ff0000' })).toBeNull();
    expect(sanitizeAvatar('hår')).toBeNull();
    expect(sanitizeAvatar(null)).toBeNull();
  });

  it('tar bort okända delar och fyller i saknade', () => {
    const withoutHair = { ...valid };
    delete withoutHair.hair;
    const cleaned = sanitizeAvatar({ ...withoutHair, extra: 'x' });
    expect(cleaned).not.toHaveProperty('extra');
    expect(cleaned?.hair).toBe(AVATAR_PARTS[0].choices[0]);
  });
});

describe('stepAvatarPart', () => {
  const avatar = { ...createRandomAvatar(Math.random), head: 'variant04' };

  it('börjar om efter sista alternativet', () => {
    expect(stepAvatarPart(avatar, 'head', 1).head).toBe('variant01');
    expect(stepAvatarPart(avatar, 'head', -1).head).toBe('variant03');
  });

  it('kan bläddra till inga glasögon', () => {
    expect(stepAvatarPart({ ...avatar, glasses: 'variant01' }, 'glasses', -1).glasses).toBe(NO_CHOICE);
  });
});

describe('renderAvatar', () => {
  it('ritar svartvitt med vald bakgrund', () => {
    const options = toDiceBearOptions({ ...createRandomAvatar(Math.random), backgroundColor: 'cfe3f2' });
    expect(options.hairColor).toEqual(['000000']);
    expect(options.skinColor).toEqual(['ffffff']);
    expect(options.backgroundColor).toEqual(['cfe3f2']);
  });

  it('stänger av delar som saknas och slår på valda', () => {
    const options = toDiceBearOptions({ ...createRandomAvatar(Math.random), glasses: NO_CHOICE, beard: 'variant02' });
    expect(options.glassesProbability).toBe(0);
    expect(options).not.toHaveProperty('glasses');
    expect(options.beard).toEqual(['variant02']);
    expect(options.beardProbability).toBe(100);
  });

  it('ritar samma bild för samma val', () => {
    const avatar = createRandomAvatar(Math.random);
    const image = buildAvatarImage(avatar, 'p1');
    expect(image).toMatch(/^data:image\/svg\+xml/);
    expect(buildAvatarImage({ ...avatar }, 'p2')).toBe(image);
  });
});
