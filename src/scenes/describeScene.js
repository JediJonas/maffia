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
  detective: { image: 'nightDetective', bottomCaption: '… men inte du.' },
  doctor: { image: 'nightDoctor', bottomCaption: '… men inte du.' },
  citizen: { image: 'nightCitizen', bottomCaption: '… och så även du.' },
};

/** @type {Record<import('../game/types.js').Role, SceneImageKey>} */
const ROLE_IMAGES = {
  mafia: 'roleMafia',
  detective: 'roleDetective',
  doctor: 'roleDoctor',
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
    case 'night': {
      // Den som är ute ur spelet sover, så att ingen ser vilken roll den hade.
      const night = view.me.isAlive && view.me.role ? NIGHT_SCENES[view.me.role] : NIGHT_SCENES.citizen;
      return scene(night.image, 'Staden sover …', night.bottomCaption);
    }
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
      return view.winner === 'mafia'
        ? scene('mafiaWins', 'Och så var det över …', 'Maffian tar makten.')
        : scene('townWins', 'Och så var det över …', 'Maffian är besegrad.');
    default:
      return null;
  }
}

/**
 * @param {SceneImageKey} image
 * @param {string} topCaption
 * @param {string} bottomCaption
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
