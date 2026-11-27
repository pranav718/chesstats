import { getTurnFromFen } from './fenPgn';
import { generateLegalMoves, executeMoveOnFen, getGameState, isKingInCheck, MoveStep } from './moveEngine';
import { evaluatePositionalFeatures } from './positionalEvaluation';
import { TranspositionTable, NodeType } from './transpositionTable';
import { PieceColor } from '@/types/chess';

export interface SearchStats {
  nodesSearched: number;
  quiescenceNodes: number;
  betaCutoffs: number;
  transpositionHits: number;
  transpositionCutoffs: number;
  killerCutoffs?: number;
  aspirationResearches?: number;
}

export interface MoveOrderingHeuristics {
  killers: [string | null, string | null][];
  history: Map<string, number>;
}

export function createSearchStats(): SearchStats {
  return {
    nodesSearched: 0,
    quiescenceNodes: 0,
    betaCutoffs: 0,
    transpositionHits: 0,
    transpositionCutoffs: 0,
    killerCutoffs: 0,
    aspirationResearches: 0,
  };
}

export function createOrderingHeuristics(maxPlies: number = 32): MoveOrderingHeuristics {
  return {
    killers: Array.from({ length: maxPlies }, () => [null, null]),
    history: new Map<string, number>(),
  };
}

export function recordBetaCutoffHeuristic(
  heuristics: MoveOrderingHeuristics,
  move: MoveStep,
  ply: number,
  depth: number
): void {
  if (move.captured || move.promotion) {
    return;
  }

  const uci = `${move.from}${move.to}`;
  if (ply >= 0 && ply < heuristics.killers.length) {
    const slot = heuristics.killers[ply];
    if (slot[0] !== uci) {
      slot[1] = slot[0];
      slot[0] = uci;
    }
  }

  const historyKey = `${move.piece.toLowerCase()}:${move.from}:${move.to}`;
  const bonus = Math.max(1, depth * depth);
  const current = heuristics.history.get(historyKey) || 0;
  heuristics.history.set(historyKey, Math.min(30000, current + bonus));
}

export interface CandidateMoveEvaluation {
  uci: string;
  from: string;
  to: string;
  piece: string;
  promotion?: string;
  score: number;
  whiteScore: number;
  pv: string[];
}

export interface SearchResult {
  bestMove: CandidateMoveEvaluation;
  score: number;
  depth: number;
  nodes: number;
  pv: string[];
  candidateMoves: CandidateMoveEvaluation[];
  timeMs: number;
  nps: number;
  stats: SearchStats;
}

export interface SearchOptions {
  depth?: number;
  multiPv?: number;
  transpositionTable?: TranspositionTable;
  maxTimeMs?: number;
}

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function scoreMovePriority(
  move: MoveStep,
  hashBestMoveUci?: string,
  heuristics?: MoveOrderingHeuristics,
  ply: number = 0
): number {
  const uci = `${move.from}${move.to}${move.promotion || ''}`;
  if (hashBestMoveUci && uci === hashBestMoveUci) {
    return 2000000;
  }

  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured.toLowerCase()] || 100;
    const attackerVal = PIECE_VALUES[move.piece.toLowerCase()] || 100;
    return victimVal * 10 - attackerVal + 100000;
  }

  if (move.promotion) {
    return 90000 + (PIECE_VALUES[move.promotion.toLowerCase()] || 800);
  }

  if (heuristics && ply >= 0 && ply < heuristics.killers.length) {
    const slot = heuristics.killers[ply];
    if (slot[0] === uci) return 80000;
    if (slot[1] === uci) return 70000;
  }

  if (move.isCheck) {
    return 50000;
  }

  if (heuristics) {
    const historyKey = `${move.piece.toLowerCase()}:${move.from}:${move.to}`;
    return Math.min(40000, heuristics.history.get(historyKey) || 0);
  }

  return 0;
}

export function orderMoves(
  moves: MoveStep[],
  hashBestMoveUci?: string,
  heuristics?: MoveOrderingHeuristics,
  ply: number = 0
): MoveStep[] {
  const scored = moves.map((move) => ({
    move,
    priority: scoreMovePriority(move, hashBestMoveUci, heuristics, ply),
  }));
  scored.sort((a, b) => b.priority - a.priority);
  return scored.map((entry) => entry.move);
}

