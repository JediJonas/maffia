// @ts-check
// Gemensamma typer för spelets tillstånd. Värden äger GameState, och varje
// telefon får bara sin egen PlayerView (se playerView.js).

/**
 * @typedef {'mafia' | 'godfather' | 'detective' | 'doctor' | 'taxiDriver' | 'windowWatcher'
 *   | 'sausageVendor' | 'mayor' | 'citizen' | 'bartender' | 'madman'} Role
 */

/**
 * verdict är pausen efter dagens omröstning, då alla ser utfallet innan
 * värden låter natten falla.
 * @typedef {'lobby' | 'roleReveal' | 'night' | 'day' | 'verdict' | 'gameOver'} Phase
 */

/** @typedef {'town' | 'mafia' | 'madman'} Team */

/**
 * @typedef {object} Player
 * @property {string} id
 * @property {string} name
 * @property {Role | null} role Saknas tills spelet har startat.
 * @property {boolean} isAlive
 * @property {boolean} isConnected
 * @property {boolean} [isBot] Styrs av värdens telefon. Saknas i spel som sparades innan botarna fanns.
 * @property {import('../avatar/avatarParts.js').Avatar | null} avatar Null när telefonen inte skickade någon giltig avatar.
 * @property {import('../scenes/roleImageChoice.js').RoleImageVariant} [roleImageVariant] Spelarens val av rollbild, som telefonen skickar när spelet har börjat. Visas för alla bara i mordbilden, dombilden och när galningen vinner. Saknas tills telefonen har skickat det.
 */

/**
 * @typedef {object} Investigation
 * @property {number} round
 * @property {string} targetId
 * @property {boolean} isMafia Falskt för gudfadern, och när bartendern höll detektiven borta.
 */

/**
 * Vad taxichauffören eller fönstertittaren såg en natt.
 * @typedef {object} Sighting
 * @property {number} round
 * @property {string} targetId Den som följdes eller vars hem bevakades.
 * @property {string[]} seenIds Vem den följda besökte, eller vilka som besökte den bevakade. Tom när ingen gjorde det.
 */

/**
 * Vad som hände under den senaste natten, som alla får veta på dagen. Den
 * mördades roll visas direkt, eftersom maffian aldrig mördar sina egna.
 * @typedef {object} NightOutcome
 * @property {string | null} killedId Null när ingen dog, till exempel för att läkaren räddade offret.
 * @property {string | null} [silencedId] Den som fick korvgubbens korv och inte får prata i dag. Saknas i spel som sparades innan korvgubben fanns.
 * @property {number} [imageRoll] Ett slumptal från 0 till 1 som värden drar när någon mördas, så att alla telefoner visar samma mordbild. Saknas i spel som sparades innan mordbilden slumpades.
 */

/**
 * @typedef {object} DayOutcome
 * @property {string | null} executedId Null vid oavgjort eller när de flesta röstade att avstå.
 * @property {boolean} isRoleShown Domslutet visar först bara vem som blev förvisad, och värden vänder sedan fram rollen för spänningens skull.
 */

/**
 * @typedef {object} GameState
 * @property {Phase} phase
 * @property {number} round Natt och dag med samma nummer hör ihop. 0 innan första natten.
 * @property {Player[]} players I den ordning de anslöt.
 * @property {string[]} readyIds Spelare som har tryckt klart i rollvisningen.
 * @property {Record<string, string>} nightChoices Spelar-id till valt mål. Alla levande väljer, även de utan nattroll.
 * @property {Record<string, string>} dayVotes Spelar-id till mål eller SKIP_VOTE.
 * @property {NightOutcome | null} lastNight
 * @property {DayOutcome | null} lastDay
 * @property {Record<string, Investigation[]>} investigations Detektivens id till detektivens resultat.
 * @property {Record<string, Sighting[]>} [sightings] Taxichaufförens och fönstertittarens id till vad de såg. Saknas i spel som sparades innan de fanns.
 * @property {string | null} lastDoctorTargetId Läkaren får inte skydda samma spelare två nätter i rad.
 * @property {Team | null} winner
 * @property {import('./settings.js').GameSettings} settings
 */

/**
 * Handlingar som en telefon kan skicka till värden.
 * @typedef {{ type: 'ready' }
 *   | { type: 'nightChoice', targetId: string }
 *   | { type: 'vote', targetId: string }
 *   | { type: 'setAvatar', avatar: import('../avatar/avatarParts.js').Avatar }
 *   | { type: 'setRoleImage', variant: import('../scenes/roleImageChoice.js').RoleImageVariant }} PlayerAction
 */

export {};
