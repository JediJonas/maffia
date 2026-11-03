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
| Medborgare | Staden | Ingen nattroll. Diskuterar och röstar på dagen. |

Antal maffia är en per fyra spelare, avrundat nedåt men minst en. Detektiv och
läkare finns alltid en av vardera. Resten är medborgare. Spelet kräver minst
fyra spelare.

## Gången i spelet

1. **Roller delas ut** i hemlighet. Var och en tittar på sin egen telefon.
2. **Natt.** Alla tittar i telefonen samtidigt och väljer en spelare.
   Maffian väljer offer och måste vara överens. Detektiven väljer vem som ska
   undersökas, läkaren vem som ska skyddas. Medborgarna väljer vem de
   misstänker, men det valet används inte. Det finns bara för att alla ska
   göra likadant, så att ingen avslöjar sig genom att sitta still (projektets
   "blindknapp").
3. **Dag.** Berättaren säger vem som blev mördad och vilken roll den hade,
   eller att ingen blev mördad. Alla diskuterar och röstar öppet. Den som får
   flest röster blir utvisad ur staden och rollen visas. Vid lika, eller om
   lika många eller fler valde att avstå, blir ingen utvisad.
4. Natt och dag växlar tills ett lag har vunnit.

Den som är ute ur spelet får inte prata eller rösta.

## Ord vi använder

Appen, berättarrösten och dokumentationen använder samma ord:

- **Mördad.** Den som maffian dödar på natten "blev mördad av maffian", till
  exempel "Anna blev mördad av maffian". Om läkaren räddade offret står det
  "Ingen blev mördad".
- **Utvisad.** Den som staden röstar bort på dagen "blev utvisad ur staden",
  till exempel "Du blev utvisad ur staden". Om ingen fick flest röster står det
  "Ingen blev utvisad". Själva omröstningen heter fortfarande att rösta.
- **Kort och långt.** Den stora rubriken vid avataren är kort, "Anna blev
  mördad" och "Anna blev utvisad". Berättartexten i rutan överst och rösten
  säger hela meningen, "Anna blev mördad av maffian" och "Anna blev utvisad ur
  staden".
- **Ute ur spelet.** Både den som blev mördad och den som blev utvisad är ute
  ur spelet. Det är vad skärmen säger till den spelaren, inte "död".

Skriv inte "dog", "åkte ut" eller "röstades ut" i nya texter.

## Val som prototypen har gjort

Klassiska regler skiljer sig mellan grupper. Det här är prototypens val, och
alla går att ändra i `src/game/rules.js`:

- Döda spelares roller visas för alla.
- Läkaren får skydda sig själv, men inte samma spelare två nätter i rad.
- Maffian kan inte välja en annan maffia som offer.
- På morgonen syns först bara vem som blev mördad i natt. Efter en nedräkning på tio
  sekunder visas rollen för alla samtidigt. Omröstningen är öppen hela tiden.
  Blev ingen mördad finns inget att räkna ned till.
- Avgör nattens mord spelet visas morgonen ändå, med nedräkningen. Några
  sekunder efter att rollen har visats kommer "Spelet är slut" av sig självt.
  Röster som läggs under en sådan morgon räknas inte.
- Omröstningen avgörs när alla levande har röstat, och man kan ändra sin röst
  fram till dess. Alla ser hela tiden vem som har röstat på vem.
- Efter omröstningen visas ett domslut. Först syns bara vem som blev utvisad, och
  rollen visas efter samma nedräkning. Sedan räknar "Spelet fortsätter om …"
  ned i tio sekunder till, så att alla hinner se rösterna, och det blir natt
  eller slut av sig självt. Texten är densamma även när spelet är avgjort, så
  att ingen ser resultatet i förväg.
- Spelet väntar på frånkopplade spelare, eftersom deras val behövs.
