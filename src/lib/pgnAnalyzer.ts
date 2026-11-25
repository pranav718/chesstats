import { STARTING_FEN } from './constants';
import { parsePgn, countMaterial, getTurnFromFen } from './fenPgn';
import { executeMoveOnFen, getGameState, MoveStep } from './moveEngine';
import { parseSanMove, formatUciToSan } from './sanNotation';
import { searchBestMove, negamax, SearchStats } from './chessSearchEngine';
import { evaluatePositionalFeatures } from './positionalEvaluation';
import { detectTacticalMotifs, DetectedMotif } from './engineSimulator';
import { calculateGameAccuracy, classifyMove, GameAccuracyResult } from './accuracy';
import { classifyOpening, ClassificationMatch } from './ecoClassifier';
import { TranspositionTable } from './transpositionTable';
import { MoveAnalysis, MoveClassification, PieceColor } from '@/types/chess';

export class PgnReplayError extends Error {
  public readonly ply: number;
  public readonly san: string;
  public readonly fen: string;

  constructor(ply: number, san: string, fen: string, message: string) {
    super(`Illegal PGN move at ply ${ply} ("${san}"): ${message}`);
    this.name = 'PgnReplayError';
    this.ply = ply;
    this.san = san;
    this.fen = fen;
  }
}

export interface ReplayedMoveSnapshot {
  ply: number;
  moveNumber: number;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  playedBy: PieceColor;
  step: MoveStep;
}

export interface AnalyzedPgnMove {
  ply: number;
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  playedBy: PieceColor;
  beforeEval: number;
  afterEval: number;
  evaluation: number;
  bestMove: string;
  bestMoveSan: string;
  classification: MoveClassification;
  motifs: DetectedMotif[];
  nodes: number;
}

export interface PgnEngineStats {
  depth: number;
  totalNodes: number;
  timeMs: number;
  transpositionHits: number;
  transpositionTableSize: number;
}

export interface PgnAnalysisResult {
  headers: Record<string, string>;
  result: string;
  opening: ClassificationMatch;
  totalMoves: number;
  accuracy: GameAccuracyResult;
  engineStats: PgnEngineStats;
  moves: AnalyzedPgnMove[];
}

export interface ReplayAnalysisOptions {
  depth?: number;
  transpositionTable?: TranspositionTable;
  onMove?: (move: AnalyzedPgnMove) => void;
}

export function replayPgnMoves(
  moves: string[],
  initialFen: string = STARTING_FEN
): ReplayedMoveSnapshot[] {
  const snapshots: ReplayedMoveSnapshot[] = [];
  let currentFen = initialFen;

  for (let i = 0; i < moves.length; i++) {
    const san = moves[i];
    const ply = i + 1;
    const moveNumber = Math.floor(i / 2) + 1;
    const playedBy = getTurnFromFen(currentFen);

    let step: MoveStep;
    try {
      step = parseSanMove(currentFen, san);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'Invalid move notation';
      throw new PgnReplayError(ply, san, currentFen, reason);
    }

    const fenAfter = executeMoveOnFen(currentFen, step.from, step.to, step.promotion);
    const uci = `${step.from}${step.to}${step.promotion ? step.promotion.toLowerCase() : ''}`;

    snapshots.push({
      ply,
      moveNumber,
      san,
      uci,
      fenBefore: currentFen,
      fenAfter,
      playedBy,
      step,
    });

    currentFen = fenAfter;
  }

  return snapshots;
}

