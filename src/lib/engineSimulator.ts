import { parseFen, countMaterial, getTurnFromFen, coordsToSquare } from './fenPgn';

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

function hashFen(fen: string): number {
  let hash = 0;
  for (let i = 0; i < fen.length; i++) {
    hash = (hash << 5) - hash + fen.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function findOccupiedSquares(fen: string, color: 'white' | 'black'): string[] {
  const board = parseFen(fen);
  const squares: string[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const isWhite = piece === piece.toUpperCase();
      if ((color === 'white' && isWhite) || (color === 'black' && !isWhite)) {
        squares.push(coordsToSquare(r, c));
      }
    }
  }

  return squares;
}

export function evaluatePositionLines(fen: string, config: Partial<EngineConfig> = {}): EngineLine[] {
  const depth = config.depth ?? DEFAULT_ENGINE_CONFIG.depth;
  const multiPv = Math.min(3, Math.max(1, config.multiPv ?? DEFAULT_ENGINE_CONFIG.multiPv));
  const hash = hashFen(fen);
  const turn = getTurnFromFen(fen);
  const material = countMaterial(fen);

  const baseMaterialScore = material.materialDifference * 100;
  const positionalVariance = (hash % 60) - 30;
  const topScore = baseMaterialScore + positionalVariance;

  const occupied = findOccupiedSquares(fen, turn);
  const targetSquares = ['e4', 'd4', 'c4', 'f4', 'e5', 'd5', 'c5', 'f5', 'f3', 'c3', 'f6', 'c6'];

  const lines: EngineLine[] = [];

  for (let i = 0; i < multiPv; i++) {
    const from = occupied.length > 0 ? occupied[(hash + i * 3) % occupied.length] : 'e2';
    const to = targetSquares[(hash + i * 5) % targetSquares.length];
    const scoreSpread = i === 0 ? topScore : topScore - (i * 40 + ((hash >> (i + 1)) % 30));
    const nodes = 200000 + ((hash + i * 50000) % 900000);

    lines.push({
      rank: i + 1,
      score: scoreSpread,
      depth,
      nodes,
      pv: [from, to],
      fromSquare: from,
      toSquare: to,
    });
  }

  return lines;
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
