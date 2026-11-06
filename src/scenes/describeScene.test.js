import { describe, expect, it } from 'vitest';
import { describeScene } from './describeScene.js';
import { buildPlayerView } from '../game/playerView.js';
import { createTestGame, playDay, playNight } from '../game/testGame.js';

const ROLES = ['citizen', 'mafia', 'citizen', 'detective', 'doctor'];

describe('describeScene', () => {
  const night = createTestGame(ROLES);

  it('visar akten tills spelaren öppnar den, och sedan rollens bild', () => {
    const roleReveal = { ...night, phase: /** @type {const} */ ('roleReveal') };
    expect(describeScene(buildPlayerView(roleReveal, 'p2'), false)).toMatchObject({ image: 'roleHidden', bottomCaption: 'Din roll ligger i akten.' });
    expect(describeScene(buildPlayerView(roleReveal, 'p2'), false, true)).toMatchObject({ image: 'roleMafia', bottomCaption: 'Du är maffia.' });
    expect(describeScene(buildPlayerView(roleReveal, 'p1'), false, true)).toMatchObject({ image: 'roleCitizen', bottomCaption: 'Du är stadsbo.' });
  });

  it('visar varje roll sin egen nattbild', () => {
    expect(describeScene(buildPlayerView(night, 'p2'), false)).toMatchObject({ image: 'nightMafia', bottomCaption: '… men inte maffian.' });
    expect(describeScene(buildPlayerView(night, 'p4'), false)).toMatchObject({ image: 'nightDetective', bottomCaption: '… men inte du.' });
    expect(describeScene(buildPlayerView(night, 'p5'), false)).toMatchObject({ image: 'nightDoctor' });
    expect(describeScene(buildPlayerView(night, 'p1'), false)).toMatchObject({ image: 'nightCitizen', bottomCaption: '… och så även du.' });
  });

  it('visar den som är ute ur spelet som en sovande stadsbo på natten', () => {
    const morning = playNight(night, { p2: 'p4', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const nextNight = playDay(morning, { p1: 'p3', p2: 'p3', p3: 'p1', p5: 'p3' });
    const detectiveIsOut = { ...nextNight, phase: 'night' };
    expect(describeScene(buildPlayerView(detectiveIsOut, 'p4'), false)).toMatchObject({ image: 'nightCitizen' });
  });

  it('berättar på morgonen vem som blev mördad, och säger du till offret', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false)).toMatchObject({ image: 'morningMurder', bottomCaption: 'Spelare 3 blev mördad.' });
    expect(describeScene(buildPlayerView(morning, 'p3'), false)).toMatchObject({ bottomCaption: 'Du blev mördad.' });
  });

  it('visar en lugn morgon när läkaren räddade offret', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p3', p1: 'p2', p3: 'p1' });
    expect(describeScene(buildPlayerView(morning, 'p1'), false)).toMatchObject({ image: 'morningNoMurder', bottomCaption: 'Ingen blev mördad.' });
  });

  it('säger vem som blev förvisad efter omröstningen', () => {
    const morning = playNight(night, { p2: 'p3', p4: 'p2', p5: 'p1', p1: 'p2', p3: 'p1' });
    const verdict = playDay(morning, { p1: 'p2', p2: 'p1', p4: 'p2', p5: 'p2' });
    expect(describeScene(buildPlayerView(verdict, 'p1'), false)).toMatchObject({ image: 'verdict', bottomCaption: 'Spelare 2 blev förvisad.' });
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
});
