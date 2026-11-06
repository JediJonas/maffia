import { describe, expect, it } from 'vitest';
import { buildCaseFile } from './caseFile.js';

const players = [{ id: 'p1', name: 'Anna' }, { id: 'p2', name: 'Bertil' }, { id: 'p3', name: 'Fia' }];
/** @param {object} changes */
const viewOf = (changes) => /** @type {any} */ ({ me: { role: 'citizen' }, players, investigations: [], sightings: [], ...changes });

describe('buildCaseFile', () => {
  it('har ingen akt för den som inte tar reda på något', () => {
    expect(buildCaseFile(viewOf({}))).toBeNull();
    expect(buildCaseFile(viewOf({ me: { role: 'detective' } }))).toBeNull();
  });

  it('lägger detektivens senaste undersökning först och stämplar maffia tydligt', () => {
    const content = buildCaseFile(viewOf({
      me: { role: 'detective' },
      investigations: [{ round: 1, targetId: 'p1', isMafia: false }, { round: 2, targetId: 'p2', isMafia: true }],
    }));
    expect(content?.rows.map((row) => row.when)).toEqual(['Undersökt natt 2', 'Undersökt natt 1']);
    expect(content?.rows[0].verdict).toMatchObject({ lines: ['Maffia'], isMafia: true });
  });

  it('säger vem den följda besökte och vilka som kom till den bevakade', () => {
    const taxi = buildCaseFile(viewOf({ me: { role: 'taxiDriver' }, sightings: [{ round: 1, targetId: 'p1', seenIds: ['p3'] }] }));
    expect(taxi?.rows[0].verdict.lines).toEqual(['Besökte:', 'Fia']);
    const watcher = buildCaseFile(viewOf({ me: { role: 'windowWatcher' }, sightings: [{ round: 1, targetId: 'p1', seenIds: ['p2', 'p3'] }] }));
    expect(watcher?.rows[0].verdict.lines).toEqual(['Besökt av:', 'Bertil och Fia']);
    const empty = buildCaseFile(viewOf({ me: { role: 'windowWatcher' }, sightings: [{ round: 1, targetId: 'p1', seenIds: [] }] }));
    expect(empty?.rows[0].verdict.lines).toEqual(['Besökt av:', 'ingen']);
  });
});
