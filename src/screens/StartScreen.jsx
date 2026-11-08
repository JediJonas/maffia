// @ts-check
import { useState } from 'react';
import { MAX_NAME_LENGTH } from '../game/rules.js';
import { normalizeRoomCode } from '../network/roomCode.js';
import { loadSavedName, saveName } from '../device/savedSession.js';
import { ScenePanel } from '../scenes/ScenePanel.jsx';
import startImage from '../scenes/images/start.webp';
import { scrollToTopWhenDoneTyping, useScrollToTop } from './scrollToTop.js';
import { changeViewSmoothly } from './viewTransition.js';

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
  useScrollToTop(mode);
  /** @param {'choose' | 'join' | 'create'} next */
  const showMode = (next) => changeViewSmoothly('fade', () => setMode(next));

  if (mode === 'join') return <JoinForm initialRoomCode={initialRoomCode} message={message} onJoin={onJoin} onBack={() => showMode('choose')} />;
  if (mode === 'create') return <CreateForm onCreate={onCreate} onBack={() => showMode('choose')} />;
  return (
    <main className="start-page">
      <img className="start-image" src={startImage} alt="" />
      <div className="start-content">
        <hgroup className="start-logo">
          <h1>Maffia</h1>
          <p>Ett spel om lögner</p>
        </hgroup>
        {message && <p className="notice" role="alert">{message}</p>}
        <p className="caption start-caption">Någon i staden säger inte sanningen.</p>
        <div className="bottom-actions">
          <button type="button" className="primary" onClick={() => showMode('join')}>Gå med i spel</button>
          <button type="button" className="secondary" onClick={() => showMode('create')}>Starta nytt spel</button>
        </div>
      </div>
    </main>
  );
}

/**
 * @param {object} props
 * @param {string | null} props.initialRoomCode
 * @param {string | null} props.message
 * @param {(roomCode: string, name: string) => void} props.onJoin
 * @param {() => void} props.onBack
 */
function JoinForm({ initialRoomCode, message, onJoin, onBack }) {
  const [name, setName] = useState(loadSavedName);
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode ?? '');
  const [error, setError] = useState(/** @type {string | null} */ (null));

  /** @param {import('react').FormEvent} event */
  function submit(event) {
    event.preventDefault();
    const roomCode = normalizeRoomCode(roomCodeInput);
    if (!roomCode) setError('Koden är fyra bokstäver.');
    else if (!name.trim()) setError('Skriv ditt namn först.');
    else {
      saveName(name.trim());
      onJoin(roomCode, name.trim());
    }
  }

  return (
    <FormPage title="Gå med" image="join" topCaption="Någon väntar på dig …">
      <form onSubmit={submit} className="form-page screen">
        <div className="screen-content">
          <p className="explanation">Skriv kod från värden och ditt namn.</p>
          <div className="form-table">
            <label className="form-row">
              <span>Kod</span>
              <input
                id="room-code"
                value={roomCodeInput}
                autoCapitalize="characters"
                autoComplete="off"
                onChange={(event) => setRoomCodeInput(event.target.value)}
                onBlur={scrollToTopWhenDoneTyping}
              />
            </label>
            <NameRow value={name} onChange={setName} />
          </div>
          {(error ?? message) && <p className="notice" role="alert">{error ?? message}</p>}
        </div>
        <div className="bottom-actions">
          <button type="button" className="secondary" onClick={onBack}>Tillbaka</button>
          <button type="submit" className="primary">Gå med</button>
        </div>
      </form>
    </FormPage>
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
    <FormPage title="Nytt spel" image="create" topCaption="Du samlar gänget.">
      <form onSubmit={submit} className="form-page screen">
        <div className="screen-content">
          <p className="explanation">Du håller i trådarna, men spelar som alla andra. Inställningarna väljer du i lobbyn.</p>
          <div className="form-table">
            <NameRow value={name} onChange={setName} />
          </div>
          {error && <p className="notice" role="alert">{error}</p>}
        </div>
        <div className="bottom-actions">
          <button type="button" className="secondary" onClick={onBack}>Tillbaka</button>
          <button type="submit" className="primary">Skapa spelet</button>
        </div>
      </form>
    </FormPage>
  );
}

/**
 * Rubrik och bildruta, som i spelets vyer.
 * @param {object} props
 * @param {string} props.title
 * @param {import('../scenes/sceneImages.js').SceneImageKey} props.image
 * @param {string} props.topCaption
 * @param {import('react').ReactNode} props.children
 */
function FormPage({ title, image, topCaption, children }) {
  return (
    <>
      <header className="top-bar">
        <h1>{title}</h1>
      </header>
      <main>
        <ScenePanel scene={{ image, topCaption, bottomCaption: null, showsRoomCode: false }} roomCode={null} />
        {children}
      </main>
    </>
  );
}

/**
 * Inget fält får fokus av sig självt, så att tangentbordet inte täcker
 * bilden innan man har sett sidan.
 * @param {{ value: string, onChange: (name: string) => void }} props
 */
function NameRow({ value, onChange }) {
  return (
    <label className="form-row">
      <span>Ditt namn</span>
      <input
        id="name"
        value={value}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        onChange={(event) => onChange(event.target.value)}
        onBlur={scrollToTopWhenDoneTyping}
      />
    </label>
  );
}
