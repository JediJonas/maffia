// @ts-check
// Vad bildrutan överst visar i varje fas: en bild och två serierutor, som
// i ett seriealbum. Rutan uppe till vänster säger var vi är i berättelsen,
// rutan nere till höger vad som har hänt.

import { ROLE_INFO, isMafia } from '../game/roles.js';
import { hashText } from './roleImageChoice.js';

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
  mafia: { images: { woman: 'nightMafia1', man: 'nightMafia1' }, bottomCaption: '… men inte maffian.' },
  godfather: { images: { woman: 'nightMafia1', man: 'nightMafia1' }, bottomCaption: '… men inte maffian.' },
  detective: { images: { woman: 'nightDetectiveWoman', man: 'nightDetectiveMan' }, bottomCaption: '… men inte du.' },
  doctor: { images: { woman: 'nightDoctorWoman', man: 'nightDoctorMan' }, bottomCaption: '… men inte du.' },
  bodyguard: { images: { woman: 'nightBodyguardWoman', man: 'nightBodyguardMan' }, bottomCaption: '… men inte du.' },
  lawyer: { images: { woman: 'nightLawyerWoman', man: 'nightLawyerMan' }, bottomCaption: '… men inte du.' },
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
  bodyguard: { woman: 'roleBodyguardWoman', man: 'roleBodyguardMan' },
  lawyer: { woman: 'roleLawyerWoman', man: 'roleLawyerMan' },
  taxiDriver: { woman: 'roleTaxiDriverWoman', man: 'roleTaxiDriverMan' },
  windowWatcher: { woman: 'roleWindowWatcherWoman', man: 'roleWindowWatcherMan' },
  sausageVendor: { woman: 'roleSausageVendorWoman', man: 'roleSausageVendorMan' },
  bartender: { woman: 'roleBartenderWoman', man: 'roleBartenderMan' },
  mayor: { woman: 'roleMayorWoman', man: 'roleMayorMan' },
  madman: { woman: 'roleMadmanWoman', man: 'roleMadmanMan' },
  citizen: { woman: 'roleCitizenWoman', man: 'roleCitizenMan' },
};

/**
 * @param {import('../game/types.js').Role} role
 * @param {RoleImageVariant} variant Vald i Ändra figur (se roleImageChoice.js).
 * @returns {SceneImageKey}
 */
export function chooseRoleImage(role, variant) {
  return ROLE_IMAGES[role][variant];
}

/**
 * Mordbilderna som värden slumpar mellan, med en kvinna eller en man efter
 * den mördades eget val av rollbild. Alla telefoner visar samma, eftersom
 * slumptalet följer med nattens utfall och valet med vyn (se killedImageVariant).
 * @type {Record<RoleImageVariant, SceneImageKey[]>}
 */
export const MURDER_IMAGES = {
  woman: ['morningMurderWoman', 'morningMurderHotelWoman', 'morningMurderCloseUpWoman', 'morningMurderPoliceWoman', 'morningMurderStairsWoman', 'morningMurderPlatformWoman', 'morningMurderDocksWoman', 'morningMurderPhoneBoothWoman'],
  man: ['morningMurderMan', 'morningMurderHotelMan', 'morningMurderCloseUpMan', 'morningMurderPoliceMan', 'morningMurderDocksMan', 'morningMurderPhoneBoothMan', 'morningMurderStairsMan', 'morningMurderPlatformMan'],
};

/**
 * @param {number | undefined} imageRoll Saknas i spel som sparades innan mordbilden slumpades.
 * @param {RoleImageVariant} variant
 * @returns {SceneImageKey}
 */
export function chooseMurderImage(imageRoll = 0, variant = 'man') {
  const images = MURDER_IMAGES[variant];
  return images[Math.min(Math.floor(imageRoll * images.length), images.length - 1)];
}

/**
 * Maffians nattbilder. En ny dras varje natt, men alla i maffian ser samma.
 * @type {SceneImageKey[]}
 */
const NIGHT_MAFIA_IMAGES = ['nightMafia1', 'nightMafia2', 'nightMafia3'];

/**
 * Dombilden visar den förvisades eget val av rollbild (se executedImageVariant).
 * @type {Record<RoleImageVariant, SceneImageKey>}
 */
const VERDICT_IMAGES = { woman: 'verdictWoman', man: 'verdictMan' };

/**
 * Advokaten träder in för klienten, som är en kvinna eller en man efter
 * klientens eget val av rollbild (se defendedImageVariant). Advokaten är
 * densamma i båda och följer inte den riktiga advokaten, så bilden avslöjar
 * inte vem som är advokat (Jonas 2026-11-13).
 * @type {Record<RoleImageVariant, SceneImageKey>}
 */
const DEFENDED_IMAGES = { woman: 'verdictLawyerWoman', man: 'verdictLawyerMan' };

/**
 * Galningen förs bort som en kvinna eller en man, efter galningens eget val
 * (se madmanImageVariant i PlayerView).
 * @type {Record<RoleImageVariant, SceneImageKey>}
 */
const MADMAN_WINS_IMAGES = { woman: 'madmanWinsWoman', man: 'madmanWinsMan' };

