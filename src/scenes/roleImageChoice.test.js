import { describe, expect, it } from 'vitest';
import { resolveRoleImageVariant, rollRoleImageVariant, sanitizeRoleImageChoice, stepRoleImageChoice } from './roleImageChoice.js';

describe('rollbilden', () => {
  it('är Slumpa när inget giltigt val är sparat', () => {
    expect(sanitizeRoleImageChoice(null)).toBe('random');
    expect(sanitizeRoleImageChoice('alien')).toBe('random');
    expect(sanitizeRoleImageChoice('man')).toBe('man');
  });

  it('bläddrar Slumpa, Kvinna, Man och runt igen', () => {
    expect(stepRoleImageChoice('random', 1)).toBe('woman');
    expect(stepRoleImageChoice('woman', 1)).toBe('man');
    expect(stepRoleImageChoice('man', 1)).toBe('random');
    expect(stepRoleImageChoice('random', -1)).toBe('man');
  });

  it('följer ett eget val och struntar då i slumpen', () => {
    const savedRoll = { gameKey: 'ABCD:p1', variant: /** @type {const} */ ('man') };
    expect(resolveRoleImageVariant({ choice: 'woman', savedRoll, gameKey: 'ABCD:p1' })).toBe('woman');
  });

  it('använder slumpen som drogs inför spelet', () => {
    const savedRoll = { gameKey: 'ABCD:p1', variant: /** @type {const} */ ('man') };
    expect(resolveRoleImageVariant({ choice: 'random', savedRoll, gameKey: 'ABCD:p1' })).toBe('man');
  });

  it('väljer ändå samma bild varje gång när slumpen hör till ett annat spel', () => {
    const savedRoll = { gameKey: 'WXYZ:p3', variant: /** @type {const} */ ('man') };
    const first = resolveRoleImageVariant({ choice: 'random', savedRoll, gameKey: 'ABCD:p1' });
    expect(resolveRoleImageVariant({ choice: 'random', savedRoll: null, gameKey: 'ABCD:p1' })).toBe(first);
  });

  it('slumpar kvinna eller man', () => {
    expect(rollRoleImageVariant(() => 0.2)).toBe('woman');
    expect(rollRoleImageVariant(() => 0.8)).toBe('man');
  });
});
