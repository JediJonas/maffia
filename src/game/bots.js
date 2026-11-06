// @ts-check
// Botar är datorstyrda spelare som fyller ut staden när man är för få.
// Värdens telefon kör dem med samma regler som alla andra: här bestäms bara
// vad en bot vill göra, och värden skickar det som en vanlig handling.
import { RuleError, SKIP_VOTE, addPlayer, hasMafiaAgreed, listNightTargets, livingPlayers, removePlayer } from './rules.js';
import { isMorningDecided } from './deathReveal.js';
import { createRandomAvatar } from '../avatar/avatarParts.js';

/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Player} Player */
/** @typedef {import('./types.js').PlayerAction} PlayerAction */

// Namn som passar en noirstad. Fler än rummet rymmer behövs inte.
const BOT_NAMES = [
  'Vito', 'Greta', 'Sixten', 'Doris', 'Harald', 'Kajsa', 'Bruno', 'Elsa',
  'Gunnar', 'Viola', 'Ragnar', 'Inez', 'Tore', 'Maud', 'Olof', 'Siri',
];

/**
 * @param {GameState} state
 * @returns {Player[]}
 */
export function listBots(state) {
  return state.players.filter((p) => p.isBot);
}

/**
 * Första namnet i listan som ingen har tagit, så att en bot aldrig krockar
 * med en spelare som redan heter så.
 * @param {GameState} state
 * @returns {string}
 */
export function pickBotName(state) {
  const takenNames = new Set(state.players.map((p) => p.name.toLowerCase()));
  const freeName = BOT_NAMES.find((name) => !takenNames.has(name.toLowerCase()));
  return freeName ?? `Bot ${state.players.length + 1}`;
}

/**
 * @param {GameState} state
 * @param {string} botId Värden skapar id:t, som för alla andra spelare.
 * @param {() => number} random Ett tal från 0 till 1, som Math.random.
 * @returns {GameState}
 */
export function addBot(state, botId, random) {
  return addPlayer(state, { id: botId, name: pickBotName(state), avatar: createRandomAvatar(random), isBot: true });
}

/**
 * Den senast tillagda boten går först, som när man räknar ned.
 * @param {GameState} state
 * @returns {GameState}
 */
export function removeLastBot(state) {
  const lastBot = listBots(state).at(-1);
  if (!lastBot) throw new RuleError('Det finns inga botar att ta bort.');
  return removePlayer(state, lastBot.id);
}

/**
 * Nästa sak någon bot vill göra. Värden gör en sak i taget, så att varje
 * bot ser vad de andra har gjort.
 * @param {GameState} state
 * @param {() => number} random
 * @returns {{ botId: string, action: PlayerAction } | null}
 */
export function findNextBotMove(state, random) {
  for (const bot of listBots(state)) {
    const action = chooseBotAction(state, bot, random);
    if (action) return { botId: bot.id, action };
  }
  return null;
}

/**
 * Vad boten vill göra just nu, eller null när den inte behöver göra något.
 * Värden frågar igen efter varje ändring, så en bot kan ångra sig när
 * maffian byter offer.
 * @param {GameState} state
 * @param {Player} bot
 * @param {() => number} random Ett tal från 0 till 1, som Math.random.
 * @returns {PlayerAction | null}
 */
export function chooseBotAction(state, bot, random) {
  switch (state.phase) {
    case 'roleReveal':
      return state.readyIds.includes(bot.id) ? null : { type: 'ready' };
    case 'night':
      return bot.isAlive ? chooseNightAction(state, bot, random) : null;
    case 'day':
      return bot.isAlive ? chooseVoteAction(state, bot, random) : null;
    default:
      return null;
  }
}

/**
 * Maffiabotar följer maffian som har valt, så att maffian blir överens.
 * Övriga väljer en gång och står fast vid det.
 * @param {GameState} state
 * @param {Player} bot
 * @param {() => number} random
 * @returns {PlayerAction | null}
 */
