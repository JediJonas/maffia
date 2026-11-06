import { describe, expect, it } from 'vitest';
import { capitalize, joinWithAnd, writeNumber } from './numberWords.js';

describe('writeNumber', () => {
  it('skriver små tal med bokstäver', () => {
    expect(writeNumber(1)).toBe('en');
    expect(writeNumber(4)).toBe('fyra');
    expect(writeNumber(12)).toBe('tolv');
  });

  it('skriver tal över tjugo med siffror', () => {
    expect(writeNumber(21)).toBe('21');
  });
});

describe('capitalize', () => {
  it('gör första bokstaven stor', () => {
    expect(capitalize('tre har kommit')).toBe('Tre har kommit');
  });
});

describe('joinWithAnd', () => {
  it('binder ihop de sista med och', () => {
    expect(joinWithAnd(['Erik'])).toBe('Erik');
    expect(joinWithAnd(['Erik', 'Fia'])).toBe('Erik och Fia');
    expect(joinWithAnd(['Erik', 'Fia', 'Doris'])).toBe('Erik, Fia och Doris');
  });
});
