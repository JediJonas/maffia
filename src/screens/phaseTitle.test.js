import { describe, expect, it } from 'vitest';
import { describePhaseTitle } from './phaseTitle.js';

describe('describePhaseTitle', () => {
  it('numrerar nätter och dagar efter omgången', () => {
    expect(describePhaseTitle({ phase: 'night', round: 2, winner: null })).toBe('Natt 2');
    expect(describePhaseTitle({ phase: 'day', round: 3, winner: null })).toBe('Dag 3');
  });

  it('säger vem som vann när spelet är slut', () => {
    expect(describePhaseTitle({ phase: 'gameOver', round: 4, winner: 'mafia' })).toBe('Maffian vann');
    expect(describePhaseTitle({ phase: 'gameOver', round: 4, winner: 'town' })).toBe('Staden vann');
    expect(describePhaseTitle({ phase: 'gameOver', round: 4, winner: 'madman' })).toBe('Galningen vann');
  });

  it('har en kort rubrik för lobbyn, rollen och domen', () => {
    expect(describePhaseTitle({ phase: 'lobby', round: 0, winner: null })).toBe('Lobby');
    expect(describePhaseTitle({ phase: 'roleReveal', round: 0, winner: null })).toBe('Din roll');
    expect(describePhaseTitle({ phase: 'verdict', round: 1, winner: null })).toBe('Domslut');
  });
});
