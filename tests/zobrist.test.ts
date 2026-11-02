import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeZobristHash, zobristHashToHex } from '@/lib/zobrist';
import { TranspositionTable } from '@/lib/transpositionTable';
import { STARTING_FEN } from '@/lib/constants';

describe('64-bit Zobrist Hashing and Transposition Cache', () => {
  it('computeZobristHash generates deterministic 64-bit BigInt', () => {
    const hash1 = computeZobristHash(STARTING_FEN);
    const hash2 = computeZobristHash(STARTING_FEN);
    assert.equal(typeof hash1, 'bigint');
    assert.equal(hash1, hash2);
    assert.equal(zobristHashToHex(hash1).length, 16);
  });

  it('transpositions reaching identical board states share identical Zobrist hash', () => {
    const fenAfter1d4Nf62c4 = 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2';
    const fenAfter1c4Nf62d4 = 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2';

    const hashA = computeZobristHash(fenAfter1d4Nf62c4);
    const hashB = computeZobristHash(fenAfter1c4Nf62d4);

    assert.equal(hashA, hashB);
  });

  it('different positions produce distinct hashes', () => {
    const fen1 = STARTING_FEN;
    const fen2 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const fen3 = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';

    const h1 = computeZobristHash(fen1);
    const h2 = computeZobristHash(fen2);
    const h3 = computeZobristHash(fen3);

    assert.notEqual(h1, h2);
    assert.notEqual(h2, h3);
    assert.notEqual(h1, h3);
  });

  it('TranspositionTable accurately stores and retrieves evaluated positions', () => {
    const tt = new TranspositionTable(10);
    tt.set(STARTING_FEN, 18, 25, 'exact', 'e4');

    const entry = tt.get(STARTING_FEN, 14);
    assert.ok(entry !== null);
    assert.equal(entry.score, 25);
    assert.equal(entry.depth, 18);
    assert.equal(entry.bestMove, 'e4');

    const shallowMiss = tt.get(STARTING_FEN, 22);
    assert.equal(shallowMiss, null);
  });

  it('TranspositionTable enforces LRU capacity limits and tracks metrics', () => {
    const tt = new TranspositionTable(2);
    const fenA = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
    const fenB = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1';
    const fenC = 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1';

    tt.set(fenA, 10, 15, 'exact');
    tt.set(fenB, 10, 20, 'exact');
    assert.equal(tt.getMetrics().size, 2);

    tt.set(fenC, 10, 10, 'exact');
    assert.equal(tt.getMetrics().size, 2);

    assert.equal(tt.get(fenA), null);
    assert.ok(tt.get(fenC) !== null);

    const metrics = tt.getMetrics();
    assert.equal(metrics.hits, 1);
    assert.equal(metrics.misses, 1);
    assert.equal(metrics.hitRatePercent, 50);
  });
});
