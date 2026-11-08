// @ts-check
import { useEffect, useMemo } from 'react';
import { loadRoleImageChoice, loadRoleImageRoll, saveRoleImageRoll } from '../device/savedSession.js';
import { resolveRoleImageVariant, rollRoleImageVariant } from './roleImageChoice.js';

/**
 * Vilken av rollbilderna den här telefonen visar. Med Slumpa dras en ny
 * varje gång spelet står i lobbyn eller är slut, så att nästa spel får sin egen.
 * @param {import('../game/playerView.js').PlayerView | null} view
 * @param {string} roomCode
 * @returns {import('./roleImageChoice.js').RoleImageVariant}
 */
export function useRoleImageVariant(view, roomCode) {
  const phase = view?.phase ?? null;
  const gameKey = `${roomCode}:${view?.me.id ?? ''}`;
  const isBetweenGames = phase === 'lobby' || phase === 'gameOver';

  useEffect(() => {
    if (isBetweenGames) saveRoleImageRoll({ gameKey, variant: rollRoleImageVariant(Math.random) });
  }, [isBetweenGames, gameKey]);

  // Läses om när fasen byts, så att ett val i Ändra figur gäller från nästa spel.
  return useMemo(
    () => resolveRoleImageVariant({ choice: loadRoleImageChoice(), savedRoll: loadRoleImageRoll(), gameKey }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phase styr när valet läses om.
    [phase, gameKey],
  );
}
