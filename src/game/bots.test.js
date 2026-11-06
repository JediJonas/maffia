// @ts-check
import { describe, expect, it } from 'vitest';
import { MAX_BOTS, addBot, chooseBotAction, findNextBotMove, listBots, pickBotName, removeLastBot } from './bots.js';
import {
  RuleError, SKIP_VOTE, addPlayer, applyAction, createGame, endVerdict, listNightTargets, startGame,
} from './rules.js';
import { endDecidedMorning, findHiddenDeathId, isMorningDecided, isVerdictShown, showDeathRole } from './deathReveal.js';
import { buildPlayerView } from './playerView.js';
import { createTestGame } from './testGame.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Role} Role */

/**
 * Ett spel med kända roller där de angivna spelarna är botar.
 * @param {Role[]} roles
 * @param {string[]} botIds
 * @returns {GameState}
 */
function createGameWithBots(roles, botIds) {
  const state = createTestGame(roles);
  return { ...state, players: state.players.map((p) => ({ ...p, isBot: botIds.includes(p.id) })) };
}

/**
 * @param {GameState} state
 * @param {string} id
 */
function findPlayer(state, id) {
  const player = state.players.find((p) => p.id === id);
  if (!player) throw new Error(`Okänd spelare ${id}`);
  return player;
}

const pickFirst = () => 0;

describe('botar i lobbyn', () => {
  it('får ett ledigt namn, en figur och syns som bot för alla', () => {
    let state = addPlayer(createGame(), { id: 'h', name: 'Vito' });
    state = addBot(state, 'b1', Math.random);
    const bot = findPlayer(state, 'b1');
    expect(bot.name).toBe('Greta');
    expect(bot.isBot).toBe(true);
    expect(bot.avatar).not.toBeNull();
    expect(buildPlayerView(state, 'h').players.map((p) => p.isBot)).toEqual([false, true]);
  });

  it('tar bort den senast tillagda boten men aldrig en människa', () => {
    let state = addPlayer(createGame(), { id: 'h', name: 'Anna' });
    state = addBot(addBot(state, 'b1', Math.random), 'b2', Math.random);
    state = removeLastBot(state);
    expect(state.players.map((p) => p.id)).toEqual(['h', 'b1']);
    state = removeLastBot(state);
    expect(() => removeLastBot(state)).toThrow(RuleError);
    expect(state.players.map((p) => p.id)).toEqual(['h']);
  });

  it('tillåter högst tre botar', () => {
    let state = addPlayer(createGame(), { id: 'h', name: 'Anna' });
    for (let i = 1; i <= MAX_BOTS; i++) state = addBot(state, `b${i}`, Math.random);
    expect(MAX_BOTS).toBe(3);
    expect(() => addBot(state, 'b4', Math.random)).toThrow(RuleError);
  });

  it('tar ett reservnamn när alla namn är tagna', () => {
    let state = createGame();
    for (const name of ['Vito', 'Greta', 'Sixten', 'Doris', 'Harald', 'Kajsa', 'Bruno', 'Elsa', 'Gunnar', 'Viola', 'Ragnar', 'Inez', 'Tore', 'Maud', 'Olof']) {
      state = addPlayer(state, { id: name, name });
    }
    expect(pickBotName(state)).toBe('Siri');
    state = addPlayer(state, { id: 'Siri', name: 'Siri' });
    expect(pickBotName(state)).toBe('Bot 17');
  });
});