/**
 * @param {Pick<PlayerView, 'phase' | 'me' | 'players' | 'lastNight' | 'lastDay' | 'winner' | 'round' | 'mafiaTeam' | 'killedImageVariant' | 'executedImageVariant' | 'madmanImageVariant' | 'defendedImageVariant'>} view
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
      return scene(chooseNightImage(view, roleImageVariant), 'Staden sover …', isInGame(view.me) ? NIGHT_SCENES[view.me.role].bottomCaption : null);
    case 'day': {
      const killedId = view.lastNight?.killedId ?? null;
      if (!killedId) return scene('morningNoMurder', 'Staden vaknar …', 'Ingen blev mördad.');
      return scene(chooseMurderImage(view.lastNight?.imageRoll, view.killedImageVariant ?? 'man'), 'Staden vaknar …', `${describeWho(view, killedId)} blev mördad.`);
    }
    case 'verdict': {
      const defendedId = view.lastDay?.defendedId;
      if (defendedId) {
        return scene(DEFENDED_IMAGES[view.defendedImageVariant ?? roleImageVariant], 'Staden har bestämt sig.', 'Men advokaten träder in.');
      }
      const executedId = view.lastDay?.executedId ?? null;
      const who = executedId ? describeWho(view, executedId) : 'Ingen';
      const image = executedId ? VERDICT_IMAGES[view.executedImageVariant ?? roleImageVariant] : 'verdictNobody';
      return scene(image, 'Staden har bestämt sig.', `${who} blev förvisad.`);
    }
    case 'gameOver':
      return describeEnding(view.winner, view.madmanImageVariant ?? roleImageVariant);
    default:
      return null;
  }
}

/**
 * @param {PlayerView['winner']} winner
 * @param {RoleImageVariant} madmanImageVariant
 * @returns {Scene}
 */
function describeEnding(winner, madmanImageVariant) {
  switch (winner) {
    case 'mafia':
      return scene('mafiaWins', 'Och så var det över …', 'Maffian tar makten.');
    case 'madman':
      return scene(MADMAN_WINS_IMAGES[madmanImageVariant], 'Och så var det över …', 'Galningen skrattar sist.');
    default:
      return scene('townWins', 'Och så var det över …', 'Maffian är besegrad.');
  }
}

/**
 * Bilderna som nästa fas kan visa. De hämtas i förväg, så att bildrutan inte
 * blinkar till tom medan bilden laddas när fasen byts. Bara nästa fas, inte
 * hela spelets bilder, så att den som har dåligt nät inte hämtar i onödan.
 * @param {Pick<PlayerView, 'phase' | 'me' | 'settings'>} view
 * @param {RoleImageVariant} [roleImageVariant]
 * @returns {SceneImageKey[]}
 */
export function listUpcomingImages(view, roleImageVariant = 'woman') {
  switch (view.phase) {
    case 'lobby':
      return ['roleHidden'];
    case 'roleReveal':
      return view.me.role ? [chooseRoleImage(view.me.role, roleImageVariant), ...listNightImages(view.me, roleImageVariant)] : [];
    case 'night':
      // Vilken mordbild det blir avgörs först när natten tar slut, så alla hämtas.
      return [...MURDER_IMAGES.woman, ...MURDER_IMAGES.man, 'morningNoMurder'];
    case 'day':
      // Advokatens bilder bara när advokaten är med, så att ingen hämtar dem i onödan.
      return [VERDICT_IMAGES.woman, VERDICT_IMAGES.man, 'verdictNobody', ...(view.settings.hasLawyer ? Object.values(DEFENDED_IMAGES) : [])];
    case 'verdict':
      return [...listNightImages(view.me, roleImageVariant), 'mafiaWins', 'townWins', MADMAN_WINS_IMAGES.woman, MADMAN_WINS_IMAGES.man];
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
 * @param {Pick<PlayerView, 'me' | 'round' | 'mafiaTeam'>} view
 * @param {RoleImageVariant} variant
 * @returns {SceneImageKey}
 */
function chooseNightImage({ me, round, mafiaTeam }, variant) {
  if (isInGame(me) && isMafia(me.role)) {
    // Natten och maffians id avgör, så att hela maffian ser samma bild.
    const mafiaIds = [me.id, ...mafiaTeam.map((m) => m.id)].sort().join(',');
    return NIGHT_MAFIA_IMAGES[hashText(`${round}:${mafiaIds}`) % NIGHT_MAFIA_IMAGES.length];
  }
  return (isInGame(me) ? NIGHT_SCENES[me.role] : NIGHT_SCENES.citizen).images[variant];
}

/**
 * Nattbilderna som nästa natt kan visa. För maffian är det alla tre.
 * @param {PlayerView['me']} me
 * @param {RoleImageVariant} variant
 * @returns {SceneImageKey[]}
 */
function listNightImages(me, variant) {
  if (isInGame(me) && isMafia(me.role)) return NIGHT_MAFIA_IMAGES;
  return [(isInGame(me) ? NIGHT_SCENES[me.role] : NIGHT_SCENES.citizen).images[variant]];
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
