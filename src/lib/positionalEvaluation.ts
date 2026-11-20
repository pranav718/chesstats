import { parseFen, squareToCoords } from './fenPgn';

export interface PawnStructureEvaluation {
  whiteDoubledPenalty: number;
  blackDoubledPenalty: number;
  whiteIsolatedPenalty: number;
  blackIsolatedPenalty: number;
  whitePassedBonus: number;
  blackPassedBonus: number;
  netPawnScore: number;
}

export interface PositionalEvaluationBreakdown {
  materialScore: number;
  pstScore: number;
  bishopPairScore: number;
  pawnStructureScore: number;
  rookFilesScore: number;
  kingShelterScore: number;
  totalScore: number;
}

const PIECE_WEIGHTS: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const PAWN_PST: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST: number[][] = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST: number[][] = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST: number[][] = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_PST_MID: number[][] = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

export function evaluatePawnStructure(board: (string | null)[][]): PawnStructureEvaluation {
  const whitePawnsByFile: number[][] = Array.from({ length: 8 }, () => []);
  const blackPawnsByFile: number[][] = Array.from({ length: 8 }, () => []);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece === 'P') whitePawnsByFile[c].push(r);
      if (piece === 'p') blackPawnsByFile[c].push(r);
    }
  }

  let whiteDoubled = 0;
  let blackDoubled = 0;
  let whiteIsolated = 0;
  let blackIsolated = 0;
  let whitePassed = 0;
  let blackPassed = 0;

  for (let c = 0; c < 8; c++) {
    const wPawns = whitePawnsByFile[c];
    if (wPawns.length > 1) {
      whiteDoubled += (wPawns.length - 1) * 20;
    }

    const bPawns = blackPawnsByFile[c];
    if (bPawns.length > 1) {
      blackDoubled += (bPawns.length - 1) * 20;
    }

    if (wPawns.length > 0) {
      const leftEmpty = c === 0 || whitePawnsByFile[c - 1].length === 0;
      const rightEmpty = c === 7 || whitePawnsByFile[c + 1].length === 0;
      if (leftEmpty && rightEmpty) {
        whiteIsolated += wPawns.length * 20;
      }
    }

    if (bPawns.length > 0) {
      const leftEmpty = c === 0 || blackPawnsByFile[c - 1].length === 0;
      const rightEmpty = c === 7 || blackPawnsByFile[c + 1].length === 0;
      if (leftEmpty && rightEmpty) {
        blackIsolated += bPawns.length * 20;
      }
    }

    for (const r of wPawns) {
      let isPassed = true;
      for (let fc = Math.max(0, c - 1); fc <= Math.min(7, c + 1); fc++) {
        for (const br of blackPawnsByFile[fc]) {
          if (br < r) {
            isPassed = false;
            break;
          }
        }
        if (!isPassed) break;
      }
      if (isPassed) {
        whitePassed += (7 - r) * 15;
      }
    }

    for (const r of bPawns) {
      let isPassed = true;
      for (let fc = Math.max(0, c - 1); fc <= Math.min(7, c + 1); fc++) {
        for (const wr of whitePawnsByFile[fc]) {
          if (wr > r) {
            isPassed = false;
            break;
          }
        }
        if (!isPassed) break;
      }
      if (isPassed) {
        blackPassed += r * 15;
      }
    }
  }

  const whitePenalty = whiteDoubled + whiteIsolated;
  const blackPenalty = blackDoubled + blackIsolated;
  const netPawnScore = whitePassed - blackPassed - whitePenalty + blackPenalty;

  return {
    whiteDoubledPenalty: whiteDoubled,
    blackDoubledPenalty: blackDoubled,
    whiteIsolatedPenalty: whiteIsolated,
    blackIsolatedPenalty: blackIsolated,
    whitePassedBonus: whitePassed,
    blackPassedBonus: blackPassed,
    netPawnScore,
  };
}

export function evaluateRookFiles(board: (string | null)[][]): { whiteBonus: number; blackBonus: number } {
  let whiteBonus = 0;
  let blackBonus = 0;

  for (let c = 0; c < 8; c++) {
    let whitePawnsOnCol = 0;
    let blackPawnsOnCol = 0;
    let whiteRooksOnCol = 0;
    let blackRooksOnCol = 0;

    for (let r = 0; r < 8; r++) {
      const p = board[r][c];
      if (p === 'P') whitePawnsOnCol++;
      if (p === 'p') blackPawnsOnCol++;
      if (p === 'R') whiteRooksOnCol++;
      if (p === 'r') blackRooksOnCol++;
    }

    if (whiteRooksOnCol > 0) {
      if (whitePawnsOnCol === 0 && blackPawnsOnCol === 0) {
        whiteBonus += whiteRooksOnCol * 30;
      } else if (whitePawnsOnCol === 0) {
        whiteBonus += whiteRooksOnCol * 15;
      }
    }

    if (blackRooksOnCol > 0) {
      if (whitePawnsOnCol === 0 && blackPawnsOnCol === 0) {
        blackBonus += blackRooksOnCol * 30;
      } else if (blackPawnsOnCol === 0) {
        blackBonus += blackRooksOnCol * 15;
      }
    }
  }

  return { whiteBonus, blackBonus };
}