export function analyzePgnGame(
  pgn: string,
  options: ReplayAnalysisOptions = {}
): PgnAnalysisResult {
  const parsed = parsePgn(pgn);
  const initialFen = parsed.headers['FEN'] || STARTING_FEN;
  const timeline = replayPgnMoves(parsed.moves, initialFen);
  const depth = Math.min(3, Math.max(1, Math.floor(options.depth ?? 1)));
  const table = options.transpositionTable ?? new TranspositionTable(30000);

  const startTime = performance.now();
  let previousEval = evaluatePositionalFeatures(initialFen).totalScore;
  let totalNodes = 0;

  const analyzedMoves: AnalyzedPgnMove[] = [];
  const accuracyInputs: {
    beforeEval: number;
    afterEval: number;
    playedBy: PieceColor;
    isSacrifice?: boolean;
  }[] = [];

  for (const item of timeline) {
    const beforeEval = previousEval;
    const searchRes = searchBestMove(item.fenBefore, {
      depth,
      multiPv: 1,
      transpositionTable: table,
    });

    totalNodes += searchRes.nodes;

    const bestUci = searchRes.bestMove.uci;
    const bestMoveSan = formatUciToSan(item.fenBefore, bestUci) || bestUci;

    let afterEval: number;
    if (item.uci === bestUci) {
      afterEval = searchRes.score;
    } else {
      const nextTurn = getTurnFromFen(item.fenAfter);
      const childDepth = Math.max(0, depth - 1);
      const gameState = getGameState(item.fenAfter);

      if (gameState === 'checkmate') {
        afterEval = item.playedBy === 'white' ? 20000 : -20000;
      } else if (
        gameState === 'stalemate' ||
        gameState === 'insufficient_material' ||
        gameState === 'fifty_moves_rule'
      ) {
        afterEval = 0;
      } else {
        const cached = table.get(item.fenAfter, childDepth);
        let childScore: number;
        if (cached && cached.nodeType === 'exact') {
          childScore = cached.score;
        } else {
          const evalStats: SearchStats = {
            nodesSearched: 0,
            quiescenceNodes: 0,
            betaCutoffs: 0,
            transpositionHits: 0,
            transpositionCutoffs: 0,
          };
          childScore = negamax(
            item.fenAfter,
            childDepth,
            -25000,
            25000,
            nextTurn,
            table,
            evalStats,
            1
          );
          totalNodes += evalStats.nodesSearched;
        }
        afterEval = nextTurn === 'white' ? childScore : -childScore;
      }
    }

    const matBefore = countMaterial(item.fenBefore);
    const matAfter = countMaterial(item.fenAfter);
    const matDiffChange =
      item.playedBy === 'white'
        ? matAfter.materialDifference - matBefore.materialDifference
        : matBefore.materialDifference - matAfter.materialDifference;
    const isSacrifice = Boolean(item.step.captured) ? false : matDiffChange <= -2;

    const classification = classifyMove(beforeEval, afterEval, item.playedBy, isSacrifice);
    const cpLoss = Math.max(
      0,
      item.playedBy === 'white' ? beforeEval - afterEval : afterEval - beforeEval
    );

    const needsMotifs =
      classification === 'inaccuracy' ||
      classification === 'mistake' ||
      classification === 'miss' ||
      classification === 'blunder';

    const motifs = needsMotifs
      ? detectTacticalMotifs(item.fenBefore, item.fenAfter, cpLoss)
      : [];

    const moveRecord: AnalyzedPgnMove = {
      ply: item.ply,
      moveNumber: item.moveNumber,
      san: item.san,
      uci: item.uci,
      fen: item.fenAfter,
      playedBy: item.playedBy,
      beforeEval,
      afterEval,
      evaluation: afterEval,
      bestMove: bestUci,
      bestMoveSan,
      classification,
      motifs,
      nodes: searchRes.nodes,
    };

    analyzedMoves.push(moveRecord);
    accuracyInputs.push({
      beforeEval,
      afterEval,
      playedBy: item.playedBy,
      isSacrifice,
    });

    if (options.onMove) {
      options.onMove(moveRecord);
    }

    previousEval = afterEval;
  }

  const accuracy = calculateGameAccuracy(accuracyInputs);
  const opening = classifyOpening(parsed.moves);
  const ttMetrics = table.getMetrics();
  const timeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    headers: parsed.headers,
    result: parsed.result,
    opening,
    totalMoves: analyzedMoves.length,
    accuracy,
    engineStats: {
      depth,
      totalNodes,
      timeMs,
      transpositionHits: ttMetrics.hits,
      transpositionTableSize: ttMetrics.size,
    },
    moves: analyzedMoves,
  };
}

export function hydrateParsedGameMoves(
  movesSan: string[],
  initialFen: string = STARTING_FEN
): MoveAnalysis[] {
  if (!movesSan || movesSan.length === 0) return [];

  const hydrated: MoveAnalysis[] = [];
  let currentFen = initialFen;
  let fenBroken = false;

  for (let idx = 0; idx < movesSan.length; idx++) {
    const san = movesSan[idx];
    const ply = idx + 1;
    const moveNumber = Math.floor(idx / 2) + 1;
    const playedBy: PieceColor = idx % 2 === 0 ? 'white' : 'black';

    if (!fenBroken) {
      try {
        const step = parseSanMove(currentFen, san);
        currentFen = executeMoveOnFen(currentFen, step.from, step.to, step.promotion);
        const uci = `${step.from}${step.to}${step.promotion ? step.promotion.toLowerCase() : ''}`;
        const evalScore = evaluatePositionalFeatures(currentFen).totalScore;
        hydrated.push({
          ply,
          moveNumber,
          san,
          uci,
          fen: currentFen,
          evaluation: evalScore,
          classification: 'good',
          playedBy,
        });
        continue;
      } catch {
        fenBroken = true;
      }
    }

    hydrated.push({
      ply,
      moveNumber,
      san,
      uci: san,
      fen: '',
      evaluation: 0,
      classification: 'good',
      playedBy,
    });
  }

  return hydrated;
}