function chooseNightAction(state, bot, random) {
  const currentChoice = state.nightChoices[bot.id];
  const targets = listNightTargets(state, bot);
  if (bot.role === 'mafia') {
    const partnerChoice = findMafiaPartnerChoice(state, bot);
    if (partnerChoice && partnerChoice !== currentChoice) return { type: 'nightChoice', targetId: partnerChoice };
    if (currentChoice) return null;
    return { type: 'nightChoice', targetId: pickRandom(targets, random) };
  }
  if (currentChoice) return null;
  if (bot.role === 'detective') {
    const investigatedIds = (state.investigations[bot.id] ?? []).map((result) => result.targetId);
    const uninvestigated = targets.filter((id) => !investigatedIds.includes(id));
    return { type: 'nightChoice', targetId: pickRandom(uninvestigated.length ? uninvestigated : targets, random) };
  }
  return { type: 'nightChoice', targetId: pickRandom(targets, random) };
}

/**
 * Vad den övriga maffian har valt. En människas val går först, eftersom
 * människan inte följer boten. Är maffian redan överens finns inget att följa.
 * @param {GameState} state
 * @param {Player} bot
 * @returns {string | null}
 */
function findMafiaPartnerChoice(state, bot) {
  if (hasMafiaAgreed(state)) return null;
  const partners = livingPlayers(state).filter((p) => p.role === 'mafia' && p.id !== bot.id && state.nightChoices[p.id]);
  const leader = partners.find((p) => !p.isBot) ?? partners[0];
  return leader ? state.nightChoices[leader.id] : null;
}

/**
 * Botar röstar sist, när alla människor har röstat, och följer den som har
 * flest röster. Då avgör människorna dagen och botarna bara fyller på.
 * Maffiabotar röstar aldrig på sina egna, och en detektivbot röstar på
 * maffia som den har hittat.
 * @param {GameState} state
 * @param {Player} bot
 * @param {() => number} random
 * @returns {PlayerAction | null}
 */
function chooseVoteAction(state, bot, random) {
  if (state.dayVotes[bot.id] || isMorningDecided(state)) return null;
  const living = livingPlayers(state);
  const isWaitingForHumans = living.some((p) => !p.isBot && !state.dayVotes[p.id]);
  if (isWaitingForHumans) return null;

  const candidates = living.filter((p) => p.id !== bot.id && (bot.role !== 'mafia' || p.role !== 'mafia'));
  const candidateIds = candidates.map((p) => p.id);
  if (bot.role === 'detective') {
    const foundMafiaId = (state.investigations[bot.id] ?? [])
      .find((result) => result.isMafia && candidateIds.includes(result.targetId))?.targetId;
    if (foundMafiaId) return { type: 'vote', targetId: foundMafiaId };
  }
  const leaders = findMostVoted(state.dayVotes, candidateIds);
  if (leaders.length) return { type: 'vote', targetId: pickRandom(leaders, random) };
  // Har alla andra avstått avstår staden också, medan maffian alltid vill få bort någon.
  if (bot.role !== 'mafia' && Object.keys(state.dayVotes).length) return { type: 'vote', targetId: SKIP_VOTE };
  return { type: 'vote', targetId: candidateIds.length ? pickRandom(candidateIds, random) : SKIP_VOTE };
}

/**
 * @param {Record<string, string>} votes
 * @param {string[]} allowedIds
 * @returns {string[]} De tillåtna som har flest röster, flera vid lika.
 */
function findMostVoted(votes, allowedIds) {
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const targetId of Object.values(votes)) {
    if (allowedIds.includes(targetId)) counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
  }
  const top = Math.max(0, ...counts.values());
  return [...counts.entries()].filter(([, count]) => count === top).map(([id]) => id);
}

/**
 * @template T
 * @param {T[]} items Får inte vara tom.
 * @param {() => number} random
 * @returns {T}
 */
function pickRandom(items, random) {
  return items[Math.floor(random() * items.length)];
}
