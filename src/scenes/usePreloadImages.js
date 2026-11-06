// @ts-check
import { useEffect } from 'react';
import { SCENE_IMAGES } from './sceneImages.js';

/**
 * Hämtar bilderna i förväg, så att de ligger i webbläsarens cache när fasen
 * byts. Annars är bildrutan tom en stund medan bilden laddas.
 * @param {import('./sceneImages.js').SceneImageKey[]} keys
 */
export function usePreloadImages(keys) {
  const joinedKeys = keys.join(',');
  useEffect(() => {
    if (!joinedKeys) return;
    for (const key of joinedKeys.split(',')) {
      const image = new Image();
      image.src = SCENE_IMAGES[/** @type {import('./sceneImages.js').SceneImageKey} */ (key)].src;
    }
  }, [joinedKeys]);
}
