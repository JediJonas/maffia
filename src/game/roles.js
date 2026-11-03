// @ts-check
/** @typedef {import('./types.js').Role} Role */
/** @typedef {import('./types.js').Team} Team */

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;

// En maffia per påbörjad fyragrupp utöver de första tre ger ungefär en
// fjärdedel maffia, vilket är den klassiska balansen.
const PLAYERS_PER_MAFIA = 4;

/** @type {Record<Role, { name: string, team: Team, description: string }>} */
export const ROLE_INFO = {
  mafia: {
    name: 'Maffia',
    team: 'mafia',
    description: 'Varje natt väljer ni tillsammans någon som ska dö. Ni vinner när ni är minst lika många som de andra.',
  },
  detective: {
    name: 'Detektiv',
    team: 'town',
    description: 'Varje natt undersöker du en spelare och får veta om den är maffia.',
  },
  doctor: {
    name: 'Läkare',
    team: 'town',
    description: 'Varje natt skyddar du en spelare från maffian. Du får inte skydda samma spelare två nätter i rad.',
  },
  citizen: {
    name: 'Medborgare',
    team: 'town',
    description: 'Du har ingen nattroll. Lyssna, misstänk och rösta ut maffian på dagen.',
  },
};

/**
 * @param {number} playerCount
 * @returns {Role[]} Rollerna i fast ordning, innan de blandas.
 */
export function buildRoleList(playerCount) {
  const mafiaCount = Math.max(1, Math.floor(playerCount / PLAYERS_PER_MAFIA));
  /** @type {Role[]} */
  const roles = Array(mafiaCount).fill('mafia');
  roles.push('detective', 'doctor');
  while (roles.length < playerCount) roles.push('citizen');
  return roles;
}

/**
 * Fisher–Yates med inskjuten slump så att testerna kan styra utfallet.
 * @template T
 * @param {T[]} items
 * @param {() => number} random Returnerar ett tal i [0, 1), som Math.random.
 * @returns {T[]}
 */
export function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * @param {Role | null} role
 * @returns {Team}
 */
export function teamOf(role) {
  return role === 'mafia' ? 'mafia' : 'town';
}
