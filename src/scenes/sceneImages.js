// @ts-check
// Bilderna i bildrutan, en per händelse. Utsnittet (position) är valt i
// canvasen "Maffia noir", så att huvudpersonen hamnar mitt i rutan.
import join from './images/ga-med.webp';
import create from './images/skapa.webp';
import lobby from './images/lobby.webp';
import roleHidden from './images/roll-dold.webp';
import roleMafia from './images/roll-maffia.webp';
import roleDetective from './images/roll-detektiv.webp';
import roleDoctor from './images/roll-lakare.webp';
import roleCitizen from './images/roll-stadsbo.webp';
import nightMafia from './images/natt-maffia.webp';
import nightDetective from './images/natt-detektiv.webp';
import nightDoctor from './images/natt-lakare.webp';
import nightCitizen from './images/natt-stadsbo.webp';
import morningMurder from './images/morgon-mord.webp';
import morningNoMurder from './images/morgon-ingen.webp';
import verdict from './images/dom.webp';
import mafiaWins from './images/slut-maffia.webp';
import townWins from './images/slut-staden.webp';

/** @typedef {{ src: string, alt: string, position: string }} SceneImage */

export const SCENE_IMAGES = /** @type {const} */ ({
  join: { src: join, alt: 'En dörr står på glänt i en mörk korridor. Ljus och cigarettrök syns genom springan.', position: '50% 50%' },
  create: { src: create, alt: 'En tom bardisk sent på kvällen med glas, flaskor och en hatt under en hängande lampa.', position: '50% 55%' },
  lobby: { src: lobby, alt: 'Fyra personer spelar kort runt ett runt bord under en hängande lampa i ett mörkt rum.', position: '50% 75%' },
  roleHidden: { src: roleHidden, alt: 'En förseglad akt på ett skrivbord i lampljus, bredvid en hatt och en revolver.', position: '50% 50%' },
  roleMafia: { src: roleMafia, alt: 'En man i kritstrecksrandig kostym och hatt röker i en mörk dörröppning.', position: '50% 28%' },
  roleDetective: { src: roleDetective, alt: 'En detektiv i trenchcoat och hatt med ett anteckningsblock under en gatlykta.', position: '50% 25%' },
  roleDoctor: { src: roleDoctor, alt: 'En läkare i mörk kappa med en läkarväska står i en upplyst dörröppning.', position: '50% 50%' },
  roleCitizen: { src: roleCitizen, alt: 'En man i keps och kofta tittar misstänksamt över axeln i sin ytterdörr.', position: '50% 30%' },
  nightMafia: { src: nightMafia, alt: 'En regnig gata en natt. Två män i hatt står tätt ihop under en gatlykta.', position: '50% 68%' },
  nightDetective: { src: nightDetective, alt: 'En man i skjorta och slips läser ett papper vid ett skrivbord under en lampa. Bakom honom syns stadens fönster i regnet.', position: '50% 35%' },
  nightDoctor: { src: nightDoctor, alt: 'En gestalt i rock med en väska går ensam i regnet längs en tegelmur under en gatlykta.', position: '50% 16%' },
  nightCitizen: { src: nightCitizen, alt: 'En man sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '50% 55%' },
  morningMurder: { src: morningMurder, alt: 'En man ligger död på en regnvåt gata under en gatlykta. En gestalt i hatt går därifrån.', position: '50% 62%' },
  morningNoMurder: { src: morningNoMurder, alt: 'En regnvåt gata på morgonen. En man med hatt bär en kasse och en annan läser tidningen vid en butik.', position: '50% 65%' },
  verdict: { src: verdict, alt: 'Tre män i hatt pekar på en ensam man som står vid en tegelvägg.', position: '50% 45%' },
  mafiaWins: { src: mafiaWins, alt: 'Två män i rock och hatt står på ett tak och ser ut över den mörka staden i regnet.', position: '50% 15%' },
  townWins: { src: townWins, alt: 'Stadsborna står lättade på gatan medan två män i mörka kostymer och hatt går förbi.', position: '50% 45%' },
});

/** @typedef {keyof typeof SCENE_IMAGES} SceneImageKey */
