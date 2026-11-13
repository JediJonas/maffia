// @ts-check
// Läckkontrollen: letar efter sådant i en telefons vy som telefonen inte får
// veta, som andras roller, andras nattval eller andras hemliga nycklar.
// Reglerna här skrivs fristående från playerView.js, så att ett fel där
// fångas här i stället för att kopieras. Används av enhetstestet, som spelar
// hela partier med botar, och av webbläsartestet, som loggar varje meddelande
// som värden skickar.
import { ROLE_INFO, isMafia } from './roles.js';

/** @typedef {import('./types.js').Role} Role */

/**
 * Det sanna läget, som telefonen själv inte ska kunna se.
 * @typedef {object} LeakTruth
 * @property {Record<string, Role | null>} roles Allas roller, efter spelar-id.
 * @property {Record<string, string>} [nightChoices] Allas nattval, när de är kända.
 * @property {string[]} [secrets] Andras hemliga nycklar, som aldrig får skickas.
 */

// Fälten som en vy får ha. Ett nytt fält ska granskas för läckor och sedan
// läggas till här, så att ingen lägger till något i vyn utan att tänka efter.
const ALLOWED_FIELDS = {
  view: [
    'phase', 'round', 'me', 'players', 'readyCount', 'isReady', 'nightTargetIds', 'myNightChoice', 'nightChosenCount',
    'hasMafiaAgreed', 'livingCount', 'mafiaTeam', 'investigations', 'sightings', 'doubleVoterIds', 'dayVotes', 'settings',
    'isRoleRevealPending', 'lastNight', 'lastDay', 'winner', 'killedImageVariant', 'executedImageVariant',
    'madmanImageVariant', 'defendedImageVariant',
  ],
  me: ['id', 'name', 'role', 'isAlive'],
  player: ['id', 'name', 'isAlive', 'isConnected', 'isBot', 'avatar', 'revealedRole'],
  mafiaTeam: ['id', 'role', 'choiceId'],
  investigation: ['round', 'targetId', 'isMafia'],
  sighting: ['round', 'targetId', 'seenIds'],
  lastNight: ['killedId', 'silencedId', 'imageRoll'],
  lastDay: ['executedId', 'isRoleShown', 'defendedId'],
};

// Ställen där ett rollnamn får stå. winner är ett lag, men lagen mafia och
// madman heter som rollerna. Namn skriver spelarna själva.
const ROLE_PATHS = [
  /^me\.role$/, /^players\[\d+\]\.revealedRole$/, /^mafiaTeam\[\d+\]\.role$/, /^winner$/, /(^|\.)name$/,
];
const ROLE_NAMES = new Set(Object.keys(ROLE_INFO));
const SIGHTING_ROLES = new Set(['taxiDriver', 'windowWatcher']);

/**
 * @param {import('./playerView.js').PlayerView} view
 * @param {LeakTruth} truth
 * @returns {string[]} En rad per läcka. Tom när vyn är ren.
 */
export function findLeaks(view, truth) {
  const myRole = truth.roles[view.me.id] ?? null;
  return [
    ...findUnknownFields(view),
    ...findRoleLeaks(view, truth, myRole),
    ...findTeamLeaks(view, truth, myRole),
    ...findChoiceLeaks(view, truth),
    ...findStrayRoleNames(view),
    ...findSecrets(view, truth.secrets ?? []),
  ];
}

/**
 * @param {import('./playerView.js').PlayerView} view
 * @returns {string[]}
 */
function findUnknownFields(view) {
  /** @type {[string, unknown, string[]][]} */
  const parts = [
    ['vyn', view, ALLOWED_FIELDS.view],
    ['me', view.me, ALLOWED_FIELDS.me],
    ['lastNight', view.lastNight, ALLOWED_FIELDS.lastNight],
    ['lastDay', view.lastDay, ALLOWED_FIELDS.lastDay],
    ...view.players.map((p, i) => /** @type {[string, unknown, string[]]} */ ([`players[${i}]`, p, ALLOWED_FIELDS.player])),
    ...view.mafiaTeam.map((m, i) => /** @type {[string, unknown, string[]]} */ ([`mafiaTeam[${i}]`, m, ALLOWED_FIELDS.mafiaTeam])),
    ...view.investigations.map((x, i) => /** @type {[string, unknown, string[]]} */ ([`investigations[${i}]`, x, ALLOWED_FIELDS.investigation])),
    ...view.sightings.map((x, i) => /** @type {[string, unknown, string[]]} */ ([`sightings[${i}]`, x, ALLOWED_FIELDS.sighting])),
  ];
  return parts.flatMap(([where, value, allowed]) => {
    if (!value || typeof value !== 'object') return [];
    return Object.keys(value)
      .filter((key) => !allowed.includes(key))
      .map((key) => `Okänt fält ${key} i ${where}. Granska det och lägg till det i leakCheck.js.`);
  });
}

