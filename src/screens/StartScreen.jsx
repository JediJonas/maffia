// @ts-check
import { useState } from 'react';
import { MAX_NAME_LENGTH } from '../game/rules.js';
import { normalizeRoomCode } from '../network/roomCode.js';

/**
 * @param {object} props
 * @param {string | null} props.initialRoomCode Från QR-koden, om spelaren skannade en.
 * @param {string | null} props.message Till exempel varför man blev nekad.
 * @param {(name: string) => void} props.onCreate
 * @param {(roomCode: string, name: string) => void} props.onJoin
 */
export function StartScreen({ initialRoomCode, message, onCreate, onJoin }) {
  const [name, setName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode ?? '');
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const trimmedName = name.trim();

  /** @param {import('react').FormEvent} event */
  function join(event) {
    event.preventDefault();
    const roomCode = normalizeRoomCode(roomCodeInput);
    if (!trimmedName) setError('Skriv ditt namn först.');
    else if (!roomCode) setError('Rumskoden är fyra bokstäver.');
    else onJoin(roomCode, trimmedName);
  }

  function create() {
    if (!trimmedName) setError('Skriv ditt namn först.');
    else onCreate(trimmedName);
  }

  return (
    <main>
      <h1>Maffia</h1>
      {message && <p className="notice" role="alert">{message}</p>}
      <form onSubmit={join} className="start-form">
        <label htmlFor="name">Ditt namn</label>
        <input
          id="name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          onChange={(event) => setName(event.target.value)}
        />
        <label htmlFor="room-code">Rumskod</label>
        <input
          id="room-code"
          value={roomCodeInput}
          autoCapitalize="characters"
          autoComplete="off"
          inputMode="text"
          onChange={(event) => setRoomCodeInput(event.target.value)}
        />
        {error && <p className="notice" role="alert">{error}</p>}
        <button type="submit" className="primary">Gå med i rummet</button>
      </form>
      {!initialRoomCode && (
        <>
          <p className="divider">eller</p>
          <button type="button" className="secondary" onClick={create}>Skapa ett nytt rum</button>
          <p className="muted">Den som skapar rummet är värd och spelar samtidigt. Håll värdens telefon igång under spelet.</p>
        </>
      )}
    </main>
  );
}
