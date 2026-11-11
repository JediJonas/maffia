# Maffia

Ett sällskapsspel som spelas i telefonen. En av telefonerna är värd och spelar
samtidigt. Inga servrar behövs utöver PeerJS för att telefonerna ska hitta
varandra; därefter går all trafik direkt mellan telefonerna.

Reglerna finns i [docs/regler.md](docs/regler.md). Designreglerna finns i
[docs/designregler.md](docs/designregler.md).

Spela på <https://jedijonas.github.io/maffia/>. Sidan publiceras på nytt
varje gång något hamnar i main.

## Så fungerar det

- **Stjärntopologi.** Värdens telefon äger hela spelets tillstånd. De andra
  telefonerna skickar bara handlingar, som `{ type: 'vote', targetId }`, och
  får tillbaka en vy med just det de får veta (`src/game/playerView.js`).
  Rollerna skickas aldrig till alla.
- **Anslutning** med en rumskod på fyra bokstäver eller en QR-kod. Den som
  lämnar spelet får först bekräfta det, och värden får veta att spelet då
  tar slut för alla.
- **Återanslutning.** Varje telefon sparar en hemlig nyckel. Laddas sidan om
  ansluter den igen och får tillbaka sin plats. Värden sparar hela spelet i
  telefonen och kan också ladda om.
- **Värdens skärm** hålls tänd med Wake Lock API.
- **Fasbyten** syns genom rastret bakom sidan: små punkter långt ner på
  dagen, stora och täta på natten. En berättartext säger vad som hänt, och
  telefonerna vibrerar (inte på iPhone).
- **Utseendet** är en noirserie i svart och vitt: Archivo för appens text,
  Big Shoulders Display för rubriker och Comic Neue för berättarens
  serierutor. Typsnitten följer med appen. Förlagan är canvasen "Maffia noir".
- **Botar.** Värden kan lägga till datorstyrda spelare under Inställningar,
  högst tre, till exempel för att nå fyra spelare. Botarna körs i värdens telefon med
  samma regler som alla andra (`src/game/bots.js`, `src/host/useBots.js`)
  och står med "(bot)" efter namnet i listorna.
- **Avatarer.** Svartvita, som stilen är ritad. Varje telefon slumpar en
  avatar som sparas till nästa spel, och i lobbyn kan man ändra den del för
  del. Bara valen skickas, som `{ hair: 'variant12', ... }`, och värden
  kontrollerar dem. Varje telefon ritar bilderna själv.

## Mappar

- `public/favicon.svg`, `public/icons/`, `public/manifest.webmanifest`:
  ikonerna. Faviconen är ett vitt M i loggans typsnitt (Big Shoulders
  Display 900, ritat som en bana) på en svart rundad ruta. PNG-filerna är
  utsnitt ur maffians rollbild (`src/scenes/images/roll-maffia.webp`), där
  allt runt honom, röken och regnet, är målat svart, i gråskala med 32 nyanser: `apple-touch-icon.png` (180 px) för hemskärmen i
  iPhone och iPad, och 192 och 512 px för Android, med en tjock svart ram som följer rundade hörn, och en maskbar 512 px med ett
  vidare utsnitt, så att ansiktet ryms i Androids säkra cirkel. Byts
  rollbilden behöver PNG-filerna göras om.
- `src/game/` spelregler som rena funktioner, med tester
- `src/network/` PeerJS för värd och spelare
- `src/host/` och `src/player/` React-hookar som kopplar ihop regler och nätverk
- `src/screens/` vyerna
- `src/scenes/` bildrutan överst: bilderna och vad rutan visar i varje fas
- `src/device/` telefonens funktioner: skärmlås, vibration och sparad session
- `src/avatar/` avatarens delar och hur den ritas

## Kom igång

```sh
npm install
npm run dev     # öppnar https://localhost:5173 och adressen på nätverket
npm run check   # lint, typkontroll, tester och bygge
```

Utvecklingsservern använder ett självsignerat certifikat, eftersom Wake Lock
kräver https. Godkänn varningen i telefonen första gången.

Utan inställningar används PeerJS publika server. Till en egen server:

```sh
npx peerjs --port 9000
VITE_PEER_HOST=localhost VITE_PEER_PORT=9000 VITE_PEER_SECURE=false npm run dev
```

## Licenser

Avatarerna ritas med [DiceBear](https://www.dicebear.com/) (MIT) och stilen
[Lorelei](https://www.figma.com/community/file/1198749693280469639) av
Lisa Wischofsky, som är fri att använda under CC0 1.0.
