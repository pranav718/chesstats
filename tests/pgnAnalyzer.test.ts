import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  replayPgnMoves,
  analyzePgnGame,
  hydrateParsedGameMoves,
  PgnReplayError,
} from '@/lib/pgnAnalyzer';
import { OpeningTreeBuilder } from '@/lib/openingTree';

describe('Stateful PGN Replay and Engine Analysis Pipeline', () => {
  it('replays legal PGN sequence to deterministic FEN snapshots and UCI tokens', () => {
    const snapshots = replayPgnMoves(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']);
    assert.equal(snapshots.length, 6);
    assert.equal(snapshots[0].uci, 'e2e4');
    assert.equal(snapshots[0].playedBy, 'white');
    assert.equal(snapshots[2].uci, 'g1f3');
    assert.equal(snapshots[4].uci, 'f1b5');
    assert.ok(snapshots[5].fenAfter.includes('r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'));
  });

  it('throws PgnReplayError with exact ply and token on illegal PGN move', () => {
    assert.throws(
      () => replayPgnMoves(['e4', 'e5', 'Nf3', 'Qxf7']),
      (err: unknown) =>
        err instanceof PgnReplayError &&
        err.ply === 4 &&
        err.san === 'Qxf7'
    );
  });

  it('analyzes Scholar Mate PGN identifying forced mate, ECO opening, and CAPS accuracy', () => {
    const pgn = `[Event "Tactical Miniature"]
[White "Attacker"]
[Black "Defender"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

    const result = analyzePgnGame(pgn, { depth: 1 });
    assert.equal(result.totalMoves, 7);
    assert.equal(result.result, '1-0');
    assert.ok(result.accuracy.whiteCaps > 80);
    assert.ok(result.accuracy.blackCaps < 85);
    assert.ok(result.engineStats.totalNodes > 0);
    assert.ok(result.engineStats.transpositionHits > 0);

    const lastMove = result.moves[6];
    assert.equal(lastMove.san, 'Qxf7#');
    assert.ok(lastMove.afterEval >= 19000);
    assert.equal(lastMove.playedBy, 'white');

    const fatalMistake = result.moves[5];
    assert.equal(fatalMistake.san, 'Nf6');
    assert.ok(fatalMistake.afterEval > 10000);
    assert.ok(['blunder', 'mistake', 'miss'].includes(fatalMistake.classification));
    assert.ok(fatalMistake.motifs.length > 0);
  });

  it('invokes streaming onMove callback once per ply in chronological order', () => {
    const pgn = '1. d4 d5 2. c4 e6 3. Nc3 Nf6 1/2-1/2';
    const emittedPlies: number[] = [];

    const result = analyzePgnGame(pgn, {
      depth: 1,
      onMove: (m) => emittedPlies.push(m.ply),
    });

    assert.deepEqual(emittedPlies, [1, 2, 3, 4, 5, 6]);
    assert.equal(result.opening.eco, 'D30');
    assert.equal(result.opening.name, "Queen's Gambit Declined");
  });

  it('hydrates live game SAN arrays with FEN states compatible with OpeningTreeBuilder', () => {
    const moves = hydrateParsedGameMoves(['e4', 'c5', 'Nf3', 'd6']);
    assert.equal(moves.length, 4);
    assert.equal(moves[0].uci, 'e2e4');
    assert.ok(moves[3].fen.length > 20);

    const tree = new OpeningTreeBuilder();
    tree.addGame({
      id: 'hydrated-1',
      url: 'https://example.com/1',
      pgn: '1. e4 c5 2. Nf3 d6 *',
      fen: moves[3].fen,
      white: { username: 'A', rating: 2000, result: 'win' },
      black: { username: 'B', rating: 2000, result: 'loss' },
      timeControl: '180+0',
      timeClass: 'blitz',
      date: '2026-11-25',
      result: '1-0',
      winner: 'white',
      moves,
      platform: 'chesscom',
    });

    const sicilianNode = tree.findNodeByFen(moves[1].fen);
    assert.ok(sicilianNode !== null);
    assert.equal(sicilianNode?.moveSan, 'c5');
    assert.equal(sicilianNode?.whiteWins, 1);
  });
});