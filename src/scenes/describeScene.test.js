import { describe, expect, it } from 'vitest';
import { MURDER_IMAGES, chooseMurderImage, chooseRoleImage, describeScene, listUpcomingImages } from './describeScene.js';
import { buildPlayerView } from '../game/playerView.js';
import { applyAction } from '../game/rules.js';
import { createTestGame, playDay, playNight } from '../game/testGame.js';

const ROLES = ['citizen', 'mafia', 'citizen', 'detective', 'doctor'];

describe('describeScene', () => {
  const night = createTestGame(ROLES);

  it('visar akten tills spelaren öppnar den, och sedan rollens bild', () => {
    const roleReveal = { ...night, phase: /** @type {const} */ ('roleReveal') };
    expect(describeScene(buildPlayerView(roleReveal, 'p2'), false)).toMatchObject({ image: 'roleHidden', bottomCaption: 'Din roll ligger i akten.' });
    expect(describeScene(buildPlayerView(roleReveal, 'p2'), false, true, 'man')).toMatchObject({ image: 'roleMafiaMan', bottomCaption: 'Du är maffia.' });
    expect(describeScene(buildPlayerView(roleReveal, 'p1'), false, true, 'woman')).toMatchObject({ image: 'roleCitizenWoman', bottomCaption: 'Du är stadsbo.' });
  });

  it('har en kvinna och en man för varje roll', () => {
    expect(chooseRoleImage('madman', 'woman')).toBe('roleMadmanWoman');
    expect(chooseRoleImage('madman', 'man')).toBe('roleMadmanMan');
  });

  it('visar varje roll sin egen nattbild', () => {
    expect(describeScene(buildPlayerView(night, 'p2'), false)).toMatchObject({ bottomCaption: '… men inte maffian.' });
    expect(describeScene(buildPlayerView(night, 'p4'), false)).toMatchObject({ image: 'nightDetectiveWoman', bottomCaption: '… men inte du.' });
    expect(describeScene(buildPlayerView(night, 'p5'), false)).toMatchObject({ image: 'nightDoctorWoman' });
    expect(describeScene(buildPlayerView(night, 'p1'), false)).toMatchObject({ image: 'nightCitizenWoman', bottomCaption: '… och så även du.' });
  });

  it('visar nattbilden med en kvinna eller en man, som rollbilden', () => {
    expect(describeScene(buildPlayerView(night, 'p1'), false, false, 'man')).toMatchObject({ image: 'nightCitizenMan' });
  });

  it('visar den som är ute ur spelet som en sovande stadsbo på natten', () => {
    const morning = playNight(night, { p2: 'p4', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const nextNight = playDay(morning, { p1: 'p3', p2: 'p3', p3: 'p1', p5: 'p3' });
    const detectiveIsOut = { ...nextNight, phase: 'night' };
    expect(describeScene(buildPlayerView(detectiveIsOut, 'p4'), false)).toMatchObject({ image: 'nightCitizenWoman', bottomCaption: null });
  });

  it('berättar på morgonen vem som blev mördad, med namn även för offret', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false)).toMatchObject({ bottomCaption: 'Spelare 3 blev mördad.' });
    expect(describeScene(buildPlayerView(morning, 'p3'), false)).toMatchObject({ bottomCaption: 'Spelare 3 blev mördad.' });
  });

  it('visar mordbilden efter den mördades val av rollbild, samma på alla telefoner', () => {
    const chosen = applyAction(night, 'p3', { type: 'setRoleImage', variant: 'woman' });
    const morning = playNight(chosen, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const lastRoll = { ...morning, lastNight: { killedId: 'p3', imageRoll: 0.99 } };
    expect(describeScene(buildPlayerView(lastRoll, 'p1'), false, false, 'man')?.image).toBe(MURDER_IMAGES.woman.at(-1));
    expect(describeScene(buildPlayerView(lastRoll, 'p4'), true, false, 'man')?.image).toBe(MURDER_IMAGES.woman.at(-1));
  });

  it('väljer mordbild jämnt fördelat efter värdens slumptal', () => {
    const images = MURDER_IMAGES.man;
    expect(images.map((_, i) => chooseMurderImage((i + 0.5) / images.length, 'man'))).toEqual(images);
  });

  it('visar mannen i den första mordbilden i spel som sparades innan', () => {
    expect(chooseMurderImage(undefined, undefined)).toBe(MURDER_IMAGES.man[0]);
  });

  it('visar en lugn morgon när läkaren räddade offret', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p3', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false)).toMatchObject({ image: 'morningNoMurder', bottomCaption: 'Ingen blev mördad.' });
  });

  it('säger vem som blev förvisad efter omröstningen, med namn även för den förvisade', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p4: 'p2', p5: 'p2' });
    expect(describeScene(buildPlayerView(verdict, 'p1'), false)).toMatchObject({ bottomCaption: 'Spelare 2 blev förvisad.' });
    expect(describeScene(buildPlayerView(verdict, 'p2'), false)).toMatchObject({ bottomCaption: 'Spelare 2 blev förvisad.' });
  });

  it('visar QR-koden för värden och en bild för de andra i lobbyn', () => {
    const lobby = buildPlayerView({ ...night, phase: 'lobby' }, 'p1');
    expect(describeScene(lobby, true)).toMatchObject({ image: null, showsRoomCode: true });
    expect(describeScene(lobby, false)).toMatchObject({ image: 'lobby', showsRoomCode: true });
  });

  it('har en egen slutbild för var och en av vinnarna', () => {
    expect(describeScene(buildPlayerView({ ...night, phase: 'gameOver', winner: 'mafia' }, 'p1'), false)).toMatchObject({ image: 'mafiaWins' });
    expect(describeScene(buildPlayerView({ ...night, phase: 'gameOver', winner: 'town' }, 'p1'), false)).toMatchObject({ image: 'townWins' });
  });

  it('visar galningen som galningen själv valt när galningen vinner, på alla telefoner', () => {
    const withMadman = applyAction(createTestGame(['citizen', 'madman', 'mafia', 'citizen']), 'p2', { type: 'setRoleImage', variant: 'woman' });
    const madmanWon = { ...withMadman, phase: /** @type {const} */ ('gameOver'), winner: /** @type {const} */ ('madman') };
    expect(describeScene(buildPlayerView(madmanWon, 'p1'), false, false, 'man')).toMatchObject({ image: 'madmanWinsWoman' });
    expect(describeScene(buildPlayerView(madmanWon, 'p2'), false, false, 'man')).toMatchObject({ image: 'madmanWinsWoman' });
  });
});

