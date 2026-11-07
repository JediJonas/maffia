// @ts-check
// Vad bildrutan överst visar i varje fas: en bild och två serierutor, som
// i ett seriealbum. Rutan uppe till vänster säger var vi är i berättelsen,
// rutan nere till höger vad som har hänt.

import { ROLE_INFO } from '../game/roles.js';

/** @typedef {import('./sceneImages.js').SceneImageKey} SceneImageKey */
/** @typedef {import('../game/playerView.js').PlayerView} PlayerView */

/**
 * @typedef {object} Scene
 * @property {SceneImageKey | null} image Null när värdens QR-kod står i rutan i stället.
 * @property {string} topCaption
 * @property {string | null} bottomCaption
 * @property {boolean} showsRoomCode Rumskoden står i rutan nere till höger.
 */

/** @type {Record<import('../game/types.js').Role, { image: SceneImageKey, bottomCaption: string }>} */
const NIGHT_SCENES = {
  mafia: { image: 'nightMafia', bottomCaption: '… men inte maffian.' },
  godfather: { image: 'nightMafia', bottomCaption: '… men inte maffian.' },
  detective: { image: 'nightDetective', bottomCaption: '… men inte du.' },
  doctor: { image: 'nightDoctor', bottomCaption: '… men inte du.' },
  taxiDriver: { image: 'nightTaxiDriver', bottomCaption: '… men inte du.' },
  windowWatcher: { image: 'nightWindowWatcher', bottomCaption: '… men inte du.' },
  sausageVendor: { image: 'nightSausageVendor', bottomCaption: '… men inte du.' },
  bartender: { image: 'nightBartender', bottomCaption: '… men inte du.' },
  mayor: { image: 'nightCitizen', bottomCaption: '… och så även du.' },
  madman: { image: 'nightCitizen', bottomCaption: '… och så även du.' },
  citizen: { image: 'nightCitizen', bottomCaption: '… och så även du.' },
};

/** @type {Record<import('../game/types.js').Role, SceneImageKey>} */
export const ROLE_IMAGES = {
  mafia: 'roleMafia',
  godfather: 'roleGodfather',
  detective: 'roleDetective',
  doctor: 'roleDoctor',
  taxiDriver: 'roleTaxiDriver',
  windowWatcher: 'roleWindowWatcher',
  sausageVendor: 'roleSausageVendor',
  bartender: 'roleBartender',
  mayor: 'roleMayor',
  madman: 'roleMadman',
  citizen: 'roleCitizen',
};

/**
 * @param {Pick<PlayerView, 'phase' | 'me' | 'players' | 'lastNight' | 'lastDay' | 'winner'>} view
 * @param {boolean} isHost Värden visar QR-koden i rutan, de andra en bild.
 * @param {boolean} [isRoleShown] Spelaren har öppnat akten och ser sin roll.
 * @returns {Scene | null} Null i faser utan bildruta.
 */
export function describeScene(view, isHost, isRoleShown = false) {
  switch (view.phase) {
    case 'lobby':
      return { image: isHost ? null : 'lobby', topCaption: 'Gänget samlas …', bottomCaption: null, showsRoomCode: true };
    case 'roleReveal':
      if (isRoleShown && view.me.role) {
        return scene(ROLE_IMAGES[view.me.role], 'Bara du får se det här.', `Du är ${ROLE_INFO[view.me.role].name.toLowerCase()}.`);
      }
      return scene('roleHidden', 'Det är dags.', 'Din roll ligger i akten.');
    case 'night':
      // Den som är ute ur spelet ser stadsbons bild, men utan "… och så även du", eftersom den inte är med.
      return scene(chooseNightImage(view.me), 'Staden sover …', isInGame(view.me) ? NIGHT_SCENES[view.me.role].bottomCaption : null);
    case 'day': {
      const killedId = view.lastNight?.killedId ?? null;
      if (!killedId) return scene('morningNoMurder', 'Staden vaknar …', 'Ingen blev mördad.');
      return scene('morningMurder', 'Staden vaknar …', `${describeWho(view, killedId)} blev mördad.`);
    }
    case 'verdict': {
      const executedId = view.lastDay?.executedId ?? null;
      const who = executedId ? describeWho(view, executedId) : 'Ingen';
      return scene('verdict', 'Staden har bestämt sig.', `${who} blev förvisad.`);
    }
    case 'gameOver':
      return describeEnding(view.winner);
    default:
      return null;
  }
}

/**
 * @param {PlayerView['winner']} winner
 * @returns {Scene}
 */
function describeEnding(winner) {
  switch (winner) {
    case 'mafia':
      return scene('mafiaWins', 'Och så var det över …', 'Maffian tar makten.');
    case 'madman':
      return scene('madmanWins', 'Och så var det över …', 'Galningen skrattar sist.');
    default:
      return scene('townWins', 'Och så var det över …', 'Maffian är besegrad.');
  }
}

/**
 * Bilderna som nästa fas kan visa. De hämtas i förväg, så att bildrutan inte
 * blinkar till tom medan bilden laddas när fasen byts. Bara nästa fas, inte
 * hela spelets bilder, så att den som har dåligt nät inte hämtar i onödan.
 * @param {Pick<PlayerView, 'phase' | 'me'>} view
 * @returns {SceneImageKey[]}
 */
export function listUpcomingImages(view) {
  switch (view.phase) {
    case 'lobby':
      return ['roleHidden'];
    case 'roleReveal':
      return view.me.role ? [ROLE_IMAGES[view.me.role], chooseNightImage(view.me)] : [];
    case 'night':
      return ['morningMurder', 'morningNoMurder'];
    case 'day':
      return ['verdict'];
    case 'verdict':
      return [chooseNightImage(view.me), 'mafiaWins', 'townWins', 'madmanWins'];
    case 'gameOver':
      return ['lobby', 'roleHidden'];
    default:
      return [];
  }
}

/**
 * @param {PlayerView['me']} me
 * @returns {me is PlayerView['me'] & { role: import('../game/types.js').Role }}
 */
function isInGame(me) {
  return me.isAlive && me.role !== null;
}

/**
 * Den som är ute ur spelet ser stadsbons bild, så att ingen ser vilken roll den hade.
 * @param {PlayerView['me']} me
 * @returns {SceneImageKey}
 */
function chooseNightImage(me) {
  return isInGame(me) ? NIGHT_SCENES[me.role].image : NIGHT_SCENES.citizen.image;
}

/**
 * @param {SceneImageKey} image
 * @param {string} topCaption
 * @param {string | null} bottomCaption
 * @returns {Scene}
 */
function scene(image, topCaption, bottomCaption) {
  return { image, topCaption, bottomCaption, showsRoomCode: false };
}

/**
 * @param {Pick<PlayerView, 'me' | 'players'>} view
 * @param {string} playerId
 */
function describeWho(view, playerId) {
  if (playerId === view.me.id) return 'Du';
  return view.players.find((p) => p.id === playerId)?.name ?? 'Någon';
}
