# Maffia

Ett sällskapsspel som spelas i telefonen. En av telefonerna är värd och spelar
samtidigt. Inga servrar behövs utöver PeerJS för att telefonerna ska hitta
varandra; därefter går all trafik direkt mellan telefonerna.

Reglerna finns i [docs/regler.md](docs/regler.md).

Spela på <https://jedijonas.github.io/maffia/>. Sidan publiceras på nytt
varje gång något hamnar i main.

## Så fungerar det

- **Stjärntopologi.** Värdens telefon äger hela spelets tillstånd. De andra
  telefonerna skickar bara handlingar, som `{ type: 'vote', targetId }`, och
  får tillbaka en vy med just det de får veta (`src/game/playerView.js`).
  Rollerna skickas aldrig till alla.
- **Anslutning** med en rumskod på fyra bokstäver eller en QR-kod.
- **Återanslutning.** Varje telefon sparar en hemlig nyckel. Laddas sidan om
  ansluter den igen och får tillbaka sin plats. Värden sparar hela spelet i
  telefonen och kan också ladda om.
- **Värdens skärm** hålls tänd med Wake Lock API.
- **Fasbyten** syns genom att skärmen blir mörk på natten och ljus på dagen,
  med en berättartext, och telefonerna vibrerar (inte på iPhone).
- **Berättarröst.** Värdens telefon läser upp vem som dog eller röstades ut,
  och rollen när nedräkningen är slut, med webbläsarens talsyntes. Bara
  värden talar, och bara om sådant som alla får veta. Stängs av med
  "Röst på/av" uppe till höger. Lägg till `?debug=1` i adressen för en
  felsökningslogg i telefonen.

## Mappar

- `src/game/` spelregler som rena funktioner, med tester
- `src/network/` PeerJS för värd och spelare
- `src/host/` och `src/player/` React-hookar som kopplar ihop regler och nätverk
- `src/screens/` vyerna
- `src/device/` telefonens funktioner: skärmlås, vibration, talsyntes och sparad session

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
