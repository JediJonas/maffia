# Regler för maffia

Maffia (även kallat Varulv) skapades av Dmitrij Davidov i Moskva 1986. Det finns
många varianter. Här är de klassiska reglerna och hur prototypen tolkar dem.

## Lagen

- **Maffian** vet vilka som är med i maffian. Den vinner när den är minst lika
  många som alla andra tillsammans.
- **Staden** är alla andra. Den vinner när all maffia är borta.

## Rollerna

| Roll | Lag | Gör |
| --- | --- | --- |
| Maffia | Maffian | Väljer tillsammans ett offer varje natt. |
| Detektiv | Staden | Undersöker en spelare varje natt och får veta om den är maffia. |
| Läkare | Staden | Skyddar en spelare varje natt. Blir den spelaren maffians offer överlever den. |
| Stadsbo | Staden | Ingen nattroll. Diskuterar och röstar på dagen. |

Antal maffia är en per fyra spelare, avrundat nedåt men minst en. Detektiv och
läkare finns alltid en av vardera. Resten är stadsbor. Spelet kräver minst
fyra spelare.

## Gången i spelet

1. **Roller delas ut** i hemlighet. Var och en tittar på sin egen telefon.
2. **Natt.** Alla tittar i telefonen samtidigt och väljer en spelare.
   Maffian väljer offer och måste vara överens. Detektiven väljer vem som ska
   undersökas, läkaren vem som ska skyddas. Stadsborna väljer vem de
   misstänker, men det valet används inte. Det finns bara för att alla ska
   göra likadant, så att ingen avslöjar sig genom att sitta still (projektets
   "blindknapp"). Ett tryck är valet, och man kan trycka om och ändra sig.
   Natten tar slut när alla har valt och maffian har valt samma person.
3. **Dag.** Berättaren säger vem som blev mördad och vilken roll den hade,
   eller att ingen blev mördad. Alla diskuterar och röstar öppet. Den som får
   flest röster blir förvisad ur staden och rollen visas efter en kort
   nedräkning. Vid lika, eller om lika många eller fler valde att avstå, blir
   ingen förvisad.
4. Natt och dag växlar tills ett lag har vunnit.

Den som är ute ur spelet får inte prata eller rösta.

## Ord vi använder

Appen, berättarrösten och dokumentationen använder samma ord:

- **Mördad.** Den som maffian dödar på natten "blev mördad av maffian", till
  exempel "Anna blev mördad av maffian". Om läkaren räddade offret står det
  "Ingen blev mördad".
- **Förvisad.** Den som staden röstar bort på dagen "blev förvisad ur staden",
  till exempel "Du blev förvisad ur staden". Om ingen fick flest röster står det
  "Ingen blev förvisad". Själva omröstningen heter fortfarande att rösta.
- **Kort och långt.** Den stora rubriken vid avataren är kort, "Anna blev
  mördad" och "Anna blev förvisad", och så säger även berättarrösten.
  Berättartexten i rutan överst säger hela meningen, "Anna blev mördad av
  maffian" och "Anna blev förvisad ur staden".
- **Ute ur spelet.** Både den som blev mördad och den som blev förvisad är ute
  ur spelet. Det är vad skärmen säger till den spelaren, inte "död".

Skriv inte "dog", "åkte ut" eller "röstades ut" i nya texter.

## Berättarrösten

Värdens telefon läser upp berättaren. Rösten läser inte rutan överst ord för
ord, utan en kortare och lite annorlunda variant av den, så att det inte blir
samma text två gånger. Rösten säger det viktigaste, och resten står kvar på
skärmen. Till exempel:

| Rutan överst | Rösten |
|---|---|
| Spelet börjar. Titta på din roll i hemlighet och tryck sedan på klar. | Spelet börjar. Titta på din roll. |
| Natten faller. Alla tittar i sin telefon och gör sitt val. | Natten faller. Gör ditt val. |
| Staden vaknar. Anna blev mördad av maffian. Diskutera och rösta om vem som ska förvisas. | Staden vaknar. Anna blev mördad. |
| Alla har röstat. Anna blev förvisad ur staden. | Alla har röstat. Anna blev förvisad. |
| Spelet är slut. Maffian har tagit över staden. | Spelet är slut. Maffian har vunnit. |
| Spelet är slut. Staden har besegrat maffian. | Spelet är slut. Staden har vunnit. |

Efter domslutets nedräkning säger rösten rollen, till exempel "Anna var läkare". Den
säger bara det som alla får veta, och samma ord som i listan ovan. Texterna
finns i `src/game/narration.js`: rutan i `narratePhaseChange` och rösten i
`narrateAloud`.

## Val som prototypen har gjort

Klassiska regler skiljer sig mellan grupper. Det här är prototypens val, och
alla går att ändra i `src/game/rules.js`:

- Döda spelares roller visas för alla.
- Läkaren får skydda sig själv, men inte samma spelare två nätter i rad.
- Maffian kan inte välja en annan maffia som offer.
- På natten finns ingen bekräfta-knapp. Ett tryck på en spelare är valet,
  och man kan ändra sig tills alla har valt och maffian har valt samma person.
- På morgonen visas den mördades roll direkt, utan nedräkning. Maffian kan
  inte mörda sina egna, så det finns inget att hålla hemligt.
- Avgör nattens mord spelet visas morgonen ändå. Några sekunder senare kommer
  "Spelet är slut" av sig självt. Röster som läggs under en sådan morgon
  räknas inte.
- Omröstningen avgörs när alla levande har röstat, och man kan ändra sin röst
  fram till dess. Alla ser hela tiden vem som har röstat på vem.
- Efter omröstningen visas ett domslut. Först syns bara vem som blev förvisad, och
  rollen visas efter samma nedräkning. Sedan räknar "Spelet fortsätter om …"
  ned i tio sekunder till, så att alla hinner se rösterna, och det blir natt
  eller slut av sig självt. Texten är densamma även när spelet är avgjort, så
  att ingen ser resultatet i förväg.
- Spelet väntar på frånkopplade spelare, eftersom deras val behövs.
- Botar (datorstyrda spelare) läggs till under Inställningar och står med
  "(bot)" efter namnet. Det får vara högst tre, eftersom botar inte kan prata. De tänker en till fyra sekunder innan de gör något.
  På natten väljer de slumpvis, men en maffiabot följer den övriga maffian.
  På dagen röstar de sist, när alla människor har röstat, och följer den som
  har flest röster. En maffiabot röstar aldrig på sin egen maffia, och en
  detektivbot röstar på maffia som den har hittat.
