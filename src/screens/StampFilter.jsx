// @ts-check

/**
 * Ojämn färg i stämplarna, som när en stämpel inte tar överallt. Ritas en
 * gång i varje vy som har stämplar, eftersom klassen .stamp pekar på dess id.
 */
export function StampFilter() {
  return (
    <svg width="0" height="0" className="stamp-filter" aria-hidden="true">
      <filter id="stamp-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 7" />
        <feComposite in="SourceGraphic" operator="in" />
      </filter>
    </svg>
  );
}
