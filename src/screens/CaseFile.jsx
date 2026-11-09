// @ts-check
import { Fragment, useState } from 'react';
import { PlayerAvatar } from './PlayerAvatar.jsx';
import { StampFilter } from './StampFilter.jsx';
import { styleStampTilt } from './stampTilt.js';

const FILE_AVATAR_PX = 52;

/**
 * Akten på morgonen för detektiven, taxichauffören och fönstertittaren. Den
 * är svart och stämplad hemlig tills spelaren trycker, så att grannen inte
 * hinner läsa med. Öppen visar den varje natt med sitt svar, den senaste
 * först. Ett tryck var som helst på akten öppnar eller stänger den.
 * @param {object} props
 * @param {import('./caseFile.js').CaseFileContent} props.content
 * @param {import('../game/playerView.js').PublicPlayer[]} props.players
 */
export function CaseFile({ content, players }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="detective-file">
      <StampFilter />
      {isOpen ? (
        // Hela akten är en knapp, så att den stängs med ett tryck var som helst, som den öppnas.
        <button type="button" className="file-open" aria-expanded="true" onClick={() => setIsOpen(false)}>
          {content.rows.map((row, index) => {
            const target = players.find((p) => p.id === row.targetId);
            if (!target) return null;
            return (
              <span className="file-row" key={row.round}>
                <PlayerAvatar player={target} sizePx={FILE_AVATAR_PX} isDead={!target.isAlive} />
                <span className="file-who">
                  <span className="file-name">{target.name}</span>
                  <span className="file-when">
                    {row.when}
                    {index === 0 && <> · <span className="file-hide">Dölj</span></>}
                  </span>
                </span>
                <Verdict verdict={row.verdict} index={index} />
              </span>
            );
          })}
        </button>
      ) : (
        <button type="button" className="file-closed" aria-expanded="false" onClick={() => setIsOpen(true)}>
          <span>{content.closedText}</span>
          <span className="stamp file-secret" aria-hidden="true">Hemligt</span>
        </button>
      )}
    </div>
  );
}

/**
 * Svaret till höger i raden: en stämpel, eller maskinskrivet för vem som besökte vem.
 * @param {object} props
 * @param {import('./caseFile.js').CaseVerdict} props.verdict
 * @param {number} props.index Radens plats, så att stämplarna lutar åt olika håll.
 */
function Verdict({ verdict, index }) {
  const lines = verdict.lines.map((line, lineIndex) => <Fragment key={line}>{lineIndex > 0 && <br />}{line}</Fragment>);
  if (verdict.look === 'typed') {
    return <span className="file-typed" aria-label={verdict.label}>{lines}</span>;
  }
  const isMafia = verdict.look === 'mafia';
  return (
    <span
      className={isMafia ? 'stamp file-verdict file-verdict-mafia' : 'stamp file-verdict'}
      style={isMafia ? undefined : styleStampTilt(index)}
      role="img"
      aria-label={`Stämpel: ${verdict.label}`}
    >
      {lines}
    </span>
  );
}
