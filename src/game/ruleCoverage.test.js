// Varje regel i docs/regler.md ska ha minst ett test. Testet läser dokumentet,
// delar upp det i regler (tabellrader, punkter och stycken) och kontrollerar
// att varje regel finns i listan nedan och att testerna som listan pekar på
// finns. Ändras en regel, eller kommer en ny, fallerar testet tills den har
// fått ett test här. Agenten testare (.claude/agents/testare.md) håller listan
// komplett.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const RULES_FILE = new URL('../../docs/regler.md', import.meta.url);
const SRC = new URL('../', import.meta.url);
// Avsnitt som inte är regler för spelet, utan ord och historia.
const SKIPPED_SECTIONS = ['Ord vi använder'];

/**
 * Regeln (början av texten, utan markdown) och testerna som visar den, som
 * "fil: testets namn" med filen räknad från src/.
 * @type {[string, string[]][]}
 */
const COVERAGE = [
  // Lagen
  ['Maffian vet vilka som är med i maffian', [
    'game/playerView.test.js: visar maffian vem mer som är maffia och vad de har valt',
    'game/rules.test.js: ger maffian vinsten när de är lika många som resten',
  ]],
  ['Staden är alla andra', ['game/rules.test.js: ger staden vinsten när sista maffian blir förvisad']],
  ['Galningen spelar för sig själv', ['game/specialRoles.test.js: låter galningen vinna ensam när staden förvisar honom']],
  // Rollerna
  ['Maffia Maffian Väljer tillsammans', ['game/rules.test.js: fortsätter natten tills maffian har valt samma person']],
  ['Detektiv Staden Undersöker', ['game/rules.test.js: ger detektiven svar på om målet är maffia']],
  ['Läkare Staden Skyddar', ['game/rules.test.js: låter läkaren rädda offret']],
  ['Stadsbo Staden Ingen nattroll', ['game/ruleScenarios.test.js: låter stadsbons, borgmästarens och galningens nattval inte göra något']],
  ['Gudfadern Maffian Leder', ['game/specialRoles.test.js: låter gudfadern se ut som oskyldig för detektiven']],
  ['Taxichaufför Staden Följer', ['game/specialRoles.test.js: visar taxichauffören vem den följda besökte och fönstertittaren vilka som kom']],
  ['Fönstertittare Staden Bevakar', ['game/specialRoles.test.js: visar taxichauffören vem den följda besökte och fönstertittaren vilka som kom']],
  ['Bartender Maffian Bjuder', [
    'game/specialRoles.test.js: låter bartendern stoppa läkarens skydd utan att någon märker det',
    'game/specialRoles.test.js: låter gudfadern mörda bartendern, som maffian inte känner',
  ]],
  ['Korvgubbe Staden Bjuder', [
    'game/specialRoles.test.js: låter korvgubben tysta någon, men inte den som blev mördad',
    'game/ruleScenarios.test.js: låter den som fick korvgubbens korv rösta',
  ]],
  ['Borgmästare Staden Ingen nattroll', ['game/specialRoles.test.js: räknar borgmästarens röst två gånger']],
  ['Galningen Sig själv Ingen nattroll', ['game/specialRoles.test.js: låter galningen vinna ensam när staden förvisar honom']],
  ['Antal maffia är en per fyra spelare', [
    'game/rules.test.js: ger ungefär en fjärdedel maffia',
    'game/settings.test.js: tar bort detektiv och läkare när de är avslagna',
    'game/ruleScenarios.test.js: har de nya rollerna avslagna och detektiv och läkare påslagna',
    'game/settings.test.js: låter gudfadern ta en av maffians platser och lägger till de valda rollerna',
    'game/rules.test.js: kräver minst fyra spelare för att starta',
    'game/settings.test.js: nekar fler roller än spelare',
  ]],
  // Besök på natten
  ['Räknas som besök', ['game/ruleScenarios.test.js: räknar alla i maffian som valde offret, läkaren, detektiven, bartendern och korvgubben som besök']],
  ['Räknas inte som besök', ['game/specialRoles.test.js: räknar inte taxichauffören, fönstertittaren eller blinda val som besök']],
  ['Om fönstertittaren bevakar Anna', [
    'game/specialRoles.test.js: räknar inte taxichauffören, fönstertittaren eller blinda val som besök',
    'screens/caseFile.test.js: har ingen akt för den som är ute ur spelet',
  ]],
  // Bartendern
  ['Maffian eller gudfadern: ingen blir mördad', ['game/specialRoles.test.js: stoppar mordet när bartendern bjuder någon i maffian']],
  ['Läkaren: skyddet misslyckas', ['game/specialRoles.test.js: låter bartendern stoppa läkarens skydd utan att någon märker det']],
  ['Detektiven: får svaret "inte maffia"', ['game/ruleScenarios.test.js: får detektiven att se "inte maffia" även när målet är maffia']],
  ['Taxichauffören och fönstertittaren: svaret blir "ingen"', ['game/specialRoles.test.js: ger den som bartendern bjöd ett tomt svar']],
  ['Korvgubben: ingen får korv', ['game/ruleScenarios.test.js: stoppar korvgubben, så att alla får prata nästa dag']],
  ['Borgmästaren, galningen och stadsbor: ingen skillnad', ['game/ruleScenarios.test.js: gör ingen skillnad för en stadsbo']],
  ['Den som fick drinken går ändå hem', ['game/specialRoles.test.js: stoppar mordet när bartendern bjuder någon i maffian']],
  ['Bartendern räknas inte som maffia', [
    'game/specialRoles.test.js: låter bartendern stoppa läkarens skydd utan att någon märker det',
    'game/specialRoles.test.js: räknar varken bartendern som maffia eller galningen som vinnare när de lever',
    'game/specialRoles.test.js: låter gudfadern mörda bartendern, som maffian inte känner',
  ]],
  // Gången i spelet
  ['Roller delas ut i hemlighet', [
    'game/rules.test.js: delar ut en roll till var och en och går till rollvisningen',
    'game/playerView.test.js: avslöjar inte levande spelares roller för en stadsbo',
    'game/playerView.test.js: visar inte andras nattval för detektiven',
  ]],
  ['Natt. Alla tittar i telefonen', [
    'game/rules.test.js: väntar tills alla levande har valt',
    'game/rules.test.js: fortsätter natten tills maffian har valt samma person',
    'game/rules.test.js: låter den som har valt ändra sig medan någon annan väljer',
    'game/ruleScenarios.test.js: låter stadsbons, borgmästarens och galningens nattval inte göra något',
  ]],
  ['Dag. Berättaren säger', [
    'game/narration.test.js: berättar vem som blev mördad och rollen direkt',
    'game/rules.test.js: röstar ut den som får flest röster och visar domslutet',
    'game/deathReveal.test.js: döljer rollen tills värden vänder fram den',
    'game/rules.test.js: röstar inte ut någon vid lika',
    'game/rules.test.js: röstar inte ut någon när lika många avstår',
  ]],
  ['Natt och dag växlar', [
    'game/rules.test.js: går till nästa natt när värden avslutar domslutet',
    'game/bots.test.js: spelar ett helt parti till slutet',
  ]],
  ['Den som är ute ur spelet får inte prata eller rösta', [
    'game/ruleScenarios.test.js: låter inte den som är ute ur spelet rösta',
    'game/ruleScenarios.test.js: låter den som fick korvgubbens korv rösta',
  ]],
  // Val som prototypen har gjort
  ['Döda spelares roller visas för alla', [
    'game/playerView.test.js: visar döda spelares roller för alla',
    'game/settings.test.js: döljer döda spelares roller när inställningen är av',
  ]],
  ['Läkaren får skydda sig själv', [
    'game/ruleScenarios.test.js: låter läkaren skydda sig själv',
    'game/rules.test.js: låter inte läkaren skydda samma spelare två nätter i rad',
  ]],
  ['Maffian kan inte välja en annan maffia', [
    'game/rules.test.js: låter inte maffian välja en annan maffia',
    'game/ruleScenarios.test.js: låter inte maffian välja gudfadern, som räknas som maffia',
    'game/specialRoles.test.js: låter gudfadern mörda bartendern, som maffian inte känner',
  ]],
  ['Den som väljer offer bland maffian går hem', [
    'game/specialRoles.test.js: visar taxichauffören vem den följda besökte och fönstertittaren vilka som kom',
    'game/ruleScenarios.test.js: räknar alla i maffian som valde offret, läkaren, detektiven, bartendern och korvgubben som besök',
  ]],
  ['Korven går inte till den som blev mördad', ['game/specialRoles.test.js: låter korvgubben tysta någon, men inte den som blev mördad']],
  ['Borgmästarens dubbla röst syns', ['game/specialRoles.test.js: räknar borgmästarens röst två gånger']],
  ['Förvisas galningen slutar spelet direkt', [
    'game/ruleScenarios.test.js: låter galningen vinna även när maffian också hade vunnit',
    'screens/deathText.test.js: låter gudfadern hota som maffian och galningen skratta',
  ]],
  ['På natten finns ingen bekräfta-knapp', ['game/rules.test.js: låter den som har valt ändra sig medan någon annan väljer']],
  ['På morgonen visas den mördades roll direkt', ['game/deathReveal.test.js: visas med roll direkt, utan nedräkning']],
  ['Avgör nattens mord spelet visas morgonen ändå', [
    'game/deathReveal.test.js: visar morgonen innan spelet tar slut',
    'game/deathReveal.test.js: räknar inte rösterna medan morgonen väntar på slutet',
  ]],
  ['Omröstningen avgörs när alla levande har röstat', ['game/ruleScenarios.test.js: låter spelarna ändra sin röst tills alla har röstat']],
  ['Efter omröstningen visas ett domslut', [
    'game/deathReveal.test.js: döljer rollen tills värden vänder fram den',
    'game/deathReveal.test.js: går vidare först när rollen har visats',
  ]],
  ['Spelet väntar på frånkopplade spelare', ['game/ruleScenarios.test.js: väntar på en spelare som har tappat förbindelsen']],
  ['Botar (datorstyrda spelare)', [
    'game/bots.test.js: tillåter högst tre botar',
    'game/bots.test.js: följer gudfadern som maffia och spelar de nya rollerna',
    'game/bots.test.js: väntar med att rösta tills alla människor har röstat och följer sedan flest röster',
    'game/bots.test.js: röstar aldrig på sin egen maffia',
    'game/bots.test.js: röstar som detektiv på maffia den har hittat',
  ]],
];

