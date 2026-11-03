import { describe, expect, it } from 'vitest';
import { buildPlayerView } from './playerView.js';
import { applyAction } from './rules.js';
import { createTestGame } from './testGame.js';

const ROLES = ['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen', 'citizen', 'citizen'];

describe('buildPlayerView', () => {
  const state = createTestGame(ROLES);

  it('avslöjar inte levande spelares roller för en medborgare', () => {
    const view = buildPlayerView(state, 'p5');
    expect(view.players.every((p) => p.revealedRole === null)).toBe(true);
    expect(view.mafiaTeam).toEqual([]);
    expect(JSON.stringify(view)).not.toContain('"mafia"');
  });

  it('visar maffian vem mer som är maffia och vad de har valt', () => {
    const chosen = applyAction(state, 'p2', { type: 'nightChoice', targetId: 'p5' });
    expect(buildPlayerView(chosen, 'p1').mafiaTeam).toEqual([{ id: 'p2', choiceId: 'p5' }]);
  });

  it('visar inte andras nattval för detektiven', () => {
    const chosen = applyAction(state, 'p1', { type: 'nightChoice', targetId: 'p5' });
    const view = buildPlayerView(chosen, 'p3');
    expect(view.myNightChoice).toBeNull();
    expect(JSON.stringify(view)).not.toContain('"p5":');
  });

  it('visar döda spelares roller för alla', () => {
    const withDead = { ...state, players: state.players.map((p) => (p.id === 'p1' ? { ...p, isAlive: false } : p)) };
    expect(buildPlayerView(withDead, 'p5').players[0].revealedRole).toBe('mafia');
  });

  it('visar alla roller när spelet är slut', () => {
    const over = { ...state, phase: /** @type {const} */ ('gameOver'), winner: /** @type {const} */ ('town') };
    expect(buildPlayerView(over, 'p5').players.every((p) => p.revealedRole)).toBe(true);
  });

  it('säger under domslutet om spelet redan är avgjort', () => {
    const verdict = { ...state, phase: /** @type {const} */ ('verdict') };
    expect(buildPlayerView(verdict, 'p5').isGameDecided).toBe(false);
    const onlyMafiaLeft = { ...verdict, players: verdict.players.map((p) => ({ ...p, isAlive: p.role === 'mafia' })) };
    expect(buildPlayerView(onlyMafiaLeft, 'p5').isGameDecided).toBe(true);
  });
});
