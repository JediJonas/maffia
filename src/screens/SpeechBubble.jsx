// @ts-check

/**
 * Pratbubblan bredvid en figur, ritad som i en serieruta. Bubblan står
 * snett ovanför figuren, så den placeras av den som använder den.
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function SpeechBubble({ className = '', children }) {
  return (
    <p className={`speech-bubble ${className}`.trim()}>
      <svg viewBox="0 0 180 100" aria-hidden="true">
        <path
          transform="translate(14 4)"
          d="M18 9 C44 0, 110 -1, 136 8 C154 15, 157 47, 138 57 C114 66, 70 67, 46 64 C38 72, 22 82, 2 90 C16 78, 24 70, 28 61 C6 55, -3 20, 18 9 Z"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}
