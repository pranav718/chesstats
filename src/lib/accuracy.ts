import { MoveClassification, PieceColor } from '@/types/chess';

export function evalToWinProbability(centipawns: number): number {
  if (isNaN(centipawns)) return 50;
  if (centipawns >= 10000) return 100;
  if (centipawns <= -10000) return 0;
  const prob = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
  return Math.max(0, Math.min(100, Math.round(prob * 10) / 10));
}

export function classifyMove(
  beforeEval: number,
  afterEval: number,
  playedBy: PieceColor,
  isSacrifice: boolean = false
): MoveClassification {
  const winProbBefore = evalToWinProbability(playedBy === 'white' ? beforeEval : -beforeEval);
  const winProbAfter = evalToWinProbability(playedBy === 'white' ? afterEval : -afterEval);
  const probLoss = Math.max(0, winProbBefore - winProbAfter);

  if (isSacrifice && winProbAfter >= winProbBefore - 1 && winProbAfter >= 50) {
    return 'brilliant';
  }

  if (probLoss <= 0.5) {
    return 'best';
  }
  if (probLoss <= 2.5) {
    return 'excellent';
  }
  if (probLoss <= 5.5) {
    return 'good';
  }
  if (probLoss <= 12.0) {
    return 'inaccuracy';
  }
  if (probLoss <= 25.0) {
    return 'mistake';
  }
  if (winProbBefore >= 75 && winProbAfter <= 45) {
    return 'miss';
  }
  return 'blunder';
}

export function calculateMoveAccuracy(winProbBefore: number, winProbAfter: number): number {
  const loss = Math.max(0, winProbBefore - winProbAfter);
  const accuracy = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.max(0, Math.min(100, Math.round(accuracy * 10) / 10));
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 10) / 10;
  }
  return Math.round(sorted[middle] * 10) / 10;
}

export interface GameAccuracyResult {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteAcpl: number;
  blackAcpl: number;
  whiteMcpl: number;
  blackMcpl: number;
  whiteBlunders: number;
  blackBlunders: number;
}

export function calculateGameAccuracy(
  moves: { beforeEval: number; afterEval: number; playedBy: PieceColor; isSacrifice?: boolean }[]
): GameAccuracyResult {
  const whiteLosses: number[] = [];
  const blackLosses: number[] = [];
  const whiteAccuracies: number[] = [];
  const blackAccuracies: number[] = [];
  let whiteBlunders = 0;
  let blackBlunders = 0;

  for (const move of moves) {
    const isWhite = move.playedBy === 'white';
    const before = isWhite ? move.beforeEval : -move.beforeEval;
    const after = isWhite ? move.afterEval : -move.afterEval;

    const probBefore = evalToWinProbability(before);
    const probAfter = evalToWinProbability(after);
    const cpLoss = Math.max(0, before - after);

    const accuracy = calculateMoveAccuracy(probBefore, probAfter);
    const classification = classifyMove(move.beforeEval, move.afterEval, move.playedBy, move.isSacrifice);

    if (isWhite) {
      whiteLosses.push(cpLoss);
      whiteAccuracies.push(accuracy);
      if (classification === 'blunder') whiteBlunders++;
    } else {
      blackLosses.push(cpLoss);
      blackAccuracies.push(accuracy);
      if (classification === 'blunder') blackBlunders++;
    }
  }

  const avg = (arr: number[], fallback: number) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : fallback;

  return {
    whiteAccuracy: Math.round(avg(whiteAccuracies, 100) * 10) / 10,
    blackAccuracy: Math.round(avg(blackAccuracies, 100) * 10) / 10,
    whiteAcpl: Math.round(avg(whiteLosses, 0)),
    blackAcpl: Math.round(avg(blackLosses, 0)),
    whiteMcpl: calculateMedian(whiteLosses),
    blackMcpl: calculateMedian(blackLosses),
    whiteBlunders,
    blackBlunders,
  };
}

export function calculatePerformanceRating(opponentRatings: number[], score: number): number {
  if (opponentRatings.length === 0) return 0;
  const avgOpponent = opponentRatings.reduce((sum, r) => sum + r, 0) / opponentRatings.length;
  const percentage = score / opponentRatings.length;
  const clampedPercentage = Math.max(0.01, Math.min(0.99, percentage));
  const dp = -400 * Math.log10(1 / clampedPercentage - 1);
  return Math.round(avgOpponent + dp);
}
