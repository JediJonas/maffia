// @ts-check
// Bilderna i bildrutan, en per händelse. Utsnittet (position) är valt i
// canvasen "Maffia noir", så att huvudpersonen hamnar mitt i rutan.
import join from './images/ga-med.webp';
import create from './images/skapa.webp';
import lobby from './images/lobby.webp';
import roleHidden from './images/roll-dold.webp';
import roleMafiaWoman from './images/roll-maffia-kvinna.webp';
import roleMafiaMan from './images/roll-maffia-man.webp';
import roleDetectiveWoman from './images/roll-detektiv-kvinna.webp';
import roleDetectiveMan from './images/roll-detektiv-man.webp';
import roleDoctorWoman from './images/roll-lakare-kvinna.webp';
import roleDoctorMan from './images/roll-lakare-man.webp';
import roleCitizenWoman from './images/roll-stadsbo-kvinna.webp';
import roleCitizenMan from './images/roll-stadsbo-man.webp';
import roleTaxiDriverWoman from './images/roll-taxichauffor-kvinna.webp';
import roleTaxiDriverMan from './images/roll-taxichauffor-man.webp';
import roleWindowWatcherWoman from './images/roll-fonstertittare-kvinna.webp';
import roleWindowWatcherMan from './images/roll-fonstertittare-man.webp';
import roleBartenderWoman from './images/roll-bartender-kvinna.webp';
import roleBartenderMan from './images/roll-bartender-man.webp';
import roleSausageVendorWoman from './images/roll-korvgubbe-kvinna.webp';
import roleSausageVendorMan from './images/roll-korvgubbe-man.webp';
import roleGodfatherWoman from './images/roll-gudfadern-kvinna.webp';
import roleGodfatherMan from './images/roll-gudfadern-man.webp';
import roleMayorWoman from './images/roll-borgmastare-kvinna.webp';
import roleMayorMan from './images/roll-borgmastare-man.webp';
import roleMadmanWoman from './images/roll-galningen-kvinna.webp';
import roleMadmanMan from './images/roll-galningen-man.webp';
import nightMafia from './images/natt-maffia.webp';
import nightDetective from './images/natt-detektiv.webp';
import nightDoctor from './images/natt-lakare.webp';
import nightCitizen from './images/natt-stadsbo.webp';
import nightTaxiDriver from './images/natt-taxichauffor.webp';
import nightWindowWatcher from './images/natt-fonstertittare.webp';
import nightBartender from './images/natt-bartender.webp';
import nightSausageVendor from './images/natt-korvgubbe.webp';
import morningMurder from './images/morgon-mord.webp';
import morningMurderBedroom from './images/morgon-mord-sovrum.webp';
import morningMurderOffice from './images/morgon-mord-kontor.webp';
import morningMurderRain from './images/morgon-mord-regn.webp';
import morningMurderSidewalk from './images/morgon-mord-trottoar.webp';
import morningMurderRevolver from './images/morgon-mord-revolver.webp';
import morningMurderShadow from './images/morgon-mord-skugga.webp';
import morningMurderKnife from './images/morgon-mord-kniv.webp';
import morningNoMurder from './images/morgon-ingen.webp';
import verdict from './images/dom.webp';
import mafiaWins from './images/slut-maffia.webp';
import townWins from './images/slut-staden.webp';
import madmanWins from './images/slut-galningen.webp';

/** @typedef {{ src: string, alt: string, position: string }} SceneImage */

