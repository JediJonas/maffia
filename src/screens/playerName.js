// @ts-check
// Hur en spelare heter i listorna. Botar står med "(bot)" efter namnet, så
// att alla vet vilka som inte kan vara med och diskutera (Jonas 2026-11-06).
// Rubriker och berättaren säger bara namnet.

/**
 * @param {{ name: string, isBot: boolean }} player
 * @returns {string}
 */
export function writeListName(player) {
  return player.isBot ? `${player.name} (bot)` : player.name;
}

/**
 * Listorna står i bokstavsordning, så att man hittar den man letar efter
 * (ägaren 2026-11-06). Svensk ordning, så att Å, Ä och Ö hamnar sist.
 * @template {{ name: string }} T
 * @param {T[]} players
 * @returns {T[]} En ny lista.
 */
export function sortByName(players) {
  return [...players].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
}
