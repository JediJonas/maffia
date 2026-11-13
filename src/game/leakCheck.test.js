import { describe, expect, it } from 'vitest';
import { findLeaks } from './leakCheck.js';
import { buildPlayerView } from './playerView.js';
import { addPlayer, applyAction, changeSettings, createGame, endVerdict, startGame } from './rules.js';
import { findNextBotMove } from './bots.js';
import { endDecidedMorning, findHiddenDeathId, isMorningDecided, isVerdictShown, showDeathRole } from './deathReveal.js';
import { createTestGame } from './testGame.js';

/** @typedef {import('./types.js').GameState} GameState */

const ALL_ROLES_ON = {
  hasBodyguard: true, hasTaxiDriver: true, hasWindowWatcher: true, hasBartender: true, hasSausageVendor: true,
  hasGodfather: true, hasMayor: true, hasMadman: true,
};

const SCENARIOS = [
  { name: 'fyra spelare med standardroller', playerCount: 4, settings: {} },
  { name: 'tolv spelare med alla roller', playerCount: 12, settings: ALL_ROLES_ON },
  { name: 'tolv spelare där rollerna visas först på slutet', playerCount: 12, settings: { ...ALL_ROLES_ON, revealsRoleOnDeath: false } },
];
const GAMES_PER_SCENARIO = 15;
const MAX_STEPS = 2000;

/**
 * Samma slump varje gång, så att ett fel går att köra om.
 * @param {number} seed
 * @returns {() => number}
 */
function seededRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** @param {GameState} state */
function truthOf(state) {
  return {
    roles: Object.fromEntries(state.players.map((p) => [p.id, p.role])),
    nightChoices: state.nightChoices,
  };
}

/** @param {GameState} state */
function findAllLeaks(state) {
  const truth = truthOf(state);
  return state.players.flatMap((p) => findLeaks(buildPlayerView(state, p.id), truth).map((leak) => `${state.phase} ${state.round}: ${leak}`));
}

/**
 * Det värden gör av sig själv efter en paus, i stället för att vänta.
 * @param {GameState} state
 * @returns {GameState | null}
 */
function runHostTimer(state) {
  if (findHiddenDeathId(state)) return showDeathRole(state);
  if (isMorningDecided(state)) return endDecidedMorning(state);
  if (isVerdictShown(state)) return endVerdict(state);
  return null;
}

/**
 * Ett helt parti där alla är botar. Vyerna kontrolleras efter varje steg.
 * @param {number} playerCount
 * @param {Partial<import('./settings.js').GameSettings>} settings
 * @param {number} seed
 * @returns {{ leaks: string[], state: GameState }}
 */
function playWholeGame(playerCount, settings, seed) {
  const random = seededRandom(seed);
  let state = createGame();
  for (let i = 1; i <= playerCount; i++) state = addPlayer(state, { id: `p${i}`, name: `Bot ${i}`, isBot: true });
  state = startGame(changeSettings(state, settings), random);
  const leaks = findAllLeaks(state);
  for (let step = 0; step < MAX_STEPS && state.phase !== 'gameOver'; step++) {
    const timed = runHostTimer(state);
    const move = timed ? null : findNextBotMove(state, random);
    if (!timed && !move) throw new Error(`Partiet fastnade i fasen ${state.phase}.`);
    state = timed ?? (move ? applyAction(state, move.botId, move.action, random) : state);
    leaks.push(...findAllLeaks(state));
  }
  return { leaks, state };
}

describe('läckkontrollen i hela partier', () => {
  for (const scenario of SCENARIOS) {
    it(`hittar inga läckor med ${scenario.name}`, () => {
      for (let seed = 1; seed <= GAMES_PER_SCENARIO; seed++) {
        const { leaks, state } = playWholeGame(scenario.playerCount, scenario.settings, seed);
        expect(state.phase, `parti ${seed}`).toBe('gameOver');
        expect(leaks, `parti ${seed}`).toEqual([]);
      }
    });
  }
});

describe('findLeaks', () => {
  const state = createTestGame(['mafia', 'mafia', 'detective', 'doctor', 'citizen']);
  const truth = truthOf(state);
  const cleanView = buildPlayerView(state, 'p5');

  it('godkänner en vanlig vy', () => {
    expect(findLeaks(cleanView, truth)).toEqual([]);
  });

  it('hittar en levande spelares roll', () => {
    const view = { ...cleanView, players: cleanView.players.map((p) => ({ ...p, revealedRole: p.id === 'p1' ? 'mafia' : null })) };
    expect(findLeaks(view, truth).join()).toContain('visas som mafia');
  });

  it('hittar maffians lag hos en stadsbo', () => {
    const view = { ...cleanView, mafiaTeam: [{ id: 'p1', role: 'mafia', choiceId: null }] };
    expect(findLeaks(view, truth).join()).toContain('ser maffians lag');
  });

  it('hittar ett nytt fält som ingen har granskat', () => {
    expect(findLeaks({ ...cleanView, allRoles: {} }, truth).join()).toContain('Okänt fält allRoles');
  });

  it('hittar en roll gömd i ett annat fält', () => {
    const view = { ...cleanView, lastNight: { killedId: 'p4', silencedId: 'doctor' } };
    expect(findLeaks(view, truth).join()).toContain('lastNight.silencedId');
  });

  it('hittar någon annans nattval', () => {
    const chosen = applyAction(state, 'p1', { type: 'nightChoice', targetId: 'p4' });
    const view = { ...buildPlayerView(chosen, 'p5'), myNightChoice: 'p4' };
    expect(findLeaks(view, truthOf(chosen)).join()).toContain('någon annans val');
  });

  it('hittar en annan telefons hemliga nyckel', () => {
    const view = { ...cleanView, players: cleanView.players.map((p) => ({ ...p, isBot: false, name: p.id === 'p2' ? 'abc123secret' : p.name })) };
    expect(findLeaks(view, { ...truth, secrets: ['abc123secret'] }).join()).toContain('hemliga nyckel');
  });

  it('hittar en förvisads roll innan nedräkningen är klar', () => {
    const withDead = { ...state, phase: /** @type {const} */ ('verdict'), lastDay: { executedId: 'p1', isRoleShown: false } };
    const dead = { ...withDead, players: withDead.players.map((p) => (p.id === 'p1' ? { ...p, isAlive: false } : p)) };
    const view = buildPlayerView(dead, 'p5');
    const leaky = { ...view, players: view.players.map((p) => (p.id === 'p1' ? { ...p, revealedRole: 'mafia' } : p)) };
    expect(findLeaks(view, truthOf(dead))).toEqual([]);
    expect(findLeaks(leaky, truthOf(dead)).join()).toContain('visas som mafia');
  });
});