export const SCENE_IMAGES = /** @type {const} */ ({
  join: { src: join, alt: 'En dörr står på glänt i slutet av en mörk korridor. Ljuset faller över golvet där ett spelkort ligger. Därinne står en stol med en hatt, och rök stiger mot taket.', position: '50% 50%' },
  create: { src: create, alt: 'En tom bardisk sent på kvällen med glas, flaskor och en hatt under en hängande lampa.', position: '50% 55%' },
  lobby: { src: lobby, alt: 'Fyra personer spelar kort runt ett runt bord under en hängande lampa i ett mörkt rum.', position: '50% 75%' },
  roleHidden: { src: roleHidden, alt: 'En förseglad akt på ett skrivbord i lampljus, bredvid en hatt och en revolver.', position: '50% 50%' },
  roleMafiaWoman: { src: roleMafiaWoman, alt: 'En kvinna i pälsstola och hatt med flor röker med cigarettmunstycke i en dörröppning en regnig natt.', position: '100% 30%' },
  roleMafiaMan: { src: roleMafiaMan, alt: 'En man i kritstrecksrandig kostym och hatt röker i en dörröppning en regnig natt.', position: '100% 30%' },
  roleDetectiveWoman: { src: roleDetectiveWoman, alt: 'En kvinnlig detektiv i ljus trenchcoat och hatt antecknar i ett block i en regnig gränd.', position: '50% 30%' },
  roleDetectiveMan: { src: roleDetectiveMan, alt: 'En manlig detektiv i mörk trenchcoat och hatt antecknar i ett block i en regnig gränd.', position: '75% 30%' },
  roleDoctorWoman: { src: roleDoctorWoman, alt: 'En läkare i mörk kappa med stetoskop och läkarväska står i en upplyst dörröppning.', position: '100% 30%' },
  roleDoctorMan: { src: roleDoctorMan, alt: 'En läkare med glasögon och mustasch, i mörk kappa med stetoskop och läkarväska, står i en upplyst dörröppning.', position: '100% 30%' },
  roleCitizenWoman: { src: roleCitizenWoman, alt: 'En kvinna i huvudduk och kofta tittar misstänksamt ut genom sin ytterdörr.', position: '100% 30%' },
  roleCitizenMan: { src: roleCitizenMan, alt: 'En man i keps och kofta tittar misstänksamt ut genom sin ytterdörr.', position: '100% 30%' },
  roleTaxiDriverWoman: { src: roleTaxiDriverWoman, alt: 'En taxichaufför i skärmmössa och skinnrock sitter vid ratten en regnig natt utanför ett hotell.', position: '100% 30%' },
  roleTaxiDriverMan: { src: roleTaxiDriverMan, alt: 'En taxichaufför i keps med en cigarett i munnen lutar sig ut genom bilrutan en regnig natt utanför ett hotell.', position: '85% 30%' },
  roleWindowWatcherWoman: { src: roleWindowWatcherWoman, alt: 'En kvinna i morgonrock och papiljotter drar undan en spetsgardin och spanar ut i mörkret.', position: '100% 30%' },
  roleWindowWatcherMan: { src: roleWindowWatcherMan, alt: 'En äldre man med glasögonen uppskjutna i pannan och en kikare i handen drar undan en spetsgardin och spanar ut i mörkret.', position: '100% 30%' },
  roleBartenderWoman: { src: roleBartenderWoman, alt: 'En bartender i väst och fluga ställer fram en cocktail på bardisken, med flaskor bakom sig.', position: '100% 30%' },
  roleBartenderMan: { src: roleBartenderMan, alt: 'En bartender i väst och fluga torkar ett glas bakom bardisken, med flaskor bakom sig.', position: '100% 30%' },
  roleSausageVendorWoman: { src: roleSausageVendorWoman, alt: 'En korvgumma i pappersmössa räcker fram en korv med en tång vid sin korvvagn i regnet.', position: '100% 30%' },
  roleSausageVendorMan: { src: roleSausageVendorMan, alt: 'En korvgubbe med mustasch och pappersmössa räcker fram en korv med en tång vid sin korvvagn i regnet.', position: '100% 30%' },
  roleGodfatherWoman: { src: roleGodfatherWoman, alt: 'En äldre kvinna med pärlhalsband sitter med hopknäppta händer bakom ett skrivbord i persiennernas skugga.', position: '90% 30%' },
  roleGodfatherMan: { src: roleGodfatherMan, alt: 'En äldre man i mörk kostym sitter med hopknäppta händer bakom ett skrivbord i persiennernas skugga.', position: '90% 30%' },
  roleMayorWoman: { src: roleMayorWoman, alt: 'En kvinnlig borgmästare i dräkt och ämbetskedja står på trappan framför stadshuset.', position: '75% 30%' },
  roleMayorMan: { src: roleMayorMan, alt: 'En manlig borgmästare i kostym och ämbetskedja höjer handen på trappan framför stadshuset.', position: '100% 30%' },
  roleMadmanWoman: { src: roleMadmanWoman, alt: 'En kvinna med långt rufsigt hår i tvångströja flinar i en vadderad cell under en lampa.', position: '100% 30%' },
  roleMadmanMan: { src: roleMadmanMan, alt: 'En man med rufsigt hår i tvångströja flinar i en vadderad cell under en lampa.', position: '100% 30%' },
  nightMafia: { src: nightMafia, alt: 'En regnig gata en natt. Två män i hatt står tätt ihop under en gatlykta.', position: '50% 68%' },
  nightDetective: { src: nightDetective, alt: 'En man i skjorta och slips läser ett papper vid ett skrivbord under en lampa. Bakom honom syns stadens fönster i regnet.', position: '50% 35%' },
  nightDoctor: { src: nightDoctor, alt: 'En gestalt i rock med en väska går ensam i regnet längs en tegelmur under en gatlykta.', position: '50% 16%' },
  nightCitizen: { src: nightCitizen, alt: 'En man sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '50% 55%' },
  nightTaxiDriver: { src: nightTaxiDriver, alt: 'Från baksätet i en taxi syns en gestalt i hatt som går ensam på en regnig gata. Chaufförens ögon syns i backspegeln.', position: '50% 55%' },
  nightWindowWatcher: { src: nightWindowWatcher, alt: 'En kvinna bakom en gardin ser genom fönstret hur en man i hatt går fram till en upplyst dörr i regnet.', position: '50% 45%' },
  nightBartender: { src: nightBartender, alt: 'En bartender häller upp en drink åt en ensam gäst i hatt som sitter hopsjunken vid bardisken.', position: '50% 50%' },
  nightSausageVendor: { src: nightSausageVendor, alt: 'En korvvagn under en gatlykta i regnet. Korvgubben räcker en korv till en man i hatt.', position: '50% 55%' },
  morningMurder: { src: morningMurder, alt: 'En man ligger död på en regnvåt gata under en gatlykta. En gestalt i hatt går därifrån.', position: '50% 62%' },
  morningMurderBedroom: { src: morningMurderBedroom, alt: 'En kvinna ligger död på golvet i ett sovrum. I den öppna dörren står en man i hatt och rock.', position: '50% 100%' },
  morningMurderOffice: { src: morningMurderOffice, alt: 'En man i kostym ligger död på trägolvet i ett arbetsrum, med glasögonen bredvid sig.', position: '60% 50%' },
  morningMurderRain: { src: morningMurderRain, alt: 'En kvinna i trenchcoat ligger död på en regnvåt gata. Hennes handväska och läppstift ligger i en vattenpöl.', position: '50% 60%' },
  morningMurderSidewalk: { src: morningMurderSidewalk, alt: 'En man ligger död på trottoaren med hatten bredvid sig. En man i rock och hatt springer därifrån.', position: '50% 65%' },
  morningMurderRevolver: { src: morningMurderRevolver, alt: 'En man i hatt och rock avfyrar en revolver rakt mot betraktaren i ett mörkt sovrum.', position: '50% 0%' },
  morningMurderShadow: { src: morningMurderShadow, alt: 'Skuggan av en man i hatt som höjer en kniv faller över en tegelvägg i en gränd.', position: '50% 0%' },
  morningMurderKnife: { src: morningMurderKnife, alt: 'En man i hatt och rock höjer en kniv till hugg.', position: '50% 0%' },
  morningNoMurder: { src: morningNoMurder, alt: 'En regnvåt gata på morgonen. En man med hatt bär en kasse och en annan läser tidningen vid en butik.', position: '50% 65%' },
  verdict: { src: verdict, alt: 'Tre män i hatt pekar på en ensam man som står vid en tegelvägg.', position: '50% 45%' },
  mafiaWins: { src: mafiaWins, alt: 'Två män i rock och hatt står på ett tak och ser ut över den mörka staden i regnet.', position: '50% 15%' },
  townWins: { src: townWins, alt: 'En polis för bort en man i hatt med handbojor längs trottoaren mot en polisbil. Stadsborna står och ser på.', position: '50% 35%' },
  madmanWins: { src: madmanWins, alt: 'Två skötare i vita rockar för bort en skrattande man med armarna i kors längs en regnvåt gata. Några stadsbor ser på.', position: '50% 50%' },
});

/** @typedef {keyof typeof SCENE_IMAGES} SceneImageKey */
