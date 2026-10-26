import { ChessPuzzle } from '@/types/puzzle';

export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 'puz-001',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    moves: ['Bxf7+', 'Kxf7', 'Nxe5+'],
    solutionSan: ['Bxf7+', 'Kxf7', 'Nxe5+'],
    rating: 1450,
    themes: ['fork', 'deflection'],
    openingFamily: 'Italian Game',
    description: 'Punish Black for leaving the vulnerable f7 square unprotected.',
    playerTurn: 'white',
  },
  {
    id: 'puz-002',
    fen: '6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1',
    moves: ['Qe8#'],
    solutionSan: ['Qe8#'],
    rating: 1100,
    themes: ['back-rank', 'mate-in-1'],
    description: 'Exploit the un-castled back rank weakness.',
    playerTurn: 'white',
  },
  {
    id: 'puz-003',
    fen: 'r1b1k2r/ppppqppp/2n5/4P3/1bP2Bn1/5N2/PP1NPPPP/R2QKB1R w KQkq - 3 7',
    moves: ['a3', 'Bxd2+', 'Qxd2'],
    solutionSan: ['a3', 'Bxd2+', 'Qxd2'],
    rating: 1680,
    themes: ['pin', 'hanging-piece'],
    openingFamily: 'Indian Defense',
    description: 'Resolve the pin on the knight and seize active piece coordination.',
    playerTurn: 'white',
  },
  {
    id: 'puz-004',
    fen: '2r3k1/pp3ppp/8/3p4/3N4/8/PPP2PPP/4R1K1 b - - 0 20',
    moves: ['Rxc2', 'Re8#'],
    solutionSan: ['Rxc2', 'Re8#'],
    rating: 1850,
    themes: ['back-rank', 'deflection'],
    description: 'Beware of the back rank deflection tactic.',
    playerTurn: 'black',
  },
  {
    id: 'puz-005',
    fen: 'r4rk1/1pp1qppp/p1np4/4p3/4P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 12',
    moves: ['Nd5', 'Qd8', 'Nxe5'],
    solutionSan: ['Nd5', 'Qd8', 'Nxe5'],
    rating: 2100,
    themes: ['discovered-attack', 'fork'],
    description: 'Advanced knight jump revealing an attack on the loose bishop on g4.',
    playerTurn: 'white',
  },
];

export function getRandomPuzzle(): ChessPuzzle {
  const index = Math.floor(Math.random() * CHESS_PUZZLES.length);
  return CHESS_PUZZLES[index];
}

export function getPuzzleById(id: string): ChessPuzzle | undefined {
  return CHESS_PUZZLES.find((p) => p.id === id);
}
