# Maffia – designregler (noir-serien)

Gällande förslag: canvasen "Maffia noir" (https://claude.ai/artifact/5wB8bBU9vwyssjEUoYVUef).

## Grund
- Svart tusch på vitt papper. Ingen färg. Egen röst markeras med svart bakgrund.
- Avatarer har vit bakgrund (inte appens pastellfärger – prövat och valt bort).
- Textrutor (berättartext): Comic Neue 700, versaler, 15 px, 2 px svart ram, vit bakgrund.
- En textruta med mer än en rad löptext går i full bredd (samma bredd som bildrutan och listor).
- Formulär (Gå med, Skapa): fälten ligger som rader i en tabell, likt listan i Ändra figur. Rad 56 px, etikett till vänster (Archivo 600, 16 px), fältet till höger utan egen ram, 1 px linje mellan raderna. Fältet ska ha en tydlig fokusmarkering i appen.
- Appens egen text: Archivo. Grå hjälptext #444, 14 px.
- Rumskoden skrivs alltid med 0,3 em mellan bokstäverna (KXQ4), både i Gå med och i Lobbyn, som i appen i dag.
- Tal skrivs med bokstäver i serierutor och lappar ("fyra spelare", "tre av fem har röstat"). Siffror bara i rubriker som "Dag 1" och i koder.
- Bildruta: 318 px hög, 2 px ram, textruta uppe till vänster och nere till höger.
- Knappar: 52 px höga piller. När två ligger på varandra ligger den svarta huvudknappen längst ner (närmast tummen) och den vita ovanför. Undantag: startsidan, där "Gå med i spel" (svart) ligger överst, och Ändra figur, där "Slumpa figur" ligger uppe vid figuren.
- Rubrik (Dag 1, Natt 1, Din roll, Domslut, Maffian vann, Lobby): Big Shoulders Display 900, 40 px, versaler, 0.03em, i toppraden till vänster. Namn och hatt till höger.
- Ordet "avatar" används inte i appen. Det heter "figur": rubriken "Din figur" och lobbyknappen "Ändra figur".
- Listor får en berättande textruta ovanför (t.ex. "Fyra spelare har anslutit.", "Så här låg det till."), inte en etikett.
- Textrutan i bilden säger då bara "Staden vaknar …" / "Staden sover …".
- Lämna-knapp: hatt-ikonen, 44×44 px, öppnar frågan "Lämna spelet?".

## Avstånd (gäller alla vyer)
Grundregeln: 16 px luft mellan två delar, mätt från det som syns längst ut. Det betyder att lappen som hänger under en lista räknas med, och att en pratbubbla mäts från sin ritade kant, inte från rutan den ritas i (Jonas 2026-11-06, bekräftat 2026-11-09).

| Var | Luft | Anmärkning |
| --- | --- | --- |
| Rubrikraden till bildrutan | 18 px | Samma i lobbyn och i spelet. |
| Under bildrutan, till nästa del | 16 px | Gäller textruta, lista och personrad. |
| Personrad (cirkel med ruta) | 16 px ovanför och 16 px under | Med pratbubbla räknas bubblans överkant som radens överkant. Raden ska inte ligga närmare bildrutan än rutan under ligger raden (Jonas 2026-11-09). |
| Textruta (berättartext) | 16 px över och under | |
| Frågan ovanför en lista | 16 px ovanför | Frågan sitter ihop med listan och går 6 px in över den. |
| Lappen under en lista | hänger ut 20 px under listan | Luften räknas från lappens underkant, alltså 16 px under lappen. |
| Mellan två knappar | 10 px | |
| Ovanför knapparna, med mus | 24 px | Knapparna står direkt under innehållet. Samma i Din figur, Inställningar och Regler. |
| Ovanför knapparna, med pekskärm | minst 24 px | Knapparna trycks ner mot botten, 16 px ovanför verktygsfältet eller hemstrecket (`--bottom-gap`, se CLAUDE.md). |
| Fält i formulär (Kod, Ditt namn) | 16 px | Mellan fälten och till rutan ovanför. |

- Lägg aldrig till egen luft för en enskild del. Avvikelser från tabellen beslutas av Jonas och skrivs in här.
- Textrutor trycks aldrig ner mot skärmens botten. Bara knapparna gör det.
- I koden heter grundluften `--block-gap` (16 px), lappens överhäng `--tag-overhang` och bubblans överhäng `--bubble-overhang` minus `--bubble-inset` (src/styles.css).
- Kontroll: `maffia/verktyg/matt-avstand.js` i projektfilerna mäter luften mellan delarna i tavlans vyer (körs med Playwright). I appen mäts det på samma sätt med elementens kanter.

## Person med ruta (standard)
- Rund bild 112 px. Cirkeln och rutan bredvid har en gemensam 2 px svart ram, så att cirkelns linje inte syns där rutan går in under den (Jonas 2026-11-06).
- Rutan bredvid: förskjuten 58 px nedåt och 14 px in över cirkeln, ligger ovanpå cirkeln.
- Cirkeln och rutan har en sammanhängande kontur på alla skärmar: rutan maskas där den möter cirkeln, och hela raden får en gemensam vit ring på 5 px.
- 16 px luft ovanför och under cirkeln, mätt till närmaste ruta (även lösa textrutor och lappar). Se Avstånd.
- Två rader: rubrik i Comic Neue (versaler) + en rad Archivo i grått, så att rutans
  nederkant möter cirkelns nederkant.
- Rutan har alltid samma höjd, 54 px, även när den bara har en rad (som "Erik är också maffia." och "Cissi var stadsbo."). Texten centreras lodrätt.

## Ljust läge (dag: morgonen, rollkortet)
- Ljust raster: små svarta punkter som syns direkt under toppraden och växer mot botten, likadant på alla sidor utom natten. Rastret är alltid lika högt som skärmen, så det börjar på samma ställe och har lika stora punkter på alla sidor. På en sida längre än skärmen, som Regler, fortsätter de största punkterna nedåt (Jonas 2026-11-07). Byggs med `src/paper/bygg-raster-dag.py`. På en bred skärm är rastret lika brett som startbilden när den fyller skärmens höjd, men aldrig smalare än innehållet (32rem); utanför är det vitt papper. Liggande telefon behåller rastret i full bredd (Jonas 2026-11-09). På en hög skärm börjar rastret ändå där toppraden slutar (3,5rem), som på en telefon, i stället för längre ner (Jonas 2026-11-09).

## Mörkt läge (natten)
- Mörkt raster (bara natten): större svarta punkter över hela sidan under toppraden, tätast i botten.
- Toppraden (namn och hatt) ligger på rent vitt.

## Raster
- Punkterna är alltid helt svarta; ljusare yta = mindre punkter, aldrig grå punkter.
- Aldrig raster bakom text: listor och rutor har vit bakgrund.
- Rastret ligger på sidan och rullar med innehållet, inte fast i fönstret. Det täcker hela sidans höjd, minst en skärmhöjd. Beslutat av Jonas 2026-11-06.
- Din roll: akten är stängd med knappen "Visa min roll" längst ner. Öppnad visar bildrutan rollens bild med "Bara du får se det här." och "Du är maffia.", beskrivningen under och de andra i maffian som personrad. "Jag har sett min roll" stänger akten igen, och den går att öppna igen tills spelet startar. Ingen Dölj-knapp. Beslutat av Jonas 2026-11-06.
- Listor: berättarens ruta står ovanför listan och en lapp hänger över nedre högra kanten ("Tre av fem har röstat", "Tre av fem är klara", "Ni är överens", "En avstod"). Röstläget på dagen står i listan, ingen egen ruta för rösterna. Beslutat av Jonas 2026-11-06.
- Figuren i personraden är alltid svart som vanligt, även för den döda. I listor får de som är ute ett tuschkryss över figuren som slutar strax utanför cirkeln, och namnet står kvar i svart (Jonas 2026-11-08; förut blekta och överstrukna). Inte i domslutets lista. Beslutat av Jonas 2026-11-06.
- Den som är ute ur spelet ser nattbilden utan "… och så även du". Beslutat av Jonas 2026-11-06.
- Maffian vann: bildens utsnitt 50 % 15 %, så att hatten syns. Beslutat av Jonas 2026-11-06.
- Natten är svart, utan raster. Rubrik och hatt är vita. En yta får ram bara där den annars flyter ihop med det som ligger bakom: bildrutan får en 2 px vit ram (i stället för svart), figuren och rutan bredvid en 2 px vit kontur. Listan, frågan ovanför den och textrutor har ingen ram, så linjerna mellan raderna går ända ut och den vita ytan är lika stor som insidan var med ram. Den valda raden är svart utan kant. Lappen under listan ("Ni är överens", "Tre av fem är klara") ligger delvis på vitt och behåller sin svarta ram (Jonas 2026-11-06).
- Pratbubblor dyker alltid upp en stund efter resten (1,2 s), överallt (Jonas 2026-11-06).
- Detektivens öppna akt stängs med ett tryck var som helst på den, som den öppnas (Jonas 2026-11-06).
- Varje ny vy börjar överst. I Gå med och Nytt spel rullas sidan tillbaka överst när man lämnar ett fält. Inget fält får fokus av sig självt, och raden man skriver i får fetare ram (Jonas 2026-11-06).
- Luft mellan delar: alltid 16 px, räknat från det som sticker ut längst. Lappen under en lista (som "Ni är överens") och pratbubblan över en figur räknas in, så de aldrig hamnar på varandra. Beslutat av Jonas 2026-11-06.
- Avatarerna i listor är 48 px (Jonas 2026-11-06), i 56 px höga rader.
- Knappar längst ner: alltid i samma knappgrupp (bottom-actions), full bredd, 10 px mellan knapparna. Är det två knappar står den vanliga (vit) överst och huvudknappen (svart) underst, närmast tummen: Tillbaka / Gå med, Tillbaka / Skapa spelet, Stanna kvar / Lämna, Tillbaka till lobbyn / Spela igen. Undantag: startsidan, där "Gå med i spel" står överst eftersom de flesta går med. Beslutat av Jonas 2026-11-06.
- Rollen heter stadsbo (flera: stadsbor), inte medborgare. Beslutat av Jonas 2026-11-06.

Se även [bilder-och-prompter.md](bilder-och-prompter.md) för bildernas efterbehandling.

## Varianter utan egen skiss
- Staden vann: som "Slutet", rubrik "Staden vann", textruta "Maffian är besegrad.", bild "staden vinner", ljust raster.
- Rollkort för detektiv/läkare/stadsbo: som "Din roll", byt bild, "Du är …" och beskrivning; ingen kamratrad.

## Pratbubbla
- Serierutor är berättarens röst. Pratbubbla används bara när en person själv säger något.
- Handritad, lite ojämn form som sluter tätt om texten, smal svängd spets mot munnen. 2,2 px linje.
- Text: Comic Neue 700, 16 px, versaler, centrerad, gärna två rader. Repliker slutar med punkt (lugnt, noir). Utropstecken bara när personen verkligen utbrister något, som "Jag är oskyldig!". Frågor med frågetecken.
- Används i dag bara i "Din figur" ("Hur ska jag se ut?").
- Spetsen slutar 12 px från cirkelns kant och rör den aldrig.
- I en personrad sitter bubblan ovanför rutan, till höger om cirkeln, med spetsen mot ansiktet. Används i Natten (Erik: "Jag väljer Doris."), Din roll (Erik: "Vi gör det tillsammans.") och Domen (Anna, som var detektiv: "Jag är oskyldig!". En förvisad maffia får en egen replik, t.ex. "Ni kommer ångra er!"). Bubblans ritade överkant räknas som radens överkant för avståndet ovanför (16 px, se Avstånd).
- Pratbubblor dyker alltid upp med fördröjning: 1,2 s efter att vyn visas poppar de fram från spetsen (0,28 s, liten studs). Med reducerad rörelse tonar de bara in.

## Beteende att ändra i appen
- Morgonen: nedräkningen innan den mördades roll visas ("Rollen visas om 7 …") tas bort, i alla morgonvyer. Beslutat av Jonas 2026-11-04. Den mördades roll visas direkt i rutan, till exempel "Cissi var stadsbo." (den som mördas är aldrig maffia, så det finns inget att hålla hemligt). Den mördade själv ser bara "Du blev mördad i natt."
- Natten: ingen bekräfta-knapp för någon roll (maffia, detektiv, läkare och stadsbo). Ett tryck på en spelare är valet. Man kan trycka om och ändra sig så länge inte alla som ska välja har valt. Natten tar slut först när alla har valt och maffian har valt samma person. Fram till dess visar lappen under listan läget för maffian, t.ex. "Ni är överens" eller "Ni har valt olika".
- Lobbyn: samma fullbreddsruta under spelarlistan visar "Det behövs minst fyra för att börja." tills fyra har anslutit, sedan "I staden finns en maffia, en detektiv och två stadsbor." (eller vad inställningarna ger). Ingen separat grå hjälptext.

- Domen: den förvisades roll räknas ner i rutan bredvid personcirkeln, i samma typsnitt som avslöjandet: först "Rollen visas om fem …", sedan "Anna var detektiv." Nedräkningen till natten står i en fullbreddsruta längst ner: "Natten faller om fem …". Tal i nedräkningar skrivs med bokstäver.

- Lobbyn för spelarna: som värdens lobby, men med en bild i stället för QR-koden (rumskoden står kvar nere till höger), "värd" vid värdens namn, "Ändra figur" vid den egna raden och inga knappar. När fyra har anslutit står det också "Bertil startar när alla är på plats." Bilden lånas från Gå med tills en egen finns.

- Rollbild: en egen ruta under figurvalen i Ändra figur, 16 px under dem, med raden "Rollbild" med valen Slumpa (förvalt), Kvinna och Man. Valet sparas med figuren och styr vilken av rollbilderna (5–8 eller 5b–8b) som visas på den egna telefonen. Med Slumpa väljs bilden slumpvis varje spel. Slumpa är förvalt för en ny figur, och "Slumpa figur" ändrar inte rollbilden. Ingen fråga om kön när man går med.

- Ändra figur: "Slumpa figur" är en liten pillerknapp (44 px hög) till höger i figurraden, i linje med listans högerkant och med underkanten i linje med cirkelns underkant (22 px ovanför listan), under pratbubblan, så att den inte ligger nära Klar. Längst ner finns bara Klar.

- Lämna spelet, värden: samma ruta som för spelarna, med en förklarande rad i Archivo (15 px, 500) under rubriken: "Du är värd. Om du lämnar avslutas spelet för alla." Knapparna heter Stanna kvar och Avsluta för alla. (I appen i dag är det en vanlig webbläsarfråga, window.confirm.)

## Texter
- Serierutorna är en berättarröst som i ett seriealbum: korta meningar om vad som händer i staden, gärna med "…" som drar vidare. Undvik spelord som "spelare har anslutit", "ute ur spelet" och "spelet börjar". Säg "staden", inte "spelet".
- Instruktioner får finnas där spelaren måste göra något, men lindas gärna in i berättelsen ("Öppna sedan akten.").
- Alla nuvarande texter och varför de valdes: se `maffia/textforslag.md` i projektfilerna (alla elva förslag är införda, med "Cissi är borta." i stället för "Cissi är död.").

## Natten för andra roller, detektivens svar, ute ur spelet
- Natten ser likadan ut för alla roller: samma bild och "Staden sover … / … men inte du." (rollen nämns inte i bilden, så grannen inte kan läsa av den). Bara listans ruta skiljer: "Ni väljer vem som ska dö i natt." (maffia), "Du väljer vem du ska undersöka." (detektiv), "Du väljer vem du ska vaka över." (läkare), "I drömmen väljer du en misstänkt." (stadsbo). Under listan lappen "Tre av fem är klara" och en fullbreddsruta med en rad förklaring.
- Detektivens svar på morgonen: en akt under personraden, 80px hög. Stängd: svart ruta "Din undersökning ligger i akten. Tryck för att läsa." med en vit gummistämpel "HEMLIGT" (dubbel ram, Big Shoulders 900, lutad −9°, slitet tryck). Öppen: vit ruta med figur, namnet, "Natt 1 · Dölj" (Jonas 2026-11-07) och en lutad stämpel till höger: "INTE MAFFIA" på en rad som kontur, eller "MAFFIA" som helsvart stämpel med vit text.
- Ute ur spelet (dagen): personraden säger "Du blev mördad i natt.", listan visas utan val ("Staden röstar. Du kan bara se på."), ingen knapp, och längst ner "Du är borta nu. Se på, men säg inget." På natten: samma bild, ingen lista, bara rutan "Du är borta nu. Vänta tills staden vaknar."

- Ordval: den som röstas ut blir "förvisad" (Jonas 2026-11-06). "Domen: Anna blev förvisad." Morgonen: "Någon av er ljuger. Staden röstar om vem som ska förvisas." Samma ord ska användas i appen.

- Startsidan: bilden fyller skärmen (object-fit: cover), mitt i bilden. I en smal telefon skärs sidorna av. På större skärmar, som surfplattor och datorer, visas hela bilden, och resten av skärmen är svart. Bildens svarta över- och underkant smälter då ihop med det svarta runt om (Jonas 2026-11-06). Bilden sparas i full upplösning i appen.
- Startsidan har en mörk toning bakom loggan: svart i toppen, 90 % svart vid 35 %, helt genomskinlig vid 46 % av skärmens höjd (Jonas 2026-11-06).

- Startsidan: bilden fyller skärmen utan förskjutning (en uppflyttning på 24 px provades och valdes bort), och loggan ligger 36 px från toppen (Jonas 2026-11-06). Serierutan säger "Någon i staden säger inte sanningen." (två rader i mobil). Bilden kan komma att bytas.
- Rastret på dagen börjar på samma höjd som nattens (y 96 av 920, strax under bildrutans överkant), med punkter från 0,4 px radie upp till 1,2 px längst ner, och växer långsamt (exponent 2,6) så att det blir en mild ton. Mindre punkter än 0,4 px ritas grå av skärmen (Jonas 2026-11-06).

## Fyrkantigt och rundat
- Berättarens rutor är fyrkantiga: rutorna i bilden, frågan ovanför listan och texten i personraden. Listor och bildrutan är också fyrkantiga.
- När appen själv förklarar något för spelaren får rutan 10 px rundade hörn: regler och tips (rutan längst ner, rollens beskrivning, lobbyns "Det behövs minst fyra för att börja", rutan ovanför formuläret i Gå med och Nytt spel), väntan, nedräkningar, felmeddelanden och lappen under listan ("Tre av fem har röstat", "Ni är överens"). Knapparna är redan helt runda. I appen har förklaringarna klassen `explanation` (Jonas 2026-11-06).
- Berättarens fyrkantiga rutor är berättande, inte frågor eller uppmaningar. Berättaren talar till "du" ("… men inte du.", "Du väljer vem du ska undersöka."). Ute ur spelet på dagen: "Staden röstar utan dig." (Jonas 2026-11-06).
- Fullbreddsrutan under nattlistan förklarar vad valet gör: detektiven "Du får veta om personen är maffia. Svaret får du när staden vaknar.", läkaren "Du skyddar personen från maffian. Samma person får inte skyddas två nätter i rad.", stadsbon "Ditt val räknas inte, men alla väljer så att ingen ser vem som är vaken." (Jonas 2026-11-06).
- I Din figur och Inställningar visas inte spelarens namn i toppraden; rubriken får hela raden (Jonas 2026-11-06).
- Namn får vara högst 14 tecken (MAX_NAME_LENGTH). I toppraden står namnet på en rad och kortas av med …; rubriken bryts aldrig. I listor bryts ett långt namn på flera rader så att knappar och taggar stannar i raden (Jonas 2026-11-06).
- Liggande telefon (låg skärm, högst 32rem): bilden till vänster och står kvar, text, lista och knappar till höger. Vyer utan bild (Din figur, Inställningar) behåller en spalt. Appen kräver inte stående läge (WCAG 1.3.4) (2026-11-06).
- Startsidan: på en låg skärm (högst 32rem) göms berättarens ruta, så att loggan och knapparna får plats utan att man rullar (Jonas 2026-11-06).
- Startsidan och dess toning är helt svarta (#000, --start-black) som bildens kanter. Natten behåller --ink #111, som är vilsammare mot de vita ytorna och ger inget släp på OLED (Jonas 2026-11-06).
- Knapparna (bottom-actions) ligger i botten av skärmen nära tummen men sitter inte fast: är innehållet högre än skärmen trycks de ner. Byggt med .screen/.screen-content (Jonas 2026-11-06).
- Luften under knapparna längst ner är 16 px ovanför Safaris verktygsfält eller hemstrecket, på alla sidor inklusive startsidan. Använd alltid `--bottom-gap`, aldrig `env(safe-area-inset-bottom)` direkt. I Safari på stående iPhone är den bara den säkra marginalen (0 med verktygsfältet nertill), eftersom Safari själv lämnar cirka 17 px ovanför fältet (uppmätt med ?matt). Annars är den `max(1rem, env(safe-area-inset-bottom))`. Mät med ?matt i adressen innan något ändras.
- Under 100lvh (de sista 58 px bakom Safaris verktygsfält på iPhone 14) ritar Safari i iOS 26 inte sidan, utan fyller med en enda färg från html-elementets bakgrund. Rastret kan inte synas där. Färgen på randen bestäms av Jonas (2026-11-07). Mönstret och hur det testas står i CLAUDE.md (Jonas 2026-11-07).
- Din roll, innan akten öppnas: berättarens fyrkantiga ruta "Du ser till att ingen tittar över din axel innan du öppnar akten." (Jonas 2026-11-06).
- Domslutet: den förvisades pratbubbla "Jag är oskyldig!" visas först när rollen har visats, med bubblans vanliga fördröjning. Visas rollen aldrig (inställningen Avslöja rollen av) visas ingen bubbla. Platsen för bubblan hålls när rollen ska visas, så att sidan inte hoppar (Jonas 2026-11-06).

- Morgonen när ingen blev mördad: nyheten och omröstningen står i en enda ruta ("Någon vakade över staden i natt. Men maffian finns kvar, och staden röstar om vem som ska förvisas."), så att två berättande rutor inte står efter varandra. Den som är ute ser fortfarande nyheten för sig, ovanför "Staden röstar utan dig."

- Pratbubblor kommer 0,6 s efter att de ritats (förut 1,2 s).
- Personraden (stor figur med textruta) kommer 1 s efter resten av vyn. En bubbla som hör till den räknar sina 0,6 s från att figuren visats. En bubbla som kommer senare (domslutet) har bara sina 0,6 s.
- Den förvisade säger "Jag är oskyldig!", men maffian säger "Ni kommer ångra er!". Båda bara när rollen visas.
- Listorna med personer står i bokstavsordning (lobbyn, natten, dagen, slutet inom maffian och staden). Domslutets lista står efter antal röster.
- Knapparna ligger i botten bara på pekskärmar (pointer: coarse). Med mus står de direkt under innehållet. Startsidan är som förut.
- Gå med: "Skriv kod från värden och ditt namn." Domslut: "Spelet fortsätter om …".

- Startsidans textruta är högst 13,5rem bred, så att "inte sanningen." står på andra raden i mobilen.

- Slutsidan: vinnarna får stämpeln "Vinnare" framför rollen i listan, samma stämpel som detektivens "Inte maffia" (och taxichaufförens och fönstertittarens). Hela vinnarlaget stämplas, även de döda. Stämplarna står i en rak kolumn (Jonas 2026-11-07).
- Stämplarna (Vinnare, Inte maffia) lutar 4° åt vänster och höger varannan gång, som riktiga handstämplar. Maffia-stämpeln behåller sin lutning (Jonas 2026-11-07).
- Taxichaufförens och fönstertittarens svar ("Besökte:", "Besökt av:" och namnen) är inga stämplar utan maskinskriven text i Courier Prime 700, rak och utan ram, i en kolumn 9rem bred längst till höger i raden. Ingen har stämplar för alla namn (Jonas 2026-11-09). Raden under namnet ("Natt 2 · Dölj") står kvar i vanlig text: på maskin blev den sämre (Jonas 2026-11-09).
- Svart ruta med rundade hörn (`notice`): när du själv inte kan gå vidare och behöver veta varför, till exempel fel kod, för många roller eller tappad anslutning. "Det behövs minst fyra för att börja" är svart hos värden, vars Starta-knapp är spärrad, och vit hos de andra. Att vänta på andra (röster, roller, nedräkningar) är vita rutor (Jonas 2026-11-07).
- Slutsidan: listan är byggd som akten, med rollen i grått under namnet och stämpeln "Vinnare" längst till höger (Jonas 2026-11-08).
- Krysset över den som är ute syns också i akten (detektiv, taxichaufför, fönstertittare) och på en död maffiakamrat på natten, som då står kvar med "Erik var med dig." (Jonas 2026-11-08).
