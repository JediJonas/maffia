// @ts-check
// Hur en spelare heter i listorna. Botar står med "(bot)" efter namnet, så
// att alla vet vilka som inte kan vara med och diskutera (Jonas 2026-11-06).
// Rubriker, berättaren och rösten säger bara namnet.

/**
 * @param {{ name: string, isBot: boolean }} player
 * @returns {string}
 */
export function writeListName(player) {
  return player.isBot ? `${player.name} (bot)` : player.name;
}
