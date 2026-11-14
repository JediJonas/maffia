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
import roleBodyguardWoman from './images/roll-livvakt-kvinna.webp';
import roleBodyguardMan from './images/roll-livvakt-man.webp';
import roleLawyerWoman from './images/roll-advokat-kvinna.webp';
import roleLawyerMan from './images/roll-advokat-man.webp';
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
import nightMafia1 from './images/natt-maffia-1.webp';
import nightMafia2 from './images/natt-maffia-2.webp';
import nightMafia3 from './images/natt-maffia-3.webp';
import nightDetectiveWoman from './images/natt-detektiv-kvinna.webp';
import nightDetectiveMan from './images/natt-detektiv-man.webp';
import nightDoctorWoman from './images/natt-lakare-kvinna.webp';
import nightDoctorMan from './images/natt-lakare-man.webp';
import nightBodyguardWoman from './images/natt-livvakt-kvinna.webp';
import nightBodyguardMan from './images/natt-livvakt-man.webp';
import nightLawyerWoman from './images/natt-advokat-kvinna.webp';
import nightLawyerMan from './images/natt-advokat-man.webp';
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
import morningMurderWoman from './images/morgon-mord-kvinna.webp';
import morningMurderMan from './images/morgon-mord-man.webp';
import morningMurderHotelWoman from './images/morgon-mord-hotell-kvinna.webp';
import morningMurderHotelMan from './images/morgon-mord-hotell-man.webp';
import morningMurderCloseUpWoman from './images/morgon-mord-narbild-kvinna.webp';
import morningMurderCloseUpMan from './images/morgon-mord-narbild-man.webp';
import morningMurderPoliceWoman from './images/morgon-mord-polis-kvinna.webp';
import morningMurderPoliceMan from './images/morgon-mord-polis-man.webp';
import morningMurderStairsWoman from './images/morgon-mord-trappa-kvinna.webp';
import morningMurderPlatformWoman from './images/morgon-mord-perrong-kvinna.webp';
import morningMurderDocksMan from './images/morgon-mord-hamn-man.webp';
import morningMurderPhoneBoothMan from './images/morgon-mord-telefonkiosk-man.webp';
import morningMurderStairsMan from './images/morgon-mord-trappa-man.webp';
import morningMurderPlatformMan from './images/morgon-mord-perrong-man.webp';
import morningMurderDocksWoman from './images/morgon-mord-hamn-kvinna.webp';
import morningMurderPhoneBoothWoman from './images/morgon-mord-telefonkiosk-kvinna.webp';
import morningNoMurder from './images/morgon-ingen.webp';
import verdictWoman from './images/dom-kvinna.webp';
import verdictMan from './images/dom-man.webp';
import verdictNobody from './images/dom-ingen.webp';
import verdictLawyerWoman from './images/dom-advokat-kvinna.webp';
import verdictLawyerMan from './images/dom-advokat-man.webp';
import mafiaWins from './images/slut-maffia.webp';
import townWins from './images/slut-staden.webp';
import madmanWinsWoman from './images/slut-galningen-kvinna.webp';
import madmanWinsMan from './images/slut-galningen-man.webp';

/** @typedef {{ src: string, alt: string, position: string }} SceneImage */

