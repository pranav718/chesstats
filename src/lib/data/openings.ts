import { OpeningStats } from '@/types/chess';

export const OPENINGS_DATA: OpeningStats[] = [
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    movesSan: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    totalGames: 184500,
    winRateWhite: 38.2,
    drawRate: 34.1,
    winRateBlack: 27.7,
    popularReplies: [
      { san: 'Be3', games: 62400, whiteWinsPercent: 39, drawsPercent: 33, blackWinsPercent: 28 },
      { san: 'Bg5', games: 45100, whiteWinsPercent: 41, drawsPercent: 32, blackWinsPercent: 27 },
      { san: 'h3', games: 24800, whiteWinsPercent: 37, drawsPercent: 35, blackWinsPercent: 28 },
      { san: 'Be2', games: 21900, whiteWinsPercent: 36, drawsPercent: 38, blackWinsPercent: 26 },
    ],
  },
  {
    eco: 'C50',
    name: 'Italian Game',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    totalGames: 242000,
    winRateWhite: 39.5,
    drawRate: 36.2,
    winRateBlack: 24.3,
    popularReplies: [
      { san: 'c3', games: 98000, whiteWinsPercent: 40, drawsPercent: 36, blackWinsPercent: 24 },
      { san: 'd3', games: 82000, whiteWinsPercent: 38, drawsPercent: 38, blackWinsPercent: 24 },
      { san: 'O-O', games: 31000, whiteWinsPercent: 39, drawsPercent: 34, blackWinsPercent: 27 },
    ],
  },
  {
    eco: 'D37',
    name: "Queen's Gambit Declined: Classical Variation",
    movesSan: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Nf3', 'Be7', 'Bf4', 'O-O'],
    totalGames: 142000,
    winRateWhite: 37.8,
    drawRate: 42.5,
    winRateBlack: 19.7,
    popularReplies: [
      { san: 'e3', games: 58000, whiteWinsPercent: 38, drawsPercent: 43, blackWinsPercent: 19 },
      { san: 'Rc1', games: 34000, whiteWinsPercent: 39, drawsPercent: 41, blackWinsPercent: 20 },
      { san: 'cxd5', games: 26000, whiteWinsPercent: 36, drawsPercent: 44, blackWinsPercent: 20 },
    ],
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    movesSan: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6'],
    totalGames: 128000,
    winRateWhite: 35.1,
    drawRate: 46.8,
    winRateBlack: 18.1,
    popularReplies: [
      { san: 'O-O', games: 74000, whiteWinsPercent: 36, drawsPercent: 47, blackWinsPercent: 17 },
      { san: 'd3', games: 36000, whiteWinsPercent: 34, drawsPercent: 46, blackWinsPercent: 20 },
      { san: 'Qe2', games: 9500, whiteWinsPercent: 33, drawsPercent: 45, blackWinsPercent: 22 },
    ],
  },
  {
    eco: 'B12',
    name: 'Caro-Kann Defense: Advance Variation',
    movesSan: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'],
    totalGames: 119000,
    winRateWhite: 39.1,
    drawRate: 35.4,
    winRateBlack: 25.5,
    popularReplies: [
      { san: 'h4', games: 42000, whiteWinsPercent: 42, drawsPercent: 32, blackWinsPercent: 26 },
      { san: 'Nf3', games: 38000, whiteWinsPercent: 38, drawsPercent: 37, blackWinsPercent: 25 },
      { san: 'Nc3', games: 21000, whiteWinsPercent: 37, drawsPercent: 36, blackWinsPercent: 27 },
    ],
  },
  {
    eco: 'C00',
    name: 'French Defense',
    movesSan: ['e4', 'e6'],
    totalGames: 215000,
    winRateWhite: 40.2,
    drawRate: 33.1,
    winRateBlack: 26.7,
    popularReplies: [
      { san: 'd4 d5', games: 165000, whiteWinsPercent: 41, drawsPercent: 33, blackWinsPercent: 26 },
      { san: 'd3', games: 22000, whiteWinsPercent: 38, drawsPercent: 34, blackWinsPercent: 28 },
    ],
  },
  {
    eco: 'E60',
    name: "King's Indian Defense",
    movesSan: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    totalGames: 164000,
    winRateWhite: 42.1,
    drawRate: 31.4,
    winRateBlack: 26.5,
    popularReplies: [
      { san: 'Nf3', games: 68000, whiteWinsPercent: 41, drawsPercent: 33, blackWinsPercent: 26 },
      { san: 'f3', games: 32000, whiteWinsPercent: 45, drawsPercent: 28, blackWinsPercent: 27 },
      { san: 'Be2', games: 24000, whiteWinsPercent: 43, drawsPercent: 31, blackWinsPercent: 26 },
    ],
  },
  {
    eco: 'D02',
    name: "Queen's Pawn Game: London System",
    movesSan: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3'],
    totalGames: 178000,
    winRateWhite: 38.6,
    drawRate: 37.9,
    winRateBlack: 23.5,
    popularReplies: [
      { san: 'Nc6', games: 64000, whiteWinsPercent: 39, drawsPercent: 37, blackWinsPercent: 24 },
      { san: 'Qb6', games: 41000, whiteWinsPercent: 37, drawsPercent: 38, blackWinsPercent: 25 },
    ],
  },
];

export function getAllOpenings(): OpeningStats[] {
  return OPENINGS_DATA;
}

export function getOpeningByEco(eco: string): OpeningStats | undefined {
  const norm = eco.trim().toUpperCase();
  return OPENINGS_DATA.find((o) => o.eco === norm);
}

export function searchOpenings(query: string): OpeningStats[] {
  const q = query.trim().toLowerCase();
  if (!q) return OPENINGS_DATA;
  return OPENINGS_DATA.filter((o) => o.name.toLowerCase().includes(q) || o.eco.toLowerCase().includes(q));
}
