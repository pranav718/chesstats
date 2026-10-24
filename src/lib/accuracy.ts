import { MoveClassification, PieceColor } from '@/types/chess';

export function evalToWinProbability(centipawns: number): number {
  if (centipawns >= 10000) return 100;
  if (centipawns <= -10000) return 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
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

export function calculateGameAccuracy(
  moves: { beforeEval: number; afterEval: number; playedBy: PieceColor }[]
): {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteAcpl: number;
  blackAcpl: number;
} {
  const whiteLosses: number[] = [];
  const blackLosses: number[] = [];
  const whiteAccuracies: number[] = [];
  const blackAccuracies: number[] = [];

  for (const move of moves) {
    const isWhite = move.playedBy === 'white';
    const before = isWhite ? move.beforeEval : -move.beforeEval;
    const after = isWhite ? move.afterEval : -move.afterEval;

    const probBefore = evalToWinProbability(before);
    const probAfter = evalToWinProbability(after);
    const cpLoss = Math.max(0, before - after);

    const accuracy = calculateMoveAccuracy(probBefore, probAfter);

    if (isWhite) {
      whiteLosses.push(cpLoss);
      whiteAccuracies.push(accuracy);
    } else {
      blackLosses.push(cpLoss);
      blackAccuracies.push(accuracy);
    }
  }

  const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 100);

  return {
    whiteAccuracy: Math.round(avg(whiteAccuracies) * 10) / 10,
    blackAccuracy: Math.round(avg(blackAccuracies) * 10) / 10,
    whiteAcpl: Math.round(avg(whiteLosses)),
    blackAcpl: Math.round(avg(blackLosses)),
  };
}
