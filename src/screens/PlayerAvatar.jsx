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
 * @param {boolean} [props.isDead] Visas blekt, så att det syns på håll vem som är ute.
 */
export function PlayerAvatar({ player, sizePx = SMALL_AVATAR_PX, isDead = false }) {
  const renderer = useAvatarRenderer();
  const className = isDead ? 'avatar avatar-dead' : 'avatar';
  if (!renderer) return <span className={className} style={{ width: sizePx, height: sizePx }} />;
  return (
    <img
      className={className}
      src={renderer.buildAvatarImage(player.avatar, player.id)}
      alt=""
      width={sizePx}
      height={sizePx}
    />
  );
}
