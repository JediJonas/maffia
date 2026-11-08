import { describe, expect, it } from 'vitest';
import { describeDeath, writeLastWords } from './deathText.js';

const cissi = { id: 'p3', name: 'Cissi', isAlive: false, isConnected: true, avatar: null, revealedRole: /** @type {const} */ ('citizen') };

describe('describeDeath', () => {
  it('visar rollen för de andra', () => {
    expect(describeDeath(cissi, 'p1', 'mördad i natt')).toBe('Cissi var stadsbo.');
  });

  it('säger till den döda vad som hände', () => {
    expect(describeDeath(cissi, 'p3', 'mördad i natt')).toBe('Du blev mördad i natt.');
  });

  it('visar rollen även för den förvisade när alla ska se samma text', () => {
    expect(describeDeath(cissi, 'p3', 'förvisad', { showsRoleToAll: true })).toBe('Cissi var stadsbo.');
  });

  it('säger till den förvisade vad som hände när rollen är hemlig', () => {
    expect(describeDeath({ ...cissi, revealedRole: null }, 'p3', 'förvisad', { showsRoleToAll: true })).toBe('Du blev förvisad.');
  });

  it('säger bara vad som hände när rollen är hemlig', () => {
    expect(describeDeath({ ...cissi, revealedRole: null }, 'p1', 'förvisad')).toBe('Cissi blev förvisad.');
  });
});

describe('writeLastWords', () => {
  it('låter den förvisade säga sig vara oskyldig när rollen har visats', () => {
    expect(writeLastWords(cissi)).toEqual(['Jag är', 'oskyldig!']);
  });

  it('låter maffian hota', () => {
    expect(writeLastWords({ ...cissi, revealedRole: 'mafia' })).toEqual(['Ni kommer', 'ångra er!']);
  });

  it('låter gudfadern hota som maffian och galningen skratta', () => {
    expect(writeLastWords({ ...cissi, revealedRole: 'godfather' })).toEqual(['Ni kommer', 'ångra er!']);
    expect(writeLastWords({ ...cissi, revealedRole: 'madman' })).toEqual(['Ha haha', 'ha ha!']);
  });

  it('håller tyst medan rollen är hemlig, och när den aldrig visas', () => {
    expect(writeLastWords({ ...cissi, revealedRole: null })).toBeNull();
  });
});
