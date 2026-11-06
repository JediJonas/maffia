// @ts-check
import { useState } from 'react';
import { PlayerAvatar } from './PlayerAvatar.jsx';

const FILE_AVATAR_PX = 52;

/**
 * Detektivens akt på morgonen. Den är svart och stämplad hemlig tills
 * detektiven trycker, så att grannen inte hinner läsa med. Öppen visar den
 * varje undersökning med en stämpel, den senaste först. Ett tryck var som
 * helst på akten öppnar eller stänger den.
 * @param {{ view: import('../game/playerView.js').PlayerView }} props
 */
export function DetectiveFile({ view }) {
  const [isOpen, setIsOpen] = useState(false);
  const newestFirst = [...view.investigations].reverse();
  return (
    <div className="detective-file">
      <StampFilter />
      {isOpen ? (
        // Hela akten är en knapp, så att den stängs med ett tryck var som helst, som den öppnas.
        <button type="button" className="file-open" aria-expanded="true" onClick={() => setIsOpen(false)}>
          {newestFirst.map((result, index) => {
            const target = view.players.find((p) => p.id === result.targetId);
            if (!target) return null;
            return (
              <span className="file-row" key={result.round}>
                <PlayerAvatar player={target} sizePx={FILE_AVATAR_PX} />
                <span className="file-who">
                  <span className="file-name">{target.name}</span>
                  <span className="file-when">
                    Undersökt natt {result.round}
                    {index === 0 && <> · <span className="file-hide">Dölj</span></>}
                  </span>
                </span>
                <span className="stamp file-verdict" role="img" aria-label={result.isMafia ? 'Stämpel: maffia' : 'Stämpel: inte maffia'}>
                  {result.isMafia ? 'Maffia' : <>Inte<br />maffia</>}
                </span>
              </span>
            );
          })}
        </button>
      ) : (
        <button type="button" className="file-closed" aria-expanded="false" onClick={() => setIsOpen(true)}>
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
