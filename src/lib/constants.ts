import { MoveClassification, TimeClass, Platform } from '@/types/chess';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const BOARD_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const BOARD_RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const ALL_SQUARES = BOARD_RANKS.flatMap((rank) =>
  BOARD_FILES.map((file) => `${file}${rank}`)
);

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3.2,
  r: 5,
  q: 9,
  k: 0,
  P: 1,
  N: 3,
  B: 3.2,
  R: 5,
  Q: 9,
  K: 0,
};

export interface ClassificationMeta {
  label: string;
  symbol: string;
  color: string;
  badgeBg: string;
  description: string;
}

export const CLASSIFICATION_CONFIG: Record<MoveClassification, ClassificationMeta> = {
  brilliant: {
    label: 'Brilliant',
    symbol: '!!',
    color: '#14b8a6',
    badgeBg: 'rgba(20, 184, 166, 0.18)',
    description: 'A sacrificial move that significantly improves the position or finds a hidden tactical win.',
  },
  great: {
    label: 'Great Move',
    symbol: '!',
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.18)',
    description: 'The only winning or saving move in a challenging and complex position.',
  },
  best: {
    label: 'Best Move',
    symbol: '★',
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    description: 'The engine recommendation and mathematically optimal play.',
  },
  excellent: {
    label: 'Excellent',
    symbol: '✓',
    color: '#84cc16',
    badgeBg: 'rgba(132, 204, 22, 0.18)',
    description: 'An outstanding move that preserves the advantage or equalizes cleanly.',
  },
  good: {
    label: 'Good',
    symbol: '·',
    color: '#a3e635',
    badgeBg: 'rgba(163, 230, 53, 0.15)',
    description: 'A solid, natural move with only minor centipawn deviation.',
  },
  book: {
    label: 'Book Move',
    symbol: '📖',
    color: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.18)',
    description: 'Established opening theory from grandmaster master databases.',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    symbol: '?!',
    color: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.18)',
    description: 'A slight mistake that hands over minor counterplay or initiative.',
  },
  mistake: {
    label: 'Mistake',
    symbol: '?',
    color: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.18)',
    description: 'A notable error that turns an advantage into equality or parity into disadvantage.',
  },
  miss: {
    label: 'Miss',
    symbol: '✕',
    color: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    description: 'Overlooked a key tactical opportunity or defensive resource.',
  },
  blunder: {
    label: 'Blunder',
    symbol: '??',
    color: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.22)',
    description: 'A catastrophic move that immediately concedes material or a winning advantage.',
  },
};

export const TIME_CLASS_CONFIG: Record<TimeClass, { label: string; icon: string; typicalClock: string }> = {
  bullet: { label: 'Bullet', icon: '⚡', typicalClock: '1|0 or 2|1' },
  blitz: { label: 'Blitz', icon: '🔥', typicalClock: '3|0 or 5|0' },
  rapid: { label: 'Rapid', icon: '⏱️', typicalClock: '10|0 or 15|10' },
  classical: { label: 'Classical', icon: '🏛️', typicalClock: '30+ min' },
  daily: { label: 'Daily', icon: '☀️', typicalClock: '1-3 days' },
};

export const PLATFORM_CONFIG: Record<Platform, { name: string; url: string; color: string; icon: string }> = {
  chesscom: {
    name: 'Chess.com',
    url: 'https://chess.com',
    color: '#81b64c',
    icon: '♟️',
  },
  lichess: {
    name: 'Lichess',
    url: 'https://lichess.org',
    color: '#ffffff',
    icon: '♞',
  },
};

export const POPULAR_ECO_CODES: Record<string, string> = {
  B90: 'Sicilian Defense: Najdorf Variation',
  B33: 'Sicilian Defense: Sveshnikov Variation',
  B20: 'Sicilian Defense',
  C50: 'Italian Game',
  C54: 'Italian Game: Giuoco Pianissimo',
  C65: 'Ruy Lopez: Berlin Defense',
  C88: 'Ruy Lopez: Closed',
  D37: "Queen's Gambit Declined: Classical Variation",
  D02: "Queen's Pawn Game: London System",
  E04: 'Catalan Opening: Open Defense',
  A45: 'Trompowsky Attack',
  C00: 'French Defense',
  C10: 'French Defense: Paulsen Variation',
  B12: 'Caro-Kann Defense: Advance Variation',
  B01: 'Scandinavian Defense',
  A80: 'Dutch Defense',
  E60: "King's Indian Defense",
  E15: "Queen's Indian Defense",
  A07: "King's Indian Attack",
  A00: 'Uncommon Opening',
};
