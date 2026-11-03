// @ts-check
// Gemensamma typer för spelets tillstånd. Värden äger GameState, och varje
// telefon får bara sin egen PlayerView (se playerView.js).

/** @typedef {'mafia' | 'detective' | 'doctor' | 'citizen'} Role */

/**
 * verdict är pausen efter dagens omröstning, då alla ser utfallet innan
 * värden låter natten falla.
 * @typedef {'lobby' | 'roleReveal' | 'night' | 'day' | 'verdict' | 'gameOver'} Phase
 */

/** @typedef {'town' | 'mafia'} Team */

/**
 * @typedef {object} Player
 * @property {string} id
 * @property {string} name
 * @property {Role | null} role Saknas tills spelet har startat.
 * @property {boolean} isAlive
 * @property {boolean} isConnected
 */

/**
 * @typedef {object} Investigation
 * @property {number} round
 * @property {string} targetId
 * @property {boolean} isMafia
 */

/**
 * Vad som hände under den senaste natten, som alla får veta på dagen.
 * @typedef {object} NightOutcome
 * @property {string | null} killedId Null när ingen dog, till exempel för att läkaren räddade offret.
 */

/**
 * @typedef {object} DayOutcome
 * @property {string | null} executedId Null vid oavgjort eller när de flesta röstade att avstå.
 * @property {boolean} isRoleShown Domslutet visar först bara vem som åkte ut, och värden vänder sedan fram rollen för spänningens skull.
 */

/**
 * @typedef {object} GameState
 * @property {Phase} phase
 * @property {number} round Natt och dag med samma nummer hör ihop. 0 innan första natten.
 * @property {Player[]} players I den ordning de anslöt.
 * @property {string[]} readyIds Spelare som har tryckt klart i rollvisningen.
 * @property {Record<string, string>} nightChoices Spelar-id till valt mål. Alla levande väljer, även de utan nattroll.
 * @property {string[]} nightDoneIds Spelare som har bekräftat sitt nattval.
 * @property {Record<string, string>} dayVotes Spelar-id till mål eller SKIP_VOTE.
 * @property {NightOutcome | null} lastNight
 * @property {DayOutcome | null} lastDay
 * @property {Record<string, Investigation[]>} investigations Detektivens id till detektivens resultat.
 * @property {string | null} lastDoctorTargetId Läkaren får inte skydda samma spelare två nätter i rad.
 * @property {Team | null} winner
 * @property {import('./settings.js').GameSettings} settings
 */

/**
 * Handlingar som en telefon kan skicka till värden.
 * @typedef {{ type: 'ready' }
 *   | { type: 'nightChoice', targetId: string }
 *   | { type: 'nightDone' }
 *   | { type: 'vote', targetId: string }} PlayerAction
 */

export {};
