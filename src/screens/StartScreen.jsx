// @ts-check
import { useState } from 'react';
import { MAX_NAME_LENGTH } from '../game/rules.js';
import { normalizeRoomCode } from '../network/roomCode.js';
import { loadSavedName, saveName } from '../device/savedSession.js';

/**
 * Först två val, gå med eller skapa. Den som har skannat en QR-kod hamnar
 * direkt i "gå med" med rumskoden ifylld.
 * @param {object} props
 * @param {string | null} props.initialRoomCode Från QR-koden, om spelaren skannade en.
 * @param {string | null} props.message Till exempel varför man blev nekad.
 * @param {(name: string) => void} props.onCreate
 * @param {(roomCode: string, name: string) => void} props.onJoin
 */
export function StartScreen({ initialRoomCode, message, onCreate, onJoin }) {
  const [mode, setMode] = useState(/** @type {'choose' | 'join' | 'create'} */ (initialRoomCode ? 'join' : 'choose'));

  return (
    <main>
      <h1>Maffia</h1>
      {message && <p className="notice" role="alert">{message}</p>}
      {mode === 'choose' && (
        <>
          <button type="button" className="primary" onClick={() => setMode('join')}>Gå med i spel</button>
          <button type="button" className="secondary" onClick={() => setMode('create')}>Skapa nytt spel</button>
        </>
      )}
      {mode === 'join' && (
        <JoinForm initialRoomCode={initialRoomCode} onJoin={onJoin} onBack={() => setMode('choose')} />
      )}
      {mode === 'create' && <CreateForm onCreate={onCreate} onBack={() => setMode('choose')} />}
    </main>
  );
}

/**
 * @param {object} props
 * @param {string | null} props.initialRoomCode
 * @param {(roomCode: string, name: string) => void} props.onJoin
 * @param {() => void} props.onBack
 */
function JoinForm({ initialRoomCode, onJoin, onBack }) {
  const [name, setName] = useState(loadSavedName);
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode ?? '');
  const [error, setError] = useState(/** @type {string | null} */ (null));

  /** @param {import('react').FormEvent} event */
  function submit(event) {
    event.preventDefault();
    const roomCode = normalizeRoomCode(roomCodeInput);
    if (!name.trim()) setError('Skriv ditt namn först.');
    else if (!roomCode) setError('Rumskoden är fyra bokstäver.');
    else {
      saveName(name.trim());
      onJoin(roomCode, name.trim());
    }
  }

  return (
    <form onSubmit={submit} className="start-form">
      <h2>Gå med i spel</h2>
      <label htmlFor="room-code">Rumskod</label>
      <input
        id="room-code"
        value={roomCodeInput}
        autoCapitalize="characters"
        autoComplete="off"
        onChange={(event) => setRoomCodeInput(event.target.value)}
      />
      <NameField value={name} onChange={setName} autoFocus={Boolean(initialRoomCode)} />
      {error && <p className="notice" role="alert">{error}</p>}
      <button type="submit" className="primary">Gå med</button>
      <button type="button" className="link-button" onClick={onBack}>Tillbaka</button>
    </form>
  );
}

/**
 * @param {{ onCreate: (name: string) => void, onBack: () => void }} props
 */
function CreateForm({ onCreate, onBack }) {
  const [name, setName] = useState(loadSavedName);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  /** @param {import('react').FormEvent} event */
  function submit(event) {
    event.preventDefault();
    if (!name.trim()) setError('Skriv ditt namn först.');
    else {
      saveName(name.trim());
      onCreate(name.trim());
    }
  }

  return (
    <form onSubmit={submit} className="start-form">
      <h2>Skapa nytt spel</h2>
      <NameField value={name} onChange={setName} autoFocus />
      {error && <p className="notice" role="alert">{error}</p>}
      <p className="muted">Du blir värd och spelar samtidigt. Inställningarna väljer du i lobbyn, när du ser hur många som är med. Håll din telefon igång under spelet.</p>
      <button type="submit" className="primary">Skapa spelet</button>
      <button type="button" className="link-button" onClick={onBack}>Tillbaka</button>
    </form>
  );
}

/**
 * @param {{ value: string, onChange: (name: string) => void, autoFocus?: boolean }} props
 */
function NameField({ value, onChange, autoFocus }) {
  return (
    <>
      <label htmlFor="name">Ditt namn</label>
      <input
        id="name"
        value={value}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        // Namnet är det enda som återstår på sidan, så fokus kan ligga där direkt.
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    </>
  );
}