describe('botar under spelet', () => {
  it('trycker klar i rollvisningen', () => {
    const state = { ...createGameWithBots(['mafia', 'citizen', 'citizen', 'citizen'], ['p2']), phase: /** @type {const} */ ('roleReveal') };
    expect(chooseBotAction(state, findPlayer(state, 'p2'), pickFirst)).toEqual({ type: 'ready' });
  });

  it('följer maffian som är människa, också när den ändrar sig', () => {
    let state = createGameWithBots(['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen'], ['p2']);
    state = applyAction(state, 'p2', { type: 'nightChoice', targetId: 'p3' });
    state = applyAction(state, 'p1', { type: 'nightChoice', targetId: 'p5' });
    expect(chooseBotAction(state, findPlayer(state, 'p2'), pickFirst)).toEqual({ type: 'nightChoice', targetId: 'p5' });
  });

  it('väljer samma offer när hela maffian är botar', () => {
    let state = createGameWithBots(['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen'], ['p1', 'p2']);
    for (let i = 0; i < 2; i++) {
      const move = findNextBotMove(state, Math.random);
      if (!move) throw new Error('Botarna borde vilja välja');
      state = applyAction(state, move.botId, move.action);
    }
    expect(state.nightChoices.p1).toBe(state.nightChoices.p2);
    expect(findNextBotMove(state, Math.random)).toBeNull();
  });

  it('väntar med att rösta tills alla människor har röstat och följer sedan flest röster', () => {
    let state = { ...createGameWithBots(['mafia', 'detective', 'doctor', 'citizen', 'citizen'], ['p5']), phase: /** @type {const} */ ('day') };
    const bot = findPlayer(state, 'p5');
    state = applyAction(state, 'p1', { type: 'vote', targetId: 'p2' });
    state = applyAction(state, 'p2', { type: 'vote', targetId: 'p1' });
    state = applyAction(state, 'p3', { type: 'vote', targetId: 'p1' });
    expect(chooseBotAction(state, bot, pickFirst)).toBeNull();
    state = applyAction(state, 'p4', { type: 'vote', targetId: 'p3' });
    expect(chooseBotAction(state, bot, pickFirst)).toEqual({ type: 'vote', targetId: 'p1' });
  });

  it('röstar aldrig på sin egen maffia', () => {
    let state = { ...createGameWithBots(['mafia', 'mafia', 'detective', 'doctor', 'citizen', 'citizen'], ['p2']), phase: /** @type {const} */ ('day') };
    for (const [id, targetId] of [['p1', 'p3'], ['p3', 'p1'], ['p4', 'p1'], ['p5', 'p1'], ['p6', 'p3']]) {
      state = applyAction(state, id, { type: 'vote', targetId });
    }
    expect(chooseBotAction(state, findPlayer(state, 'p2'), pickFirst)).toEqual({ type: 'vote', targetId: 'p3' });
  });

  it('röstar som detektiv på maffia den har hittat', () => {
    let state = { ...createGameWithBots(['mafia', 'detective', 'doctor', 'citizen', 'citizen'], ['p2']), phase: /** @type {const} */ ('day') };
    state = { ...state, investigations: { p2: [{ round: 1, targetId: 'p1', isMafia: true }] } };
    for (const [id, targetId] of [['p1', 'p3'], ['p3', 'p4'], ['p4', 'p3'], ['p5', SKIP_VOTE]]) {
      state = applyAction(state, id, { type: 'vote', targetId });
    }
    expect(chooseBotAction(state, findPlayer(state, 'p2'), pickFirst)).toEqual({ type: 'vote', targetId: 'p1' });
  });

  it('avstår när alla andra har avstått', () => {
    let state = { ...createGameWithBots(['mafia', 'detective', 'doctor', 'citizen'], ['p4']), phase: /** @type {const} */ ('day') };
    for (const id of ['p1', 'p2', 'p3']) state = applyAction(state, id, { type: 'vote', targetId: SKIP_VOTE });
    expect(chooseBotAction(state, findPlayer(state, 'p4'), pickFirst)).toEqual({ type: 'vote', targetId: SKIP_VOTE });
  });

  it('gör inget när den är ute ur spelet', () => {
    const state = createGameWithBots(['mafia', 'detective', 'doctor', 'citizen'], ['p4']);
    const outState = { ...state, players: state.players.map((p) => (p.id === 'p4' ? { ...p, isAlive: false } : p)) };
    expect(chooseBotAction(outState, findPlayer(outState, 'p4'), pickFirst)).toBeNull();
  });
});

describe('en människa och tre botar', () => {
  it('spelar ett helt parti till slutet', () => {
    for (let round = 0; round < 20; round++) {
      let state = addPlayer(createGame(), { id: 'h', name: 'Anna' });
      for (const id of ['b1', 'b2', 'b3']) state = addBot(state, id, Math.random);
      state = startGame(state, Math.random);
      state = applyAction(state, 'h', { type: 'ready' });
      for (let step = 0; step < 200 && state.phase !== 'gameOver'; step++) {
        state = playOneStep(state);
      }
      expect(state.phase).toBe('gameOver');
      expect(listBots(state)).toHaveLength(3);
    }
  });
});

/**
 * Ett steg som värden hade tagit: en bot gör något, annars människan, annars
 * går en nedräkning ut.
 * @param {GameState} state
 * @returns {GameState}
 */
function playOneStep(state) {
  const move = findNextBotMove(state, Math.random);
  if (move) return applyAction(state, move.botId, move.action);
  if (findHiddenDeathId(state)) return showDeathRole(state);
  if (isMorningDecided(state)) return endDecidedMorning(state);
  if (isVerdictShown(state)) return endVerdict(state);
  const human = findPlayer(state, 'h');
  if (state.phase === 'night' && human.isAlive && !state.nightChoices.h) {
    return applyAction(state, 'h', { type: 'nightChoice', targetId: listNightTargets(state, human)[0] });
  }
  if (state.phase === 'day' && human.isAlive && !state.dayVotes.h) {
    const targetId = state.players.find((p) => p.isAlive && p.id !== 'h')?.id ?? SKIP_VOTE;
    return applyAction(state, 'h', { type: 'vote', targetId });
  }
  throw new Error(`Spelet fastnade i ${state.phase}`);
}