/**
 * Andras roller syns bara för döda när inställningen tillåter det, och för
 * alla när spelet är slut. Den förvisades roll syns först efter nedräkningen.
 * @param {import('./playerView.js').PlayerView} view
 * @param {LeakTruth} truth
 * @param {Role | null} myRole
 * @returns {string[]}
 */
function findRoleLeaks(view, truth, myRole) {
  const leaks = [];
  if (view.me.role !== null && view.me.role !== myRole) leaks.push(`me.role är ${view.me.role}, men spelaren är ${myRole}.`);
  for (const player of view.players) {
    if (!player.revealedRole) continue;
    const isPending = view.isRoleRevealPending && player.id === view.lastDay?.executedId;
    const mayShow = view.phase === 'gameOver' || (!player.isAlive && view.settings.revealsRoleOnDeath && !isPending);
    if (!mayShow) leaks.push(`${player.name} visas som ${player.revealedRole} för ${view.me.name} i fasen ${view.phase}.`);
    else if (player.revealedRole !== truth.roles[player.id]) leaks.push(`${player.name} visas med fel roll.`);
  }
  return leaks;
}

/**
 * Bara maffian känner varandra. Detektivens och vittnenas resultat är deras egna.
 * @param {import('./playerView.js').PlayerView} view
 * @param {LeakTruth} truth
 * @param {Role | null} myRole
 * @returns {string[]}
 */
function findTeamLeaks(view, truth, myRole) {
  const leaks = [];
  const amMafia = isMafia(myRole);
  if (view.mafiaTeam.length && !amMafia) leaks.push(`${view.me.name} (${myRole}) ser maffians lag.`);
  for (const member of view.mafiaTeam) {
    if (!isMafia(truth.roles[member.id] ?? null)) leaks.push(`mafiaTeam innehåller ${member.id}, som inte är maffia.`);
    if (member.id === view.me.id) leaks.push('mafiaTeam innehåller spelaren själv.');
  }
  if (view.hasMafiaAgreed !== null && !amMafia) leaks.push(`${view.me.name} (${myRole}) ser om maffian är överens.`);
  if (view.investigations.length && myRole !== 'detective') leaks.push(`${view.me.name} (${myRole}) ser detektivens resultat.`);
  if (view.sightings.length && !SIGHTING_ROLES.has(myRole ?? '')) leaks.push(`${view.me.name} (${myRole}) ser vad någon såg i natt.`);
  return leaks;
}

/**
 * Det egna nattvalet, och maffians val för maffian, men inga andra.
 * @param {import('./playerView.js').PlayerView} view
 * @param {LeakTruth} truth
 * @returns {string[]}
 */
function findChoiceLeaks(view, truth) {
  const choices = truth.nightChoices;
  if (!choices) return [];
  const leaks = [];
  if (view.myNightChoice !== null && view.myNightChoice !== choices[view.me.id]) {
    leaks.push(`myNightChoice för ${view.me.name} är någon annans val.`);
  }
  for (const member of view.mafiaTeam) {
    if (member.choiceId !== null && member.choiceId !== choices[member.id]) leaks.push(`mafiaTeam visar fel val för ${member.id}.`);
  }
  return leaks;
}

/**
 * Ett rollnamn utanför de tillåtna fälten är nästan alltid en läcka, till
 * exempel en roll som någon har lagt i lastNight.
 * @param {import('./playerView.js').PlayerView} view
 * @returns {string[]}
 */
function findStrayRoleNames(view) {
  return listStrings(view, '')
    .filter(({ path, value }) => ROLE_NAMES.has(value) && !ROLE_PATHS.some((pattern) => pattern.test(path)))
    .map(({ path, value }) => `Rollen ${value} står i ${path}.`);
}

/**
 * @param {import('./playerView.js').PlayerView} view
 * @param {string[]} secrets
 * @returns {string[]}
 */
function findSecrets(view, secrets) {
  if (!secrets.length) return [];
  return listStrings(view, '')
    .filter(({ value }) => secrets.some((secret) => value.includes(secret)))
    .map(({ path }) => `En annan telefons hemliga nyckel står i ${path}.`);
}

/**
 * Alla textvärden i ett objekt med sin väg, som players[2].name.
 * @param {unknown} value
 * @param {string} path
 * @returns {{ path: string, value: string }[]}
 */
function listStrings(value, path) {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, i) => listStrings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => listStrings(item, path ? `${path}.${key}` : key));
  }
  return [];
}
