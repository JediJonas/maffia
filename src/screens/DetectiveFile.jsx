// @ts-check
import { useState } from 'react';
import { PlayerAvatar } from './PlayerAvatar.jsx';

const FILE_AVATAR_PX = 52;

/**
 * Detektivens akt på morgonen. Den är svart och stämplad hemlig tills
 * detektiven trycker, så att grannen inte hinner läsa med. Öppen visar den
 * varje undersökning med en stämpel, den senaste först.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
export function DetectiveFile({ view }) {
  const [isOpen, setIsOpen] = useState(false);
  const newestFirst = [...view.investigations].reverse();
  return (
    <div className="detective-file">
      <StampFilter />
      {isOpen ? (
        <ul className="file-open">
          {newestFirst.map((result, index) => {
            const target = view.players.find((p) => p.id === result.targetId);
            if (!target) return null;
            return (
              <li key={result.round}>
                <PlayerAvatar player={target} sizePx={FILE_AVATAR_PX} />
                <span className="file-who">
                  <span className="file-name">{target.name}</span>
                  <span className="file-when">
                    Undersökt natt {result.round}
                    {index === 0 && (
                      <>
                        {' · '}
                        <button type="button" className="link-button" onClick={() => setIsOpen(false)}>Dölj</button>
                      </>
                    )}
                  </span>
                </span>
                <span className="stamp file-verdict" role="img" aria-label={result.isMafia ? 'Stämpel: maffia' : 'Stämpel: inte maffia'}>
                  {result.isMafia ? 'Maffia' : <>Inte<br />maffia</>}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <button type="button" className="file-closed" onClick={() => setIsOpen(true)}>
          <span>Din undersökning ligger i akten. Tryck för att läsa.</span>
          <span className="stamp file-secret" aria-hidden="true">Hemligt</span>
        </button>
      )}
    </div>
  );
}

/** Ojämn färg i stämplarna, som när en stämpel inte tar överallt. */
function StampFilter() {
  return (
    <svg width="0" height="0" className="stamp-filter" aria-hidden="true">
      <filter id="stamp-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 7" />
        <feComposite in="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}
