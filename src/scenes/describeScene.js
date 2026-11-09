// @ts-check
// Vad bildrutan överst visar i varje fas: en bild och två serierutor, som
// i ett seriealbum. Rutan uppe till vänster säger var vi är i berättelsen,
// rutan nere till höger vad som har hänt.

import { ROLE_INFO } from '../game/roles.js';

/** @typedef {import('./sceneImages.js').SceneImageKey} SceneImageKey */
/** @typedef {import('../game/playerView.js').PlayerView} PlayerView */
/** @typedef {import('./roleImageChoice.js').RoleImageVariant} RoleImageVariant */

/**
 * @typedef {object} Scene
 * @property {SceneImageKey | null} image Null när värdens QR-kod står i rutan i stället.
 * @property {string} topCaption
 * @property {string | null} bottomCaption
 * @property {boolean} showsRoomCode Rumskoden står i rutan nere till höger.
 */

/**
 * Nattbilden visar, som rollbilden, en kvinna eller en man. Roller som bara
 * har en bild visar samma för båda.
 * @type {Record<import('../game/types.js').Role, { images: Record<RoleImageVariant, SceneImageKey>, bottomCaption: string }>}
 */
const NIGHT_SCENES = {
  mafia: { images: { woman: 'nightMafia', man: 'nightMafia' }, bottomCaption: '… men inte maffian.' },
  godfather: { images: { woman: 'nightMafia', man: 'nightMafia' }, bottomCaption: '… men inte maffian.' },
  detective: { images: { woman: 'nightDetective', man: 'nightDetective' }, bottomCaption: '… men inte du.' },
  doctor: { images: { woman: 'nightDoctor', man: 'nightDoctor' }, bottomCaption: '… men inte du.' },
  taxiDriver: { images: { woman: 'nightTaxiDriverWoman', man: 'nightTaxiDriverMan' }, bottomCaption: '… men inte du.' },
  windowWatcher: { images: { woman: 'nightWindowWatcherWoman', man: 'nightWindowWatcherMan' }, bottomCaption: '… men inte du.' },
  sausageVendor: { images: { woman: 'nightSausageVendorWoman', man: 'nightSausageVendorMan' }, bottomCaption: '… men inte du.' },
  bartender: { images: { woman: 'nightBartenderWoman', man: 'nightBartenderMan' }, bottomCaption: '… men inte du.' },
  mayor: { images: { woman: 'nightCitizenWoman', man: 'nightCitizenMan' }, bottomCaption: '… och så även du.' },
  madman: { images: { woman: 'nightCitizenWoman', man: 'nightCitizenMan' }, bottomCaption: '… och så även du.' },
  citizen: { images: { woman: 'nightCitizenWoman', man: 'nightCitizenMan' }, bottomCaption: '… och så även du.' },
};

/** @type {Record<import('../game/types.js').Role, Record<RoleImageVariant, SceneImageKey>>} Varje roll har en kvinna och en man. */
const ROLE_IMAGES = {
  mafia: { woman: 'roleMafiaWoman', man: 'roleMafiaMan' },
  godfather: { woman: 'roleGodfatherWoman', man: 'roleGodfatherMan' },
  detective: { woman: 'roleDetectiveWoman', man: 'roleDetectiveMan' },
  doctor: { woman: 'roleDoctorWoman', man: 'roleDoctorMan' },
  taxiDriver: { woman: 'roleTaxiDriverWoman', man: 'roleTaxiDriverMan' },
  windowWatcher: { woman: 'roleWindowWatcherWoman', man: 'roleWindowWatcherMan' },
  sausageVendor: { woman: 'roleSausageVendorWoman', man: 'roleSausageVendorMan' },
  bartender: { woman: 'roleBartenderWoman', man: 'roleBartenderMan' },
  mayor: { woman: 'roleMayorWoman', man: 'roleMayorMan' },
  madman: { woman: 'roleMadmanWoman', man: 'roleMadmanMan' },
  citizen: { woman: 'roleCitizenWoman', man: 'roleCitizenMan' },
};

/**
 * Galningen förs bort som en kvinna eller en man. Varje telefon följer sitt
 * eget val av rollbild, eftersom valet aldrig skickas till värden.
 * @type {Record<RoleImageVariant, SceneImageKey>}
 */
const MADMAN_WINS_IMAGES = { woman: 'madmanWinsWoman', man: 'madmanWinsMan' };

/**
 * @param {import('../game/types.js').Role} role
 * @param {RoleImageVariant} variant Vald i Ändra figur (se roleImageChoice.js).
 * @returns {SceneImageKey}
 */
export function chooseRoleImage(role, variant) {
  return ROLE_IMAGES[role][variant];
}

/**
 * Mordbilderna som värden slumpar mellan, just nu bara en. Alla telefoner visar samma, eftersom
 * slumptalet följer med nattens utfall (se NightOutcome).
 * @type {SceneImageKey[]}
 */
