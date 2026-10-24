import React from 'react';

export const PIECE_SVGS: Record<string, (colorClass?: string) => React.ReactNode> = {
  P: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  N: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <path
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <path
        d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.932 1.28-2 2-3.5 1.5-6.5-.5-6.5-.5S4.5 28 8.5 25.5c2.5-1.5 5-1.5 7.5-3.5 1.75-1.4 3-3.6 4-6 .5-1 1-2 2-2z"
        fill="#ffffff"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <circle cx="9.5" cy="25.5" r="1" fill="#1a1a1a" />
    </svg>
  ),
  B: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"
          fill="#ffffff"
        />
        <path
          d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
          fill="#ffffff"
        />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#ffffff" />
        <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" />
      </g>
    </svg>
  ),
  R: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="#ffffff" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" fill="none" />
      </g>
    </svg>
  ),
  Q: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="#ffffff" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-6 15-7-11 2 12z" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="14" cy="9" r="2" />
        <circle cx="22.5" cy="8" r="2" />
        <circle cx="31" cy="9" r="2" />
        <circle cx="39" cy="12" r="2" />
      </g>
    </svg>
  ),
  K: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" stroke="#1a1a1a" />
        <path
          d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
          fill="#ffffff"
          stroke="#1a1a1a"
        />
        <path
          d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1 8-6 8-2 0-2.5-1-6-1s-4 1-6 1c-5 0-2-9-6-8-3 6 6 10.5 6 10.5v7z"
          fill="#ffffff"
          stroke="#1a1a1a"
        />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
      </g>
    </svg>
  ),
  p: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#262626"
        stroke="#e5e5e5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  n: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <path
        d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
        fill="#262626"
        stroke="#e5e5e5"
        strokeWidth="1.5"
      />
      <path
        d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.932 1.28-2 2-3.5 1.5-6.5-.5-6.5-.5S4.5 28 8.5 25.5c2.5-1.5 5-1.5 7.5-3.5 1.75-1.4 3-3.6 4-6 .5-1 1-2 2-2z"
        fill="#262626"
        stroke="#e5e5e5"
        strokeWidth="1.5"
      />
      <circle cx="9.5" cy="25.5" r="1" fill="#ffffff" />
    </svg>
  ),
  b: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="none" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"
          fill="#262626"
        />
        <path
          d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
          fill="#262626"
        />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#262626" />
        <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" stroke="#ffffff" />
      </g>
    </svg>
  ),
  r: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="#262626" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
      </g>
    </svg>
  ),
  q: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="#262626" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-6 15-7-11 2 12z" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke="#ffffff" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="14" cy="9" r="2" />
        <circle cx="22.5" cy="8" r="2" />
        <circle cx="31" cy="9" r="2" />
        <circle cx="39" cy="12" r="2" />
      </g>
    </svg>
  ),
  k: () => (
    <svg viewBox="0 0 45 45" width="100%" height="100%">
      <g fill="none" stroke="#e5e5e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.5 11.63V6M20 8h5" stroke="#e5e5e5" />
        <path
          d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
          fill="#262626"
          stroke="#e5e5e5"
        />
        <path
          d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1 8-6 8-2 0-2.5-1-6-1s-4 1-6 1c-5 0-2-9-6-8-3 6 6 10.5 6 10.5v7z"
          fill="#262626"
          stroke="#e5e5e5"
        />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#ffffff" />
      </g>
    </svg>
  ),
};

export function ChessPiece({ piece, size }: { piece: string; size?: number }) {
  const renderer = PIECE_SVGS[piece];
  if (!renderer) return null;
  return (
    <div
      style={{
        width: size ? `${size}px` : '100%',
        height: size ? `${size}px` : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {renderer()}
    </div>
  );
}
