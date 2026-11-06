// @ts-check

/**
 * Rubriken i toppraden, som i ett seriealbum: kort och med versaler.
 * @param {Pick<import('../game/playerView.js').PlayerView, 'phase' | 'round' | 'winner'>} view
 * @returns {string}
 */
export function describePhaseTitle(view) {
  switch (view.phase) {
    case 'lobby':
      return 'Lobby';
    case 'roleReveal':
      return 'Din roll';
    case 'night':
      return `Natt ${view.round}`;
    case 'day':
      return `Dag ${view.round}`;
    case 'verdict':
      return 'Domslut';
    case 'gameOver':
      return view.winner === 'mafia' ? 'Maffian vann' : 'Staden vann';
    default:
      return 'Maffia';
  }
}
