import { describe, expect, it } from 'vitest';
import { describeTeamRules, listRoleRules, listRoundRules } from './rulesText.js';
import { DEFAULT_SETTINGS } from '../game/settings.js';

describe('listRoleRules', () => {
  it('tar bara upp de roller som finns i spelet', () => {
    const settings = { ...DEFAULT_SETTINGS, hasDoctor: false };
    expect(listRoleRules(settings, 6).map((row) => row.title)).toEqual(['Maffia', 'Detektiv', 'Stadsbo']);
  });

  it('nämner varje roll en gång även när flera har den', () => {
    const settings = { ...DEFAULT_SETTINGS, mafiaCount: 2 };
    expect(listRoleRules(settings, 8).map((row) => row.title)).toEqual(['Maffia', 'Detektiv', 'Läkare', 'Stadsbo']);
  });

  it('visar rollerna som de blir innan alla har kommit', () => {
    expect(listRoleRules(DEFAULT_SETTINGS, 1).map((row) => row.title)).toEqual(['Maffia', 'Detektiv', 'Läkare', 'Stadsbo']);
  });
});

describe('listRoundRules', () => {
  it('säger att rollen visas när det är påslaget', () => {
    const [, day, verdict] = listRoundRules({ ...DEFAULT_SETTINGS, revealsRoleOnDeath: true });
    expect(day.text).toContain('och vilken roll den hade');
    expect(verdict.text).toContain('Rollen visas efter en kort stund.');
  });

  it('säger att rollerna visas först i slutet när det är avslaget', () => {
    const [, day, verdict] = listRoundRules({ ...DEFAULT_SETTINGS, revealsRoleOnDeath: false });
    expect(day.text).not.toContain('roll');
    expect(verdict.text).toContain('Rollerna visas först när ett lag har vunnit.');
  });
});

describe('describeTeamRules', () => {
  it('har två lag utan galningen', () => {
    const teams = describeTeamRules(DEFAULT_SETTINGS);
    expect(teams.lead).toBe('Staden har två lag.');
    expect(teams.rows.map((row) => row.title)).toEqual(['Staden', 'Maffian']);
  });

  it('tar med galningen när han är med', () => {
    const teams = describeTeamRules({ ...DEFAULT_SETTINGS, hasMadman: true });
    expect(teams.lead).toBe('Staden har två lag, och en galning.');
    expect(teams.rows.map((row) => row.title)).toEqual(['Staden', 'Maffian', 'Galningen']);
  });
});

describe('listRoleRules med specialroller', () => {
  it('visar gudfadern i stället för maffia när han tar den enda platsen', () => {
    const settings = { ...DEFAULT_SETTINGS, hasGodfather: true, hasMayor: true };
    expect(listRoleRules(settings, 6).map((row) => row.title)).toEqual(['Gudfadern', 'Detektiv', 'Läkare', 'Borgmästare', 'Stadsbo']);
  });
});
