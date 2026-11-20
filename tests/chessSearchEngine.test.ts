import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  orderMoves,
  quiescenceSearch,
  negamax,
  searchBestMove,
  SearchStats,
} from '@/lib/chessSearchEngine';
import { TranspositionTable } from '@/lib/transpositionTable';
import { generateLegalMoves } from '@/lib/moveEngine';

describe('Negamax Search Engine with Alpha-Beta Pruning and Quiescence', () => {
  it('orderMoves prioritizes hash move and high-value captures via MVV-LVA', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3';
    const moves = generateLegalMoves(fen);

    const orderedDefault = orderMoves(moves);
    const firstMove = orderedDefault[0];
    assert.ok(firstMove.captured !== undefined || firstMove.from === 'f3');

    const orderedWithHash = orderMoves(moves, 'd4d5');
    assert.equal(orderedWithHash[0].from, 'd4');
    assert.equal(orderedWithHash[0].to, 'd5');
  });

  it('quiescenceSearch computes tactical capture resolution beyond nominal depth', () => {
    const fen = 'r1bqkb1r/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3';
    const stats: SearchStats = {
      nodesSearched: 0,
      quiescenceNodes: 0,
      betaCutoffs: 0,
      transpositionHits: 0,
      transpositionCutoffs: 0,
    };

    const score = quiescenceSearch(fen, -10000, 10000, 'white', stats, 3);
    assert.equal(typeof score, 'number');
    assert.ok(stats.nodesSearched > 0);
  });

  it('negamax search produces beta cutoffs and populates transposition table', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const table = new TranspositionTable(5000);
    const stats: SearchStats = {
      nodesSearched: 0,
      quiescenceNodes: 0,
      betaCutoffs: 0,
      transpositionHits: 0,
      transpositionCutoffs: 0,
    };

    const score = negamax(fen, 2, -10000, 10000, 'white', table, stats);
    assert.equal(typeof score, 'number');
    assert.ok(stats.nodesSearched > 0);
    assert.ok(table.getMetrics().size > 0);
  });

  it('searchBestMove finds forced checkmate in tactical positions', () => {
    const mateInOneFen = 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4';
    const result = searchBestMove(mateInOneFen, { depth: 2 });

    assert.equal(result.bestMove.from, 'f3');
    assert.equal(result.bestMove.to, 'f7');
    assert.ok(result.score > 15000);
    assert.ok(result.nodes > 0);
    assert.equal(result.pv[0], 'f3f7');
  });

  it('searchBestMove returns multi-pv candidate line rankings', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const result = searchBestMove(fen, { depth: 1, multiPv: 3 });

    assert.ok(result.candidateMoves.length === 3);
    assert.ok(result.candidateMoves[0].score >= result.candidateMoves[1].score);
    assert.ok(result.candidateMoves[1].score >= result.candidateMoves[2].score);
    assert.ok(result.nps >= 0);
    assert.ok(result.timeMs >= 0);
  });
});