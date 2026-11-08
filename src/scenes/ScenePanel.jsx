// @ts-check
import { SCENE_IMAGES } from './sceneImages.js';

/**
 * Bildrutan överst, med berättarens serierutor i hörnen.
 * @param {object} props
 * @param {import('./describeScene.js').Scene} props.scene
 * @param {string | null} props.roomCode Visas när scenen har rumskoden.
 * @param {import('react').ReactNode} [props.children] Står i rutan när scenen saknar bild, som värdens QR-kod.
 */
export function ScenePanel({ scene, roomCode, children }) {
  const image = scene.image ? SCENE_IMAGES[scene.image] : null;
  return (
    <figure className={image ? 'scene' : 'scene scene-plain'}>
      {image ? (
        <img src={image.src} alt={image.alt} decoding="sync" style={{ objectPosition: image.position }} />
      ) : (
        children
      )}
      <figcaption>
        <span className="scene-caption scene-caption-top">{scene.topCaption}</span>
        {scene.bottomCaption && <span className="scene-caption scene-caption-bottom">{scene.bottomCaption}</span>}
        {scene.showsRoomCode && roomCode && (
          <span className="scene-caption scene-caption-bottom">
            Koden är <span className="room-code-text" aria-label={[...roomCode].join(' ')}>{roomCode}</span>.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