export function quiescenceSearch(
  fen: string,
  alpha: number,
  beta: number,
  turn: PieceColor,
  stats: SearchStats,
  depthRemaining: number = 3
): number {
  stats.quiescenceNodes++;
  stats.nodesSearched++;

  const inCheck = isKingInCheck(fen, turn);

  if (!inCheck) {
    const posBreakdown = evaluatePositionalFeatures(fen);
    const standPat = turn === 'white' ? posBreakdown.totalScore : -posBreakdown.totalScore;

    if (standPat >= beta) {
      return beta;
    }

    if (standPat > alpha) {
      alpha = standPat;
    }

    if (depthRemaining <= 0) {
      return standPat;
    }

    const legalMoves = generateLegalMoves(fen);
    if (legalMoves.length === 0) {
      return 0;
    }

    const captures = legalMoves.filter((m) => Boolean(m.captured) || Boolean(m.promotion));
    if (captures.length === 0) {
      return standPat;
    }

    const orderedCaptures = orderMoves(captures);

    for (const capture of orderedCaptures) {
      const nextFen = executeMoveOnFen(fen, capture.from, capture.to, capture.promotion);
      const nextTurn = turn === 'white' ? 'black' : 'white';
      const score = -quiescenceSearch(nextFen, -beta, -alpha, nextTurn, stats, depthRemaining - 1);

      if (score >= beta) {
        stats.betaCutoffs++;
        return beta;
      }

      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }

  const legalMoves = generateLegalMoves(fen);
  if (legalMoves.length === 0) {
    return -20000;
  }

  if (depthRemaining <= 0) {
    const posBreakdown = evaluatePositionalFeatures(fen);
    return turn === 'white' ? posBreakdown.totalScore : -posBreakdown.totalScore;
  }

  const orderedEvasions = orderMoves(legalMoves);
  for (const move of orderedEvasions) {
    const nextFen = executeMoveOnFen(fen, move.from, move.to, move.promotion);
    const nextTurn = turn === 'white' ? 'black' : 'white';
    const score = -quiescenceSearch(nextFen, -beta, -alpha, nextTurn, stats, depthRemaining - 1);

    if (score >= beta) {
      stats.betaCutoffs++;
      return beta;
    }

    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
}

export function negamax(
  fen: string,
  depth: number,
  alpha: number,
  beta: number,
  turn: PieceColor,
  table: TranspositionTable,
  stats: SearchStats,
  ply: number = 0,
  heuristics?: MoveOrderingHeuristics
): number {
  stats.nodesSearched++;

  const entry = table.get(fen, depth);
  if (entry) {
    stats.transpositionHits++;
    if (entry.nodeType === 'exact') {
      stats.transpositionCutoffs++;
      return entry.score;
    }
    if (entry.nodeType === 'lowerbound' && entry.score >= beta) {
      stats.transpositionCutoffs++;
      stats.betaCutoffs++;
      return entry.score;
    }
    if (entry.nodeType === 'upperbound' && entry.score <= alpha) {
      stats.transpositionCutoffs++;
      return entry.score;
    }
  }

  const gameState = getGameState(fen);
  if (gameState === 'checkmate') {
    return -20000 + ply;
  }
  if (
    gameState === 'stalemate' ||
    gameState === 'insufficient_material' ||
    gameState === 'fifty_moves_rule'
  ) {
    return 0;
  }

  if (depth <= 0) {
    const qOrigAlpha = alpha;
    const qScore = quiescenceSearch(fen, alpha, beta, turn, stats);
    const qNodeType: NodeType =
      qScore <= qOrigAlpha ? 'upperbound' : qScore >= beta ? 'lowerbound' : 'exact';
    table.set(fen, 0, qScore, qNodeType);
    return qScore;
  }

  const legalMoves = generateLegalMoves(fen);
  if (legalMoves.length === 0) {
    if (isKingInCheck(fen, turn)) {
      return -20000 + ply;
    }
    return 0;
  }

  const hashBestMoveUci = entry?.bestMove;
  const orderedMoves = orderMoves(legalMoves, hashBestMoveUci, heuristics, ply);

  const origAlpha = alpha;
  let bestScore = -Infinity;
  let bestMoveUci = '';

  for (const move of orderedMoves) {
    const nextFen = executeMoveOnFen(fen, move.from, move.to, move.promotion);
    const nextTurn = turn === 'white' ? 'black' : 'white';
    const score = -negamax(nextFen, depth - 1, -beta, -alpha, nextTurn, table, stats, ply + 1, heuristics);

    if (score > bestScore) {
      bestScore = score;
      bestMoveUci = `${move.from}${move.to}${move.promotion || ''}`;
    }

    if (score > alpha) {
      alpha = score;
    }

    if (alpha >= beta) {
      stats.betaCutoffs++;
      if (!move.captured && !move.promotion) {
        stats.killerCutoffs = (stats.killerCutoffs || 0) + 1;
        if (heuristics) {
          recordBetaCutoffHeuristic(heuristics, move, ply, depth);
        }
      }
      break;
    }
  }

  let nodeType: NodeType = 'exact';
  if (bestScore <= origAlpha) {
    nodeType = 'upperbound';
  } else if (bestScore >= beta) {
    nodeType = 'lowerbound';
  }

  table.set(fen, depth, bestScore, nodeType, bestMoveUci);
  return bestScore;
}

export function extractPrincipalVariation(
  fen: string,
  table: TranspositionTable,
  maxPlies: number = 6
): string[] {
  const pv: string[] = [];
  const visited = new Set<string>();
  let currentFen = fen;

  for (let ply = 0; ply < maxPlies; ply++) {
    const entry = table.get(currentFen, 0);
    if (!entry || !entry.bestMove) break;

    const uci = entry.bestMove;
    if (visited.has(currentFen + uci)) break;
    visited.add(currentFen + uci);

    pv.push(uci);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;

    try {
      currentFen = executeMoveOnFen(currentFen, from, to, promotion);
    } catch {
      break;
    }
  }

  return pv;
}

export function searchBestMove(fen: string, options: SearchOptions = {}): SearchResult {
  const depth = Math.min(5, Math.max(1, options.depth ?? 3));
  const multiPv = Math.min(5, Math.max(1, options.multiPv ?? 1));
  const table = options.transpositionTable ?? new TranspositionTable(30000);
  const turn = getTurnFromFen(fen);

  const stats = createSearchStats();
  const heuristics = createOrderingHeuristics();

  const startTime = performance.now();
  const legalMoves = generateLegalMoves(fen);

  if (legalMoves.length === 0) {
    const isCheck = isKingInCheck(fen, turn);
    const score = isCheck ? (turn === 'white' ? -20000 : 20000) : 0;
    return {
      bestMove: {
        uci: '0000',
        from: 'a1',
        to: 'a1',
        piece: 'k',
        score: isCheck ? -20000 : 0,
        whiteScore: score,
        pv: [],
      },
      score,
      depth,
      nodes: 1,
      pv: [],
      candidateMoves: [],
      timeMs: 0,
      nps: 0,
      stats,
    };
  }

  const rootEntry = table.get(fen, depth);
  const orderedRootMoves = orderMoves(legalMoves, rootEntry?.bestMove, heuristics, 0);

  const candidateMoves: CandidateMoveEvaluation[] = [];

  for (const move of orderedRootMoves) {
    const uci = `${move.from}${move.to}${move.promotion || ''}`;
    const nextFen = executeMoveOnFen(fen, move.from, move.to, move.promotion);
    const nextTurn = turn === 'white' ? 'black' : 'white';

    const childScore = -negamax(
      nextFen,
      depth - 1,
      -Infinity,
      Infinity,
      nextTurn,
      table,
      stats,
      1,
      heuristics
    );

    const whiteScore = turn === 'white' ? childScore : -childScore;
    const movePv = [uci, ...extractPrincipalVariation(nextFen, table, 4)];

    candidateMoves.push({
      uci,
      from: move.from,
      to: move.to,
      piece: move.piece,
      promotion: move.promotion,
      score: childScore,
      whiteScore,
      pv: movePv,
    });
  }

  candidateMoves.sort((a, b) => b.score - a.score);

  const best = candidateMoves[0];
  const overallWhiteScore = best.whiteScore;

  table.set(
    fen,
    depth,
    best.score,
    'exact',
    best.uci
  );

  const endTime = performance.now();
  const timeMs = Math.round((endTime - startTime) * 100) / 100;
  const nps = timeMs > 0 ? Math.round((stats.nodesSearched / (timeMs / 1000))) : stats.nodesSearched;

  return {
    bestMove: best,
    score: overallWhiteScore,
    depth,
    nodes: stats.nodesSearched,
    pv: best.pv,
    candidateMoves: candidateMoves.slice(0, multiPv),
    timeMs,
    nps,
    stats,
  };
}