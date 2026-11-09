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
import nightCitizenWoman from './images/natt-stadsbo-kvinna.webp';
import nightCitizenMan from './images/natt-stadsbo-man.webp';
import nightTaxiDriverWoman from './images/natt-taxichauffor-kvinna.webp';
import nightTaxiDriverMan from './images/natt-taxichauffor-man.webp';
import nightWindowWatcherWoman from './images/natt-fonstertittare-kvinna.webp';
import nightWindowWatcherMan from './images/natt-fonstertittare-man.webp';
import nightBartenderWoman from './images/natt-bartender-kvinna.webp';
import nightBartenderMan from './images/natt-bartender-man.webp';
import nightSausageVendorWoman from './images/natt-korvgubbe-kvinna.webp';
import nightSausageVendorMan from './images/natt-korvgubbe-man.webp';
import morningMurder from './images/morgon-mord.webp';
import morningNoMurder from './images/morgon-ingen.webp';
import verdict from './images/dom.webp';
import mafiaWins from './images/slut-maffia.webp';
import townWins from './images/slut-staden.webp';
import madmanWins from './images/slut-galningen.webp';

/** @typedef {{ src: string, alt: string, position: string }} SceneImage */

export const SCENE_IMAGES = /** @type {const} */ ({
  join: { src: join, alt: 'En mörk korridor med en dörr på glänt. Ljuset faller över golvet där ett papper ligger, och därinne står ett bord med en hatt och en rykande cigarett.', position: '50% 50%' },
  create: { src: create, alt: 'En tom bar sent på kvällen med glas och flaskor på disken och en hatt på en barstol under en hängande lampa.', position: '50% 50%' },
  lobby: { src: lobby, alt: 'Två män i hatt och en kvinna med en cigarett spelar kort runt ett runt bord under en hängande lampa i ett mörkt rum.', position: '50% 50%' },
  roleHidden: { src: roleHidden, alt: 'En förseglad akt på ett skrivbord i lampljus, bredvid en askkopp med en rykande cigarett, en hatt och en revolver.', position: '50% 50%' },
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
  nightCitizenWoman: { src: nightCitizenWoman, alt: 'En kvinna sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '65% 50%' },
  nightCitizenMan: { src: nightCitizenMan, alt: 'En man sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '65% 50%' },
  nightTaxiDriverWoman: { src: nightTaxiDriverWoman, alt: 'En taxichaufför i skärmmössa sitter vid ratten och ser en gestalt i hatt gå ensam på en regnig gata.', position: '50% 50%' },
  nightTaxiDriverMan: { src: nightTaxiDriverMan, alt: 'En taxichaufför i keps sitter vid ratten och ser en gestalt i hatt gå ensam på en regnig gata. Hans ögon syns i backspegeln.', position: '50% 50%' },
  nightWindowWatcherWoman: { src: nightWindowWatcherWoman, alt: 'En kvinna med papiljotter bakom en gardin ser genom fönstret hur en man i hatt går fram till en upplyst dörr i regnet.', position: '60% 50%' },
  nightWindowWatcherMan: { src: nightWindowWatcherMan, alt: 'En äldre man med glasögon och en kikare i handen ser bakom en gardin hur en man i hatt går fram till en upplyst dörr i regnet.', position: '60% 50%' },
  nightBartenderWoman: { src: nightBartenderWoman, alt: 'En bartender häller upp en drink åt en ensam gäst i hatt som sitter hopsjunken vid bardisken.', position: '25% 50%' },
  nightBartenderMan: { src: nightBartenderMan, alt: 'En bartender häller upp en drink åt en ensam gäst i hatt som sitter hopsjunken vid bardisken.', position: '100% 50%' },
  nightSausageVendorWoman: { src: nightSausageVendorWoman, alt: 'En korvvagn under en gatlykta i regnet. En korvgumma räcker en korv till en man i hatt.', position: '50% 50%' },
  nightSausageVendorMan: { src: nightSausageVendorMan, alt: 'En korvvagn under en gatlykta i regnet. Korvgubben räcker en korv till en man i hatt.', position: '50% 50%' },
  morningMurder: { src: morningMurder, alt: 'En man ligger död på en regnvåt gata under en gatlykta. Hans hatt ligger bredvid, och en man i hatt och rock går därifrån med en pistol i handen.', position: '60% 50%' },
  morningNoMurder: { src: morningNoMurder, alt: 'En regnvåt gata på morgonen. En mjölkbud ställer flaskor på en trappa, och en man i hatt läser tidningen mot en vägg.', position: '65% 50%' },
  verdict: { src: verdict, alt: 'Tre personer i hatt pekar på en rädd man som står med hatten i händerna vid en tegelvägg.', position: '50% 40%' },
  mafiaWins: { src: mafiaWins, alt: 'Två män i rock och hatt står på ett tak och ser ut över den mörka staden. Den ena tänder en cigarett.', position: '30% 40%' },
  townWins: { src: townWins, alt: 'Stadsborna skakar hand på en regnvåt gata, medan två poliser för bort en man i kostym mot en polisbil.', position: '50% 50%' },
  madmanWins: { src: madmanWins, alt: 'Två skötare i vita rockar för bort en skrattande man i tvångströja mot en ambulans. Några stadsbor ser på.', position: '75% 50%' },
});

/** @typedef {keyof typeof SCENE_IMAGES} SceneImageKey */
