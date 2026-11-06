import { describe, expect, it } from 'vitest';
import { endDecidedMorning, findHiddenDeathId, isMorningDecided, isVerdictShown, showDeathRole } from './deathReveal.js';
import { buildPlayerView } from './playerView.js';
import { RuleError } from './rules.js';
import { createTestGame, playDay, playNight } from './testGame.js';

/** Spelarna p1 maffia, p2 detektiv, p3 läkare, p4–p5 stadsbor. */
const ROLES = ['mafia', 'detective', 'doctor', 'citizen', 'citizen'];
const roleSeenBy = (state, viewerId, playerId) =>
  buildPlayerView(state, viewerId).players.find((p) => p.id === playerId)?.revealedRole;

describe('morgonens offer', () => {
  const morning = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });

  it('visas med roll direkt, utan nedräkning', () => {
    expect(roleSeenBy(morning, 'p5', 'p4')).toBe('citizen');
    expect(buildPlayerView(morning, 'p5').isRoleRevealPending).toBe(false);
    expect(findHiddenDeathId(morning)).toBeNull();
    expect(() => showDeathRole(morning)).toThrow(RuleError);
  });

  it('visas utan roll när roller inte visas vid död', () => {
    const quiet = { ...morning, settings: { ...morning.settings, revealsRoleOnDeath: false } };
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

  it('går vidare först när rollen har visats', () => {
    expect(isVerdictShown(verdict)).toBe(false);
    expect(isVerdictShown(showDeathRole(verdict))).toBe(true);
  });

  it('går vidare direkt när ingen blev förvisad', () => {
    const noOne = playDay(day, { p1: 'skip', p2: 'skip', p3: 'skip', p4: 'skip', p5: 'skip' });
    expect(isVerdictShown(noOne)).toBe(true);
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

  it('visar morgonen innan spelet tar slut', () => {
    expect(morning.phase).toBe('day');
    expect(isMorningDecided(morning)).toBe(true);
    const over = endDecidedMorning(morning);
    expect(over.phase).toBe('gameOver');
    expect(over.winner).toBe('mafia');
  });

  it('räknar inte rösterna medan morgonen väntar på slutet', () => {
    const voted = playDay(morning, { p1: 'p4', p2: 'p4', p4: 'p1' });
    expect(voted.phase).toBe('day');
  });

  it('går vidare även när roller inte visas vid död', () => {
    const quiet = { ...morning, settings: { ...morning.settings, revealsRoleOnDeath: false } };
    expect(isMorningDecided(quiet)).toBe(true);
  });

  it('är inte avgjord en vanlig morgon', () => {
    const calm = playNight(createTestGame(ROLES), { p1: 'p4', p2: 'p1', p3: 'p5', p4: 'p2', p5: 'p2' });
    expect(isMorningDecided(calm)).toBe(false);
    expect(() => endDecidedMorning(calm)).toThrow(RuleError);
  });
});
