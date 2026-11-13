import { describe, expect, it } from 'vitest';
import { applyAction, endVerdict, listNightTargets } from './rules.js';
import { buildPlayerView } from './playerView.js';
import { narratePhaseChange } from './narration.js';
import { createTestGame, playNight } from './testGame.js';
import { findLeaks } from './leakCheck.js';

/**
 * p1 maffia, p2 advokat, p3 bartender, p4 läkare, p5 fönstertittare,
 * p6 galningen, p7 stadsbo, p8 stadsbo.
 */
const ROLES = /** @type {import('./types.js').Role[]} */ ([
  'mafia', 'lawyer', 'bartender', 'doctor', 'windowWatcher', 'madman', 'citizen', 'citizen',
]);
const night = createTestGame(ROLES);
// Maffian mördar p8 och advokaten väljer p7 som klient. Övriga gör inget som påverkar.
const CHOICES = { p1: 'p8', p2: 'p7', p3: 'p8', p4: 'p4', p5: 'p7', p6: 'p1', p7: 'p1', p8: 'p1' };

/**
 * Alla levande röstar. De som inte står med röstar på p1, och p1 på p3.
 * @param {import('./types.js').GameState} state
 * @param {Record<string, string>} votes
 */
function vote(state, votes) {
  let next = state;
  for (const player of state.players.filter((p) => p.isAlive)) {
    const fallback = player.id === 'p1' ? 'p3' : 'p1';
    next = applyAction(next, player.id, { type: 'vote', targetId: votes[player.id] ?? fallback });
  }
  return next;
}

/** Alla utom klienten själv röstar på klienten p7. */
const AGAINST_CLIENT = { p1: 'p7', p2: 'p7', p3: 'p7', p4: 'p7', p5: 'p7', p6: 'p7' };

/** @param {import('./types.js').GameState} state */
const isAlive = (state, /** @type {string} */ id) => state.players.find((p) => p.id === id)?.isAlive;

describe('advokaten', () => {
  it('träder in när klienten får flest röster, och ingen blir förvisad', () => {
    const verdict = vote(playNight(night, CHOICES), AGAINST_CLIENT);
    expect(verdict.phase).toBe('verdict');
    expect(verdict.lastDay).toEqual({ executedId: null, isRoleShown: false, defendedId: 'p7' });
    expect(isAlive(verdict, 'p7')).toBe(true);
  });

  it('förvisar inte heller den som fick näst flest röster', () => {
    const votes = { p1: 'p7', p2: 'p7', p3: 'p7', p4: 'p6', p5: 'p6', p6: 'p7', p7: 'p6' };
    const verdict = vote(playNight(night, CHOICES), votes);
    expect(verdict.lastDay?.executedId).toBeNull();
    expect(verdict.players.filter((p) => !p.isAlive).map((p) => p.id)).toEqual(['p8']);
  });

  it('gör inget när någon annan än klienten får flest röster', () => {
    const verdict = vote(playNight(night, CHOICES), {});
    expect(verdict.lastDay).toEqual({ executedId: 'p1', isRoleShown: false });
  });

  it('räddar galningen från att vinna, och staden fortsätter', () => {
    const day = playNight(night, { ...CHOICES, p2: 'p6' });
    const verdict = vote(day, { p1: 'p6', p2: 'p6', p3: 'p6', p4: 'p6', p5: 'p6', p7: 'p6' });
    expect(verdict.lastDay?.defendedId).toBe('p6');
    const next = endVerdict(verdict);
    expect(next.winner).toBeNull();
    expect(next.phase).toBe('night');
  });

  it('skyddar ingen när advokaten blir mördad på natten', () => {
    const verdict = vote(playNight(night, { ...CHOICES, p1: 'p2' }), AGAINST_CLIENT);
    expect(verdict.lastDay?.executedId).toBe('p7');
  });

  it('skyddar ingen när klienten blir mördad på natten', () => {
    const day = playNight(night, { ...CHOICES, p1: 'p7' });
    expect(day.defendedClientId).toBeNull();
  });

  it('skyddar ingen dagen efter bartenderns drink, så klienten blir förvisad', () => {
    const verdict = vote(playNight(night, { ...CHOICES, p3: 'p2' }), AGAINST_CLIENT);
    expect(verdict.lastDay?.executedId).toBe('p7');
    expect(verdict.lastDay?.defendedId).toBeUndefined();
  });

  it('skyddar bara dagen efter, inte nästa dag', () => {
    const verdict = vote(playNight(night, CHOICES), {});
    expect(verdict.defendedClientId).toBeNull();
  });

  it('får inte välja sig själv eller samma klient två nätter i rad', () => {
    const lawyer = night.players[1];
    expect(listNightTargets(night, lawyer)).not.toContain('p2');
    const verdict = vote(playNight(night, CHOICES), {});
    const nextNight = endVerdict(verdict);
    expect(listNightTargets(nextNight, lawyer)).not.toContain('p7');
    expect(listNightTargets(nextNight, lawyer)).toContain('p4');
  });

  it('kommer ihåg klienten även när bartendern stoppade försvaret', () => {
    const day = playNight(night, { ...CHOICES, p3: 'p2' });
    expect(day.lastLawyerClientId).toBe('p7');
  });

  it('räknas som besök av fönstertittaren', () => {
    const day = playNight(night, CHOICES);
    expect(day.sightings?.p5?.[0].seenIds).toEqual(['p2']);
  });

  it('avslöjar inte klienten för någon förrän advokaten träder in', () => {
    const chosen = playNight(night, Object.fromEntries(Object.entries(CHOICES).filter(([id]) => id !== 'p8')));
    const day = playNight(night, CHOICES);
    const roles = Object.fromEntries(night.players.map((p) => [p.id, p.role]));
    for (const [state, choices] of [[chosen, chosen.nightChoices], [day, {}]]) {
      for (const player of state.players.filter((p) => p.id !== 'p2')) {
        const view = buildPlayerView(state, player.id);
        expect(findLeaks(view, { roles, nightChoices: choices })).toEqual([]);
        expect(view.lastDay).toBeNull();
        expect(view.defendedImageVariant).toBeNull();
        expect(JSON.stringify(view)).not.toContain('Client');
      }
    }
  });

  it('säger i domslutet att advokaten trädde in, utan klientens roll', () => {
    const day = playNight(night, CHOICES);
    const verdict = vote(day, AGAINST_CLIENT);
    const view = buildPlayerView(verdict, 'p4');
    expect(view.players[6].revealedRole).toBeNull();
    expect(view.isRoleRevealPending).toBe(false);
    const text = narratePhaseChange(buildPlayerView(day, 'p4'), view);
    expect(text).toBe('Alla har röstat. Spelare 7 fick flest röster, men advokaten trädde in. Ingen blev förvisad.');
    const roles = Object.fromEntries(verdict.players.map((p) => [p.id, p.role]));
    expect(findLeaks(view, { roles })).toEqual([]);
  });
});