export function evaluateBishopPairs(board: (string | null)[][]): { whiteBonus: number; blackBonus: number } {
  let whiteBishops = 0;
  let blackBishops = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === 'B') whiteBishops++;
      if (p === 'b') blackBishops++;
    }
  }

  return {
    whiteBonus: whiteBishops >= 2 ? 35 : 0,
    blackBonus: blackBishops >= 2 ? 35 : 0,
  };
}

export function evaluateKingShelter(board: (string | null)[][]): { whitePenalty: number; blackPenalty: number } {
  let whiteKingPos: [number, number] | null = null;
  let blackKingPos: [number, number] | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === 'K') whiteKingPos = [r, c];
      if (p === 'k') blackKingPos = [r, c];
    }
  }

  let whitePenalty = 0;
  let blackPenalty = 0;

  if (whiteKingPos && whiteKingPos[0] === 7 && whiteKingPos[1] >= 5) {
    for (const c of [5, 6, 7]) {
      let pawnFound = false;
      for (let r = 5; r <= 6; r++) {
        if (board[r][c] === 'P') {
          pawnFound = true;
          if (r === 5) whitePenalty += 8;
          break;
        }
      }
      if (!pawnFound && board[6][c] !== 'P') {
        whitePenalty += 18;
      }
    }
  }

  if (blackKingPos && blackKingPos[0] === 0 && blackKingPos[1] >= 5) {
    for (const c of [5, 6, 7]) {
      let pawnFound = false;
      for (let r = 1; r <= 2; r++) {
        if (board[r][c] === 'p') {
          pawnFound = true;
          if (r === 2) blackPenalty += 8;
          break;
        }
      }
      if (!pawnFound && board[1][c] !== 'p') {
        blackPenalty += 18;
      }
    }
  }

  return { whitePenalty, blackPenalty };
}

export function evaluatePositionalFeatures(fen: string): PositionalEvaluationBreakdown {
  const board = parseFen(fen);

  let materialWhite = 0;
  let materialBlack = 0;
  let whitePst = 0;
  let blackPst = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece === piece.toUpperCase();
      const lower = piece.toLowerCase();
      const weight = PIECE_WEIGHTS[lower] || 0;

      if (isWhite) materialWhite += weight;
      else materialBlack += weight;

      const tableRow = isWhite ? r : 7 - r;
      let pstVal = 0;

      if (lower === 'p') pstVal = PAWN_PST[tableRow][c];
      else if (lower === 'n') pstVal = KNIGHT_PST[tableRow][c];
      else if (lower === 'b') pstVal = BISHOP_PST[tableRow][c];
      else if (lower === 'r') pstVal = ROOK_PST[tableRow][c];
      else if (lower === 'q') pstVal = QUEEN_PST[tableRow][c];
      else if (lower === 'k') pstVal = KING_PST_MID[tableRow][c];

      if (isWhite) whitePst += pstVal;
      else blackPst += pstVal;
    }
  }

  const materialScore = materialWhite - materialBlack;
  const pstScore = whitePst - blackPst;

  const bishopPairs = evaluateBishopPairs(board);
  const bishopPairScore = bishopPairs.whiteBonus - bishopPairs.blackBonus;

  const pawnStruct = evaluatePawnStructure(board);
  const pawnStructureScore = pawnStruct.netPawnScore;

  const rookFiles = evaluateRookFiles(board);
  const rookFilesScore = rookFiles.whiteBonus - rookFiles.blackBonus;

  const kingShelter = evaluateKingShelter(board);
  const kingShelterScore = kingShelter.blackPenalty - kingShelter.whitePenalty;

  const totalScore =
    materialScore +
    pstScore +
    bishopPairScore +
    pawnStructureScore +
    rookFilesScore +
    kingShelterScore;

  return {
    materialScore,
    pstScore,
    bishopPairScore,
    pawnStructureScore,
    rookFilesScore,
    kingShelterScore,
    totalScore,
  };
}