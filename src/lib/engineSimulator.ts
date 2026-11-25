import { parseFen, countMaterial, validateFen } from './fenPgn';
import { searchBestMove } from './chessSearchEngine';
import { formatUciToSan } from './sanNotation';

export interface EngineLine {
  rank: number;
  score: number;
  depth: number;
  nodes: number;
  pv: string[];
  fromSquare: string;
  toSquare: string;
}

export interface EngineConfig {
  depth: number;
  multiPv: number;
  threads: number;
  showThreats: boolean;
  showArrows: boolean;
}

export type TacticalMotifType =
  | 'hanging_piece'
  | 'back_rank_vulnerability'
  | 'missed_win'
  | 'endgame_blunder'
  | 'tempo_loss'
  | 'tactical_oversight';

export interface DetectedMotif {
  type: TacticalMotifType;
  label: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  depth: 18,
  multiPv: 3,
  threads: 4,
  showThreats: true,
  showArrows: true,
};

const PAWN_PST: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const KNIGHT_PST: number[][] = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_PST: number[][] = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_PST: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const QUEEN_PST: number[][] = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const KING_PST: number[][] = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20],
];

export function evaluateBoardPositionalScore(fen: string): {
  materialScore: number;
  positionalScore: number;
  totalScore: number;
} {
  const board = parseFen(fen);
  const material = countMaterial(fen);
  const materialScore = material.materialDifference * 100;

  let whitePst = 0;
  let blackPst = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece === piece.toUpperCase();
      const lower = piece.toLowerCase();
      const tableRow = isWhite ? r : 7 - r;

      let val = 0;
      if (lower === 'p') val = PAWN_PST[tableRow][c];
      else if (lower === 'n') val = KNIGHT_PST[tableRow][c];
      else if (lower === 'b') val = BISHOP_PST[tableRow][c];
      else if (lower === 'r') val = ROOK_PST[tableRow][c];
      else if (lower === 'q') val = QUEEN_PST[tableRow][c];
      else if (lower === 'k') val = KING_PST[tableRow][c];

      if (isWhite) whitePst += val;
      else blackPst += val;
    }
  }

  const positionalScore = whitePst - blackPst;
  const totalScore = materialScore + positionalScore;

  return {
    materialScore,
    positionalScore,
    totalScore,
  };
}

export function evaluatePositionLines(fen: string, config: Partial<EngineConfig> = {}): EngineLine[] {
  const depth = config.depth ?? DEFAULT_ENGINE_CONFIG.depth;
  const multiPv = Math.min(3, Math.max(1, config.multiPv ?? DEFAULT_ENGINE_CONFIG.multiPv));

  const validation = validateFen(fen);
  if (!validation.valid) {
    return [];
  }

  const effectiveSearchDepth = depth <= 3 ? Math.max(1, depth) : 1;
  const searchResult = searchBestMove(fen, {
    depth: effectiveSearchDepth,
    multiPv,
  });

  return searchResult.candidateMoves.map((candidate, idx) => {
    const pvSan = candidate.pv.length > 0
      ? [formatUciToSan(fen, candidate.uci) || candidate.uci, ...candidate.pv.slice(1)]
      : [candidate.uci];

    return {
      rank: idx + 1,
      score: candidate.whiteScore,
      depth,
      nodes: Math.max(1, searchResult.nodes),
      pv: pvSan,
      fromSquare: candidate.from,
      toSquare: candidate.to,
    };
  });
}

export function formatEngineScore(scoreInCentipawns: number): string {
  if (isNaN(scoreInCentipawns)) return '0.00';

  if (Math.abs(scoreInCentipawns) >= 9000) {
    const movesToMate = Math.max(1, Math.ceil((10000 - Math.abs(scoreInCentipawns)) / 100));
    return scoreInCentipawns > 0 ? `+M${movesToMate}` : `-M${movesToMate}`;
  }

  const pawns = scoreInCentipawns / 100;
  if (pawns === 0 || Math.abs(pawns) < 0.005) return '0.00';
  return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

export function detectTacticalMotifs(
  fenBefore: string,
  fenAfter: string,
  evalDropCentipawns: number
): DetectedMotif[] {
  const motifs: DetectedMotif[] = [];
  const matBefore = countMaterial(fenBefore);
  const matAfter = countMaterial(fenAfter);
  const materialLost = Math.abs(matBefore.materialDifference - matAfter.materialDifference);

  if (evalDropCentipawns >= 250 && materialLost >= 3) {
    motifs.push({
      type: 'hanging_piece',
      label: 'Hanging Material',
      severity: 'high',
      description: 'Major piece left undefended or captured without equal trade compensation.',
    });
  }

  if (evalDropCentipawns >= 400) {
    motifs.push({
      type: 'missed_win',
      label: 'Decisive Advantage Conceded',
      severity: 'high',
      description: 'Substantial winning margin forfeited due to tactical inaccuracy.',
    });
  } else if (evalDropCentipawns >= 150) {
    motifs.push({
      type: 'tactical_oversight',
      label: 'Tactical Oversight',
      severity: 'medium',
      description: 'Move allowed opponent immediate initiative or positional penetration.',
    });
  }

  const totalPiecesRemaining = matAfter.white + matAfter.black;
  if (totalPiecesRemaining <= 20 && evalDropCentipawns >= 100) {
    motifs.push({
      type: 'endgame_blunder',
      label: 'Endgame Precision Fault',
      severity: 'medium',
      description: 'King activity, pawn promotion square, or opposition lost in simplified endgame.',
    });
  }

  if (motifs.length === 0) {
    motifs.push({
      type: 'tempo_loss',
      label: 'Positional Inaccuracy',
      severity: 'low',
      description: 'Minor shift in positional evaluation without direct material concession.',
    });
  }

  return motifs;
}
