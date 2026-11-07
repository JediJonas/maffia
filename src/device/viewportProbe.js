// @ts-check
// Mätruta för knapparna längst ner i mobilen. Öppna sidan med ?matt i
// adressen, så visas en ruta överst med visningsytans mått, säkra marginaler
// och var sista knappen slutar. En röd linje markerar visningsytans nederkant.
// Används för att mäta på en riktig iPhone, eftersom Chromium inte har
// Safaris verktygsfält (se CLAUDE.md, "Mobillayout i Safari").

const PROBE_PARAM = 'matt';
const UPDATE_DELAY_MS = 300;

/** @param {string} css */
function measureHeight(css) {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;visibility:hidden;width:1px;height:${css};`;
  document.body.append(el);
  const height = el.getBoundingClientRect().height;
  el.remove();
  return Math.round(height);
}

/** @param {string} side */
function measureSafeArea(side) {
  return measureHeight(`env(safe-area-inset-${side})`);
}

/** @param {string} query */
function matches(query) {
  return window.matchMedia(query).matches ? 'ja' : 'nej';
}

function lastButtonBottom() {
  const buttons = document.querySelectorAll('#root button');
  const last = buttons[buttons.length - 1];
  return last ? Math.round(last.getBoundingClientRect().bottom) : '-';
}

function bottomGap() {
  const holder = document.querySelector('.start-content') ?? document.querySelector('main');
  return holder ? getComputedStyle(holder).paddingBottom : '-';
}

function readings() {
  const viewport = window.visualViewport;
  return [
    `screen ${screen.width}×${screen.height}`,
    `innerHeight ${window.innerHeight}`,
    `visualViewport ${viewport ? Math.round(viewport.height) : '-'}`,
    `clientHeight ${document.documentElement.clientHeight}`,
    `vh ${measureHeight('100vh')} svh ${measureHeight('100svh')} dvh ${measureHeight('100dvh')} lvh ${measureHeight('100lvh')}`,
    `safe topp ${measureSafeArea('top')} botten ${measureSafeArea('bottom')}`,
    `browser ${matches('(display-mode: browser)')} standalone ${matches('(display-mode: standalone)')}`,
    `coarse ${matches('(pointer: coarse)')} stående ${matches('(orientation: portrait)')}`,
    `bottom-gap ${bottomGap()}`,
    `sista knappen slutar ${lastButtonBottom()}`,
  ];
}

/** Visar mätrutan om adressen innehåller ?matt. */
export function showViewportProbeIfAsked() {
  if (!new URLSearchParams(location.search).has(PROBE_PARAM)) return;

  const box = document.createElement('pre');
  box.style.cssText = 'position:fixed;z-index:999;top:env(safe-area-inset-top);left:4px;right:4px;margin:0;padding:6px;'
    + 'background:#ffeb3b;color:#000;font:12px/1.35 monospace;white-space:pre-wrap;pointer-events:none;';
  const line = document.createElement('div');
  line.style.cssText = 'position:fixed;z-index:999;left:0;right:0;bottom:0;height:2px;background:red;pointer-events:none;';
  document.body.append(box, line);

  const update = () => {
    box.textContent = readings().join('\n');
  };
  const later = () => window.setTimeout(update, UPDATE_DELAY_MS);
  window.addEventListener('resize', later);
  window.visualViewport?.addEventListener('resize', later);
  window.addEventListener('scroll', later, { passive: true });
  document.addEventListener('click', later);
  later();
}