/**
 * Delar dokumentet i regler: tabellrader, punkter med sina fortsättningsrader
 * och vanliga stycken. Stycken som slutar med kolon inleder bara en lista.
 * @param {string} text
 * @returns {string[]}
 */
function listRules(text) {
  /** @type {string[]} */
  const rules = [];
  let section = '';
  /** @type {string | null} */
  let current = null;
  const flush = () => {
    if (current && !current.trimEnd().endsWith(':')) rules.push(current);
    current = null;
  };
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) section = line.slice(3).trim();
    const isOutside = !section || SKIPPED_SECTIONS.includes(section);
    if (line.startsWith('#') || !line.trim() || isOutside) {
      flush();
      continue;
    }
    if (/^\| ?(-|Roll \|)/.test(line)) continue;
    if (line.startsWith('|') || /^(- |\d+\. )/.test(line)) {
      flush();
      current = line;
    } else {
      current = current ? `${current} ${line.trim()}` : line;
    }
    if (line.startsWith('|')) flush();
  }
  flush();
  return rules.map((rule) => rule.replace(/^(- |\d+\. )/, '').replace(/[*`|]/g, ' ').replace(/\s+/g, ' ').trim());
}

/** @param {string} reference */
function testExists(reference) {
  const [file, name] = reference.split(': ');
  const source = readFileSync(new URL(file, SRC), 'utf8');
  return source.includes(`it('${name}'`) || source.includes(`it(\`${name}`) || source.includes(`it("${name}"`);
}

describe('reglerna i docs/regler.md', () => {
  const rules = listRules(readFileSync(RULES_FILE, 'utf8'));

  it('hittar reglerna i dokumentet', () => {
    expect(rules.length).toBeGreaterThan(30);
  });

  it('har minst ett test för varje regel', () => {
    const untested = rules.filter((rule) => !COVERAGE.some(([start]) => rule.startsWith(start)));
    expect(untested, 'Regler utan test. Skriv ett test och lägg till regeln i COVERAGE.').toEqual([]);
  });

  it('pekar bara på regler som finns kvar', () => {
    const removed = COVERAGE.filter(([start]) => !rules.some((rule) => rule.startsWith(start))).map(([start]) => start);
    expect(removed).toEqual([]);
  });

  it('pekar bara på tester som finns', () => {
    const missing = COVERAGE.flatMap(([, tests]) => tests).filter((reference) => !testExists(reference));
    expect(missing).toEqual([]);
  });
});
