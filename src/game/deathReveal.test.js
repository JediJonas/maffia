import { describe, expect, it } from 'vitest';
import { endDecidedMorning, findHiddenDeathId, isMorningDecided, showDeathRole } from './deathReveal.js';
import { buildPlayerView } from './playerView.js';
import { RuleError } from './rules.js';
import { createTestGame, playDay, playNight } from './testGame.js';

/** Spelarna p1 maffia, p2 detektiv, p3 läkare, p4–p5 medborgare. */
const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];
const roleSeenBy = (state, viewerId, playerId) =>
  buildPlayerView(state, viewerId).players.find((p) => p.id === playerId)?.revealedRole;

describe('morgonens offer', () => {
  const morning = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });

  it('visar först bara namnet', () => {
    expect(roleSeenBy(morning, 'p5', 'p4')).toBeNull();
    expect(buildPlayerView(morning, 'p5').isRoleRevealPending).toBe(true);
  });

  it('visar rollen för alla när värden vänder fram den', () => {
    const shown = showDeathRole(morning);
    expect(roleSeenBy(shown, 'p5', 'p4')).toBe('citizen');
    expect(buildPlayerView(shown, 'p5').isRoleRevealPending).toBe(false);
  });

  it('låter omröstningen pågå medan rollen är dold', () => {
    const voted = playDay(morning, { p1: 'p2' });
    expect(voted.dayVotes.p1).toBe('p2');
  });

  it('har inget att visa när ingen dog', () => {
    const calm = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p4', p4: 'p2', p5: 'p2' });
    expect(findHiddenDeathId(calm)).toBeNull();
    expect(() => showDeathRole(calm)).toThrow(RuleError);
  });

  it('har inget att visa när roller inte visas vid död', () => {
    const quiet = { ...morning, settings: { ...morning.settings, revealsRoleOnDeath: false } };
    expect(findHiddenDeathId(quiet)).toBeNull();
    expect(roleSeenBy(quiet, 'p5', 'p4')).toBeNull();
  });
});

describe('domslutet', () => {
  const day = { ...createTestGame(ROLES), phase: /** @type {const} */ ('day') };
  const verdict = playDay(day, { p1: 'p2', p2: 'p4', p3: 'p4', p4: 'p1', p5: 'p4' });

  it('döljer rollen tills värden vänder fram den', () => {
    expect(roleSeenBy(verdict, 'p1', 'p4')).toBeNull();
    expect(buildPlayerView(verdict, 'p1').isRoleRevealPending).toBe(true);
    const shown = showDeathRole(verdict);
    expect(roleSeenBy(shown, 'p1', 'p4')).toBe('citizen');
    expect(buildPlayerView(shown, 'p1').isRoleRevealPending).toBe(false);
  });

  it('visar fortfarande nattens offer under domslutet', () => {
    const morning = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    const afterVote = playDay(morning, { p1: 'p2', p2: 'p1', p3: 'p1', p5: 'p1' });
    expect(afterVote.phase).toBe('verdict');
    expect(roleSeenBy(afterVote, 'p5', 'p4')).toBe('citizen');
  });
});

describe('en morgon där mordet avgör spelet', () => {
  const night = createTestGame(['mafia', 'mafia', 'citizen', 'citizen']);
  const morning = playNight(night, { p1: 'p3', p2: 'p3', p3: 'p1', p4: 'p1' });

  it('visar morgonen och rollen innan spelet tar slut', () => {
    expect(morning.phase).toBe('day');
    expect(isMorningDecided(morning)).toBe(false);
    expect(() => endDecidedMorning(morning)).toThrow(RuleError);
    const shown = showDeathRole(morning);
    expect(isMorningDecided(shown)).toBe(true);
    const over = endDecidedMorning(shown);
    expect(over.phase).toBe('gameOver');
    expect(over.winner).toBe('mafia');
  });

  it('räknar inte rösterna medan morgonen väntar på slutet', () => {
    const voted = playDay(showDeathRole(morning), { p1: 'p4', p2: 'p4', p4: 'p1' });
    expect(voted.phase).toBe('day');
  });

  it('går vidare även när roller inte visas vid död', () => {
    const quiet = { ...morning, settings: { ...morning.settings, revealsRoleOnDeath: false } };
    expect(isMorningDecided(quiet)).toBe(true);
  });

  it('är inte avgjord en vanlig morgon', () => {
    const calm = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(isMorningDecided(showDeathRole(calm))).toBe(false);
  });
});