export const SCENE_IMAGES = /** @type {const} */ ({
  join: { src: join, alt: 'En person i hatt står i en regnig gränd framför en bakdörr som har öppnats. Ljuset faller ut över de våta gatstenarna, och i dörren står någon och väntar.', position: '50% 50%' },
  create: { src: create, alt: 'En tom bar sent på kvällen med glas och flaskor på disken och en hatt på en barstol under en hängande lampa.', position: '50% 50%' },
  lobby: { src: lobby, alt: 'En bar under en hängande lampa. Bartendern ställer fram glas, en kvinna i kappa sätter sig på en barstol med en sedel framför sig, och en man i hatt lutar sig mot disken bredvid henne.', position: '50% 50%' },
  roleHidden: { src: roleHidden, alt: 'En förseglad akt på ett skrivbord i lampljus, bredvid en askkopp med en rykande cigarett, en hatt och en revolver.', position: '50% 50%' },
  roleMafiaWoman: { src: roleMafiaWoman, alt: 'En kvinna i pälsstola och hatt med flor röker med cigarettmunstycke i en dörröppning en regnig natt.', position: '100% 30%' },
  roleMafiaMan: { src: roleMafiaMan, alt: 'En man i kritstrecksrandig kostym och hatt röker i en dörröppning en regnig natt.', position: '100% 30%' },
  roleDetectiveWoman: { src: roleDetectiveWoman, alt: 'En kvinnlig detektiv i ljus trenchcoat och fedora antecknar i ett block i en regnig gränd under en gatlykta.', position: '100% 30%' },
  roleDetectiveMan: { src: roleDetectiveMan, alt: 'En manlig detektiv i ljus trenchcoat och fedora antecknar i ett block i en regnig gränd under en gatlykta.', position: '100% 30%' },
  roleDoctorWoman: { src: roleDoctorWoman, alt: 'En läkare i mörk kappa med stetoskop och läkarväska står i en upplyst dörröppning.', position: '100% 30%' },
  roleBodyguardWoman: { src: roleBodyguardWoman, alt: 'En lång livvakt i bältad rock och liten hatt står med armarna i kors vid en upplyst port en natt och ser prövande på oss.', position: '90% 30%' },
  roleBodyguardMan: { src: roleBodyguardMan, alt: 'En stor livvakt med mustasch, i rock och fedora, står med armarna i kors vid en upplyst port en natt och ser rakt på oss.', position: '90% 30%' },
  roleDoctorMan: { src: roleDoctorMan, alt: 'En läkare med glasögon och mustasch, i mörk kappa med stetoskop och läkarväska, står i en upplyst dörröppning.', position: '100% 30%' },
  roleLawyerWoman: { src: roleLawyerWoman, alt: 'En advokat i knäppt dräkt, blus med rosett och liten hatt står i dörren till sin upplysta byrå med en tjock akt mot sidan och glasögonen i handen.', position: '100% 30%' },
  roleLawyerMan: { src: roleLawyerMan, alt: 'En advokat i kritstrecksrandig kostym med väst och lossad slips lutar sig i dörren till sin upplysta byrå med en tjock akt under armen och ler lite slugt.', position: '100% 30%' },
  roleCitizenWoman: { src: roleCitizenWoman, alt: 'En kvinna i blommig klänning står i sin öppna ytterdörr och ser ut i mörkret med handen mot dörrkarmen.', position: '75% 30%' },
  roleCitizenMan: { src: roleCitizenMan, alt: 'En man i keps och kofta tittar misstänksamt ut genom sin ytterdörr.', position: '100% 30%' },
  roleTaxiDriverWoman: { src: roleTaxiDriverWoman, alt: 'En taxichaufför i skärmmössa och skinnjacka lutar sig ut genom fönstret på en taxi en regnig natt utanför ett hotell.', position: '100% 30%' },
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
  nightMafia1: { src: nightMafia1, alt: 'En regnig gata med brandtrappor en natt. Två män i hatt står tätt ihop vid en port, och en bil står parkerad under en gatlykta.', position: '75% 50%' },
  nightMafia2: { src: nightMafia2, alt: 'En regnig gata en natt. En svart bil står under en gatlykta, och längre bort står två män i hatt i en upplyst port.', position: '35% 50%' },
  nightMafia3: { src: nightMafia3, alt: 'En regnig gata med höga hus en natt. Två män i hatt står i en upplyst port, och en bil står parkerad under en gatlykta.', position: '55% 50%' },
  nightDetectiveWoman: { src: nightDetectiveWoman, alt: 'En kvinna i blus sitter vid ett skrivbord under en lampa en regnig natt, med hakan mot handen, och granskar ett fotografi med förstoringsglas.', position: '100% 40%' },
  nightDetectiveMan: { src: nightDetectiveMan, alt: 'En man i skjortärmar sitter vid ett skrivbord under en lampa en regnig natt och granskar ett fotografi med förstoringsglas.', position: '100% 40%' },
  nightDoctorWoman: { src: nightDoctorWoman, alt: 'En kvinna i ljus kappa med skärp går ensam längs en regnig gata en natt med en läkarväska och ser sig över axeln. En gatlykta lyser upp gatan.', position: '65% 50%' },
  nightBodyguardWoman: { src: nightBodyguardWoman, alt: 'En livvakt i bältad rock och hatt står vakt med händerna i fickorna bredvid en stängd dörr, i ljuset från en gatlykta en regnig natt.', position: '85% 50%' },
  nightBodyguardMan: { src: nightBodyguardMan, alt: 'En stor livvakt i rock och hatt står vakt med händerna i fickorna bredvid en stängd dörr, i ljuset från en gatlykta en regnig natt.', position: '85% 50%' },
  nightDoctorMan: { src: nightDoctorMan, alt: 'En man i hatt och mörk rock går ensam bort längs en regnig gata en natt med en läkarväska och ser sig om. En gatlykta lyser upp gatan.', position: '65% 50%' },
  nightLawyerWoman: { src: nightLawyerWoman, alt: 'En advokat i dräkt, liten hatt och kattögonglasögon sitter vid ett köksbord under en hängande lampa och antecknar. Mitt emot syns bara klientens händer med en cigarett.', position: '75% 50%' },
  nightLawyerMan: { src: nightLawyerMan, alt: 'En gråsprängd advokat i kritstrecksrandig kostym sitter vid ett köksbord under en hängande lampa och antecknar. Mitt emot syns bara klientens händer med en cigarett.', position: '75% 50%' },
  nightCitizenWoman: { src: nightCitizenWoman, alt: 'En kvinna sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '65% 50%' },
  nightCitizenMan: { src: nightCitizenMan, alt: 'En man sover i sin säng. Genom fönstret syns en gestalt i hatt under en gatlykta i regnet.', position: '65% 50%' },
  nightTaxiDriverWoman: { src: nightTaxiDriverWoman, alt: 'En taxichaufför i skärmmössa sitter vid ratten och ser en gestalt i hatt gå ensam på en regnig gata.', position: '50% 50%' },
  nightTaxiDriverMan: { src: nightTaxiDriverMan, alt: 'En taxichaufför i keps sitter vid ratten och ser en gestalt i hatt gå ensam på en regnig gata. Hans ögon syns i backspegeln.', position: '50% 50%' },
  nightWindowWatcherWoman: { src: nightWindowWatcherWoman, alt: 'En kvinna med papiljotter bakom en gardin ser genom fönstret hur en man i hatt går fram till en upplyst dörr i regnet.', position: '60% 50%' },
  nightWindowWatcherMan: { src: nightWindowWatcherMan, alt: 'En äldre man med glasögon och en kikare i handen ser bakom en gardin hur en man i hatt går fram till en upplyst dörr i regnet.', position: '60% 50%' },
  nightBartenderWoman: { src: nightBartenderWoman, alt: 'En bartender häller upp en drink åt en ensam gäst i hatt som sitter hopsjunken vid bardisken.', position: '25% 50%' },
  nightBartenderMan: { src: nightBartenderMan, alt: 'En bartender häller upp en drink åt en ensam gäst i hatt som sitter hopsjunken vid bardisken.', position: '25% 50%' },
  nightSausageVendorWoman: { src: nightSausageVendorWoman, alt: 'En korvvagn under en gatlykta i regnet. En korvgumma räcker en korv till en man i hatt.', position: '50% 50%' },
  nightSausageVendorMan: { src: nightSausageVendorMan, alt: 'En korvvagn under en gatlykta i regnet. Korvgubben räcker en korv till en man i hatt.', position: '50% 50%' },
  morningMurderWoman: { src: morningMurderWoman, alt: 'En kvinna ligger död på en regnvåt gata under en gatlykta. Hennes handväska ligger bredvid, och en man i hatt och rock går därifrån med en pistol i handen.', position: '60% 50%' },
  morningMurderMan: { src: morningMurderMan, alt: 'En man ligger död på en regnvåt gata under en gatlykta. Hans hatt ligger bredvid, och en man i hatt och rock går därifrån med en pistol i handen.', position: '60% 50%' },
  morningMurderHotelWoman: { src: morningMurderHotelWoman, alt: 'En kvinna ligger död på golvet i ett hotellrum bredvid ett vältat glas. En man i hatt med en pistol i handen går ut genom den öppna dörren.', position: '50% 50%' },
  morningMurderHotelMan: { src: morningMurderHotelMan, alt: 'En man ligger död på golvet i ett hotellrum bredvid ett vältat glas. En man i hatt med en pistol i handen går ut genom den öppna dörren.', position: '50% 50%' },
  morningMurderCloseUpWoman: { src: morningMurderCloseUpWoman, alt: 'En kvinna i dräkt ligger död på ett mörkt trägolv. En nedslagen skrivbordslampa ligger på sidan bredvid henne, och glasögonen och några lösa pärlor ligger i ljuset.', position: '35% 50%' },
  morningMurderCloseUpMan: { src: morningMurderCloseUpMan, alt: 'En man i kostym ligger död på ett mörkt trägolv. En nedslagen skrivbordslampa ligger på sidan bredvid honom, och glasögonen ligger i ljuset.', position: '35% 50%' },
  morningMurderPoliceWoman: { src: morningMurderPoliceWoman, alt: 'En kvinna ligger död på en våt gata en grå morgon. En polis sitter på huk bredvid henne, hennes sko och handväska ligger utspridda, och en bagare, en man med portfölj och en tidningspojke tittar på.', position: '40% 50%' },
  morningMurderPoliceMan: { src: morningMurderPoliceMan, alt: 'En man ligger död på en våt gata en grå morgon. En polis sitter på huk bredvid honom, hans hatt ligger på gatstenen, och en bagare, en man med portfölj och en tidningspojke tittar på.', position: '40% 50%' },
  morningMurderStairsWoman: { src: morningMurderStairsWoman, alt: 'Sett uppifrån i ett spiraltrapphus ligger en kvinna död på det rutiga golvet längst ner. En av hennes skor ligger kvar på trappstegen.', position: '50% 50%' },
  morningMurderPlatformWoman: { src: morningMurderPlatformWoman, alt: 'En kvinna i hatt ligger död på en perrong bredvid en uppbruten resväska, medan ett tåg står inne vid plattformen.', position: '35% 50%' },
  morningMurderDocksMan: { src: morningMurderDocksMan, alt: 'En man ligger död bland lårar på en kaj i dimman, under kranar och ett stort fartyg. Hans hatt flyter i vattnet.', position: '50% 50%' },
  morningMurderPhoneBoothMan: { src: morningMurderPhoneBoothMan, alt: 'En man i hatt och rock sitter död i en telefonkiosk i regnet. Luren hänger i sin sladd ovanför honom.', position: '45% 50%' },
  morningMurderStairsMan: { src: morningMurderStairsMan, alt: 'Sett uppifrån i ett spiraltrapphus ligger en man död på det rutiga golvet längst ner. Hans hatt ligger kvar på trappstegen.', position: '50% 50%' },
  morningMurderPlatformMan: { src: morningMurderPlatformMan, alt: 'En man i mörk rock ligger död på en perrong bredvid en uppbruten resväska och sin hatt, medan ett tåg står inne vid plattformen.', position: '35% 50%' },
  morningMurderDocksWoman: { src: morningMurderDocksWoman, alt: 'En kvinna ligger död bland lårar på en kaj i dimman, under kranar och ett stort fartyg. Hennes hatt flyter i vattnet.', position: '50% 50%' },
  morningMurderPhoneBoothWoman: { src: morningMurderPhoneBoothWoman, alt: 'En kvinna i ljus kappa sitter död i en telefonkiosk i regnet med hatten i knät. Luren hänger i sin sladd ovanför henne.', position: '45% 50%' },
  morningNoMurder: { src: morningNoMurder, alt: 'En regnvåt gata på morgonen. En mjölkbud ställer flaskor på en trappa, och en man i hatt läser tidningen mot en vägg.', position: '65% 50%' },
  verdictWoman: { src: verdictWoman, alt: 'Två män i hatt pekar på en rädd kvinna som står med hatten i handen vid en tegelvägg.', position: '50% 40%' },
  verdictLawyerWoman: { src: verdictLawyerWoman, alt: 'Två män i hatt pekar på en rädd kvinna, men en advokat i lång rock och hatt har klivit fram bredvid henne och håller upp handen.', position: '55% 40%' },
  verdictLawyerMan: { src: verdictLawyerMan, alt: 'Två män i hatt pekar på en rädd man, men en advokat i lång rock och hatt har klivit fram bredvid honom och håller upp handen.', position: '55% 40%' },
  verdictMan: { src: verdictMan, alt: 'Två män i hatt pekar på en rädd man som står med hatten i händerna vid en tegelvägg.', position: '50% 40%' },
  verdictNobody: { src: verdictNobody, alt: 'Stadsborna står kvar på en våt gata efter omröstningen. Två män skakar hand, några står och tittar, och en man går därifrån.', position: '30% 50%' },
  mafiaWins: { src: mafiaWins, alt: 'Två män i rock och hatt står på ett tak och ser ut över den mörka staden. Den ena tänder en cigarett.', position: '30% 40%' },
  townWins: { src: townWins, alt: 'Stadsborna skakar hand på en regnvåt gata, medan två poliser för bort en man i kostym mot en polisbil.', position: '50% 50%' },
  madmanWinsWoman: { src: madmanWinsWoman, alt: 'Två skötare i vita rockar för bort en skrattande kvinna i tvångströja mot en ambulans. Några stadsbor ser på.', position: '75% 50%' },
  madmanWinsMan: { src: madmanWinsMan, alt: 'Två skötare i vita rockar för bort en skrattande man i tvångströja mot en ambulans. Några stadsbor ser på.', position: '75% 50%' },
});

/** @typedef {keyof typeof SCENE_IMAGES} SceneImageKey */
