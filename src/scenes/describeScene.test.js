import { describe, expect, it } from 'vitest';
import { MURDER_IMAGES, chooseRoleImage, describeScene, listUpcomingImages } from './describeScene.js';
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
    expect(describeScene(buildPlayerView(night, 'p2'), false)).toMatchObject({ image: 'nightMafia', bottomCaption: '… men inte maffian.' });
    expect(describeScene(buildPlayerView(night, 'p4'), false)).toMatchObject({ image: 'nightDetective', bottomCaption: '… men inte du.' });
    expect(describeScene(buildPlayerView(night, 'p5'), false)).toMatchObject({ image: 'nightDoctor' });
    expect(describeScene(buildPlayerView(night, 'p1'), false)).toMatchObject({ image: 'nightCitizenWoman', bottomCaption: '… och så även du.' });
  });

  it('visar nattbilden med en kvinna eller en man, som rollbilden', () => {
    expect(describeScene(buildPlayerView(night, 'p1'), false, false, 'man')).toMatchObject({ image: 'nightCitizenMan' });
    expect(describeScene(buildPlayerView(night, 'p2'), false, false, 'man')).toMatchObject({ image: 'nightMafia' });
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

  it('visar mordbilden efter den mördades val av rollbild, på alla telefoner', () => {
    const chosen = applyAction(night, 'p3', { type: 'setRoleImage', variant: 'woman' });
    const morning = playNight(chosen, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false, false, 'man')?.image).toBe(MURDER_IMAGES.woman);
    expect(describeScene(buildPlayerView(morning, 'p4'), true, false, 'man')?.image).toBe(MURDER_IMAGES.woman);
  });

  it('låter värdens slumptal välja mordbild när den mördade inte skickat någon rollbild', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView({ ...morning, lastNight: { killedId: 'p3', imageRoll: 0.1 } }, 'p1'), false)?.image).toBe(MURDER_IMAGES.woman);
    expect(describeScene(buildPlayerView({ ...morning, lastNight: { killedId: 'p3', imageRoll: 0.9 } }, 'p1'), false)?.image).toBe(MURDER_IMAGES.man);
    expect(describeScene(buildPlayerView({ ...morning, lastNight: { killedId: 'p3' } }, 'p1'), false)?.image).toBe(MURDER_IMAGES.man);
  });

  it('visar en lugn morgon när läkaren räddade offret', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p3', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false)).toMatchObject({ image: 'morningNoMurder', bottomCaption: 'Ingen blev mördad.' });
  });

  it('säger vem som blev förvisad efter omröstningen, med namn även för den förvisade', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p4: 'p2', p5: 'p2' });
    expect(describeScene(buildPlayerView(verdict, 'p1'), false)).toMatchObject({ image: 'verdict', bottomCaption: 'Spelare 2 blev förvisad.' });
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
    expect(listUpcomingImages(buildPlayerView(roleReveal, 'p4'), 'man')).toEqual(['roleDetectiveMan', 'nightDetective']);
  });

  it('hämtar alla morgonbilder under natten, så att ingen kan se på laddningen om någon dog', () => {
    expect(listUpcomingImages(buildPlayerView(night, 'p1'))).toEqual([MURDER_IMAGES.woman, MURDER_IMAGES.man, 'morningNoMurder']);
  });

  it('hämtar stadsbons nattbild åt den som just blev förvisad', () => {
    const morning = playNight(night, { p2: 'p4', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p3', p2: 'p3', p3: 'p1', p5: 'p3' });
    expect(listUpcomingImages(buildPlayerView({ ...verdict, phase: 'verdict' }, 'p3'))).toEqual(['nightCitizenWoman', 'mafiaWins', 'townWins', 'madmanWinsWoman', 'madmanWinsMan']);
  });
});
