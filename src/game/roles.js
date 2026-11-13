// @ts-check
/** @typedef {import('./types.js').Role} Role */
/** @typedef {import('./types.js').Team} Team */

export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;

/**
 * team är laget som rollen vinner med. Bartendern vinner med maffian men är
 * inte maffia, och galningen vinner bara själv.
 * @type {Record<Role, { name: string, team: Team, description: string }>}
 */
export const ROLE_INFO = {
  mafia: {
    name: 'Maffia',
    team: 'mafia',
    description: 'Varje natt väljer ni tillsammans någon som ska mördas. Ni vinner när ni är lika många som de andra.',
  },
  godfather: {
    name: 'Gudfadern',
    team: 'mafia',
    description: 'Du leder maffian. Varje natt väljer ni tillsammans någon som ska mördas. Detektiven ser dig alltid som oskyldig.',
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
  bodyguard: {
    name: 'Livvakt',
    team: 'town',
    description: 'Varje natt skyddar du en person. Kommer maffian dit överlever personen, men du slåss med maffian och en av er dör. Du får inte skydda samma person två nätter i rad.',
  },
  lawyer: {
    name: 'Advokat',
    team: 'town',
    description: 'Varje natt väljer du en klient. Får klienten flest röster nästa dag träder du in, och ingen blir förvisad. Du får inte välja samma klient två nätter i rad.',
  },
  taxiDriver: {
    name: 'Taxichaufför',
    team: 'town',
    description: 'Varje natt följer du en person i din taxi och får veta vem den besökte. Varför den gick dit får du inte veta.',
  },
  windowWatcher: {
    name: 'Fönstertittare',
    team: 'town',
    description: 'Varje natt bevakar du en persons fönster och får veta vilka som kom på besök. Varför de kom får du inte veta.',
  },
  sausageVendor: {
    name: 'Korvgubbe',
    team: 'town',
    description: 'Varje natt bjuder du någon på en korv med extra allt. Med munnen full får den inte prata nästa dag, men den får rösta.',
  },
  mayor: {
    name: 'Borgmästare',
    team: 'town',
    description: 'Du sover om nätterna. På dagen räknas din röst två gånger, och alla ser det när du röstar.',
  },
  citizen: {
    name: 'Stadsbo',
    team: 'town',
    description: 'Du sover om nätterna. På dagen lyssnar du, misstänker och röstar ut maffian.',
  },
  bartender: {
    name: 'Bartender',
    team: 'mafia',
    description: 'Varje natt bjuder du en person på en drink, så att den misslyckas med sin uppgift. Du är inte maffia men vinner om maffian vinner.',
  },
  madman: {
    name: 'Galningen',
    team: 'madman',
    description: 'Du vinner bara om staden förvisar dig. Få dem att tro att du är maffia, men inte för tydligt. Om nätterna sover du.',
  },
};

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
  return role ? ROLE_INFO[role].team : 'town';
}

/**
 * Maffian själv: de känner varandra, mördar tillsammans och räknas när
 * maffian ska bli lika många som de andra. Bartendern håller bara på den.
 * @param {Role | null} role
 * @returns {boolean}
 */
export function isMafia(role) {
  return role === 'mafia' || role === 'godfather';
}