describe('listUpcomingImages', () => {
  const night = createTestGame(ROLES);

  it('hämtar rollens bild och nattbild medan akten är stängd', () => {
    const roleReveal = { ...night, phase: /** @type {const} */ ('roleReveal') };
    expect(listUpcomingImages(buildPlayerView(roleReveal, 'p4'), 'man')).toEqual(['roleDetectiveMan', 'nightDetectiveMan']);
  });

  it('hämtar alla morgonbilder under natten, så att ingen kan se på laddningen om någon dog', () => {
    expect(listUpcomingImages(buildPlayerView(night, 'p1'))).toEqual([...MURDER_IMAGES.woman, ...MURDER_IMAGES.man, 'morningNoMurder']);
  });

  it('hämtar stadsbons nattbild åt den som just blev förvisad', () => {
    const morning = playNight(night, { p2: 'p4', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p3', p2: 'p3', p3: 'p1', p5: 'p3' });
    expect(listUpcomingImages(buildPlayerView({ ...verdict, phase: 'verdict' }, 'p3'))).toEqual(['nightCitizenWoman', 'mafiaWins', 'townWins', 'madmanWinsWoman', 'madmanWinsMan']);
  });

  it('visar dombilden efter den förvisades val av rollbild, samma på alla telefoner', () => {
    const morning = playNight(applyAction(night, 'p2', { type: 'setRoleImage', variant: 'woman' }), { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p4: 'p2', p5: 'p2' });
    expect(describeScene(buildPlayerView(verdict, 'p1'), false, false, 'man')?.image).toBe('verdictWoman');
    expect(describeScene(buildPlayerView(verdict, 'p5'), false, false, 'man')?.image).toBe('verdictWoman');
  });

  it('visar hela maffian samma nattbild, och drar en ny varje natt', () => {
    const twoMafia = createTestGame(['citizen', 'mafia', 'mafia', 'citizen', 'citizen']);
    const imageOf = (/** @type {number} */ round, /** @type {string} */ id) => describeScene(buildPlayerView({ ...twoMafia, round }, id), false)?.image;
    const images = [1, 2, 3, 4, 5, 6].map((round) => imageOf(round, 'p2'));
    expect([1, 2, 3, 4, 5, 6].map((round) => imageOf(round, 'p3'))).toEqual(images);
    expect(new Set(images).size).toBeGreaterThan(1);
    expect(images.every((image) => image?.startsWith('nightMafia'))).toBe(true);
  });
});