export const MURDER_IMAGES = ['morningMurder'];

/**
 * @param {number | undefined} imageRoll Saknas i spel som sparades innan mordbilden slumpades.
 * @returns {SceneImageKey}
 */
export function chooseMurderImage(imageRoll = 0) {
  const index = Math.min(Math.floor(imageRoll * MURDER_IMAGES.length), MURDER_IMAGES.length - 1);
  return MURDER_IMAGES[index];
}

/**
 * @param {Pick<PlayerView, 'phase' | 'me' | 'players' | 'lastNight' | 'lastDay' | 'winner'>} view
 * @param {boolean} isHost Värden visar QR-koden i rutan, de andra en bild.
 * @param {boolean} [isRoleShown] Spelaren har öppnat akten och ser sin roll.
 * @param {RoleImageVariant} [roleImageVariant]
 * @returns {Scene | null} Null i faser utan bildruta.
 */
export function describeScene(view, isHost, isRoleShown = false, roleImageVariant = 'woman') {
  switch (view.phase) {
    case 'lobby':
      return { image: isHost ? null : 'lobby', topCaption: 'Gänget samlas …', bottomCaption: null, showsRoomCode: true };
    case 'roleReveal':
      if (isRoleShown && view.me.role) {
        return scene(chooseRoleImage(view.me.role, roleImageVariant), 'Bara du får se det här.', `Du är ${ROLE_INFO[view.me.role].name.toLowerCase()}.`);
      }
      return scene('roleHidden', 'Det är dags.', 'Din roll ligger i akten.');
    case 'night':
      // Den som är ute ur spelet ser stadsbons bild, men utan "… och så även du", eftersom den inte är med.
      return scene(chooseNightImage(view.me, roleImageVariant), 'Staden sover …', isInGame(view.me) ? NIGHT_SCENES[view.me.role].bottomCaption : null);
    case 'day': {
      const killedId = view.lastNight?.killedId ?? null;
      if (!killedId) return scene('morningNoMurder', 'Staden vaknar …', 'Ingen blev mördad.');
      return scene(chooseMurderImage(view.lastNight?.imageRoll), 'Staden vaknar …', `${describeWho(view, killedId)} blev mördad.`);
    }
    case 'verdict': {
      const executedId = view.lastDay?.executedId ?? null;
      const who = executedId ? describeWho(view, executedId) : 'Ingen';
      return scene('verdict', 'Staden har bestämt sig.', `${who} blev förvisad.`);
    }
    case 'gameOver':
      return describeEnding(view.winner, roleImageVariant);
    default:
      return null;
  }
}

/**
 * @param {PlayerView['winner']} winner
 * @param {RoleImageVariant} roleImageVariant
 * @returns {Scene}
 */
function describeEnding(winner, roleImageVariant) {
  switch (winner) {
    case 'mafia':
      return scene('mafiaWins', 'Och så var det över …', 'Maffian tar makten.');
    case 'madman':
      return scene(MADMAN_WINS_IMAGES[roleImageVariant], 'Och så var det över …', 'Galningen skrattar sist.');
    default:
      return scene('townWins', 'Och så var det över …', 'Maffian är besegrad.');
  }
}

/**
 * Bilderna som nästa fas kan visa. De hämtas i förväg, så att bildrutan inte
 * blinkar till tom medan bilden laddas när fasen byts. Bara nästa fas, inte
 * hela spelets bilder, så att den som har dåligt nät inte hämtar i onödan.
 * @param {Pick<PlayerView, 'phase' | 'me'>} view
 * @param {RoleImageVariant} [roleImageVariant]
 * @returns {SceneImageKey[]}
 */
export function listUpcomingImages(view, roleImageVariant = 'woman') {
  switch (view.phase) {
    case 'lobby':
      return ['roleHidden'];
    case 'roleReveal':
      return view.me.role ? [chooseRoleImage(view.me.role, roleImageVariant), chooseNightImage(view.me, roleImageVariant)] : [];
    case 'night':
      // Vilken mordbild det blir avgörs först när natten tar slut, så alla hämtas.
      return [...MURDER_IMAGES, 'morningNoMurder'];
    case 'day':
      return ['verdict'];
    case 'verdict':
      return [chooseNightImage(view.me, roleImageVariant), 'mafiaWins', 'townWins', MADMAN_WINS_IMAGES[roleImageVariant]];
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
 * @param {RoleImageVariant} variant
 * @returns {SceneImageKey}
 */
function chooseNightImage(me, variant) {
  return (isInGame(me) ? NIGHT_SCENES[me.role] : NIGHT_SCENES.citizen).images[variant];
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
 * Berättarrutan använder namnet även för den det gäller, som i en berättelse.
 * Bredvid avataren står i stället "Du" (se deathText.js).
 * @param {Pick<PlayerView, 'players'>} view
 * @param {string} playerId
 */
function describeWho(view, playerId) {
  return view.players.find((p) => p.id === playerId)?.name ?? 'Någon';
}
