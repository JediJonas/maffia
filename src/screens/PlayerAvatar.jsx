// @ts-check
import { useEffect, useState } from 'react';

export const SMALL_AVATAR_PX = 48;
export const LARGE_AVATAR_PX = 128;

// DiceBear med ritningarna är ungefär en tredjedel av appen, så den laddas
// för sig. Då kommer startsidan upp lika fort som förut, och avatarerna
// fylls i strax efter.
/** @type {typeof import('../avatar/renderAvatar.js') | null} */
let loadedRenderer = null;
const rendererLoad = import('../avatar/renderAvatar.js').then((renderer) => {
  loadedRenderer = renderer;
  return renderer;
});

function useAvatarRenderer() {
  const [renderer, setRenderer] = useState(loadedRenderer);
  useEffect(() => {
    if (!renderer) rendererLoad.then(setRenderer, () => {});
  }, [renderer]);
  return renderer;
}

/**
 * Avataren står alltid bredvid namnet, så bilden behöver ingen egen text för skärmläsare.
 * @param {object} props
 * @param {{ id: string, avatar: import('../avatar/avatarParts.js').Avatar | null }} props.player
 * @param {number} [props.sizePx]
 * @param {boolean} [props.isDead] Ett tuschkryss över figuren, som ett foto på en spaningstavla,
 *   så att det syns på håll vem som är ute (Jonas 2026-11-08).
 */
export function PlayerAvatar({ player, sizePx = SMALL_AVATAR_PX, isDead = false }) {
  const renderer = useAvatarRenderer();
  const image = renderer ? (
    <img
      className="avatar"
      src={renderer.buildAvatarImage(player.avatar, player.id)}
      alt=""
      width={sizePx}
      height={sizePx}
    />
  ) : (
    <span className="avatar" style={{ width: sizePx, height: sizePx }} />
  );
  if (!isDead) return image;
  return (
    <span className="avatar-crossed">
      {image}
      <svg className="avatar-cross" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M9 11 L90 90" />
        <path d="M90 9 L11 90" />
      </svg>
    </span>
  );
}
