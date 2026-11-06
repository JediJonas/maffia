import { describe, expect, it } from 'vitest';
import { describeDeath } from './deathText.js';

const cissi = { id: 'p3', name: 'Cissi', isAlive: false, isConnected: true, avatar: null, revealedRole: /** @type {const} */ ('citizen') };

describe('describeDeath', () => {
  it('visar rollen för de andra', () => {
    expect(describeDeath(cissi, 'p1', 'mördad i natt')).toBe('Cissi var stadsbo.');
  });

  it('säger till den döda vad som hände', () => {
    expect(describeDeath(cissi, 'p3', 'mördad i natt')).toBe('Du blev mördad i natt.');
  });

  it('säger bara vad som hände när rollen är hemlig', () => {
    expect(describeDeath({ ...cissi, revealedRole: null }, 'p1', 'förvisad')).toBe('Cissi blev förvisad.');
  });
});
