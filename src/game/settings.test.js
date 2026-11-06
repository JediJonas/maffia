import { describe, expect, it } from 'vitest';
import { buildPlayerView } from './playerView.js';
import { RuleError, addPlayer, changeSettings, createGame, startGame } from './rules.js';
import { DEFAULT_SETTINGS, buildRoleList, completeSettings, describeRoles, findSettingsProblem, stepMafiaCount } from './settings.js';
import { createTestGame } from './testGame.js';

describe('inställningar', () => {
  it('stegar mellan maffiavalen och stannar vid ändarna', () => {
    expect(stepMafiaCount('auto', 1)).toBe(1);
    expect(stepMafiaCount(1, -1)).toBe('auto');
    expect(stepMafiaCount('auto', -1)).toBe('auto');
    expect(stepMafiaCount(3, 1)).toBe(3);
  });

  it('ger valt antal maffia', () => {
    expect(buildRoleList({ ...DEFAULT_SETTINGS, mafiaCount: 2 }, 6).filter((r) => r === 'mafia')).toHaveLength(2);
  });

  it('tar bort detektiv och läkare när de är avslagna', () => {
    const roles = buildRoleList({ ...DEFAULT_SETTINGS, hasDetective: false, hasDoctor: false }, 4);
    expect(roles).toEqual(['mafia', 'citizen', 'citizen', 'citizen']);
  });

  it('låter gudfadern ta en av maffians platser och lägger till de valda rollerna', () => {
    const settings = { ...DEFAULT_SETTINGS, mafiaCount: 2, hasGodfather: true, hasBartender: true, hasMayor: true, hasMadman: true };
    expect(buildRoleList(settings, 8)).toEqual(['godfather', 'mafia', 'detective', 'doctor', 'bartender', 'mayor', 'madman', 'citizen']);
  });

  it('nekar fler roller än spelare', () => {
    const settings = { ...DEFAULT_SETTINGS, hasTaxiDriver: true, hasWindowWatcher: true, hasSausageVendor: true };
    expect(findSettingsProblem(settings, 5)).toBe('Det finns 6 roller men bara 5 spelare. Slå av någon roll.');
  });

  it('nekar så mycket maffia att den vinner direkt', () => {
    expect(findSettingsProblem({ ...DEFAULT_SETTINGS, mafiaCount: 2 }, 4)).toMatch(/för många/);
    expect(findSettingsProblem({ ...DEFAULT_SETTINGS, mafiaCount: 2 }, 5)).toBeNull();
  });

  it('stoppar start med ogiltiga inställningar', () => {
    let state = changeSettings(createGame(), { mafiaCount: 3 });
    for (const id of ['a', 'b', 'c', 'd', 'e']) state = addPlayer(state, { id, name: id });
    expect(() => startGame(state, Math.random)).toThrow(RuleError);
  });

  it('behåller inställningarna när spelet startar', () => {
    let state = changeSettings(createGame(), { hasDoctor: false });
    for (const id of ['a', 'b', 'c', 'd']) state = addPlayer(state, { id, name: id });
    const started = startGame(state, Math.random);
    expect(started.settings.hasDoctor).toBe(false);
    expect(started.players.some((p) => p.role === 'doctor')).toBe(false);
  });

  it('kan inte ändras när spelet har börjat', () => {
    expect(() => changeSettings(createTestGame(['mafia', 'detective', 'doctor', 'citizen']), { hasDoctor: false })).toThrow(RuleError);
  });

  it('döljer döda spelares roller när inställningen är av', () => {
    const state = createTestGame(['mafia', 'detective', 'doctor', 'citizen']);
    const hidden = {
      ...state,
      settings: { ...state.settings, revealsRoleOnDeath: false },
      players: state.players.map((p) => (p.id === 'p1' ? { ...p, isAlive: false } : p)),
    };
    expect(buildPlayerView(hidden, 'p4').players[0].revealedRole).toBeNull();
  });

  it('fyller i det som saknas i spel sparade av en äldre version', () => {
    expect(completeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });
});

describe('describeRoles', () => {
  it('skriver antalet för varje roll med bokstäver', () => {
    expect(describeRoles(['mafia', 'detective', 'doctor', 'citizen'])).toBe('en maffia, en detektiv, en läkare och en stadsbo');
  });

  it('hoppar över roller som inte är med', () => {
    expect(describeRoles(['mafia', 'mafia', 'citizen', 'citizen', 'citizen'])).toBe('två maffia och tre stadsbor');
  });
});
