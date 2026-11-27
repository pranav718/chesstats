import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as evaluateHandler } from '@/app/api/engine/evaluate/route';

describe('POST /api/engine/evaluate Route Handler', () => {
  it('rejects invalid JSON request payload with 400', async () => {
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Invalid JSON'));
  });

  it('rejects missing or non-string fen with 400', async () => {
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Missing or invalid "fen"'));
  });

  it('rejects malformed FEN structure with 422', async () => {
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fen: 'invalid/fen/notation w - - 0 1' }),
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.ok(data.error !== undefined);
  });

  it('rejects negative or non-integer depth parameter with 400', async () => {
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        depth: -2,
      }),
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 400);
  });

  it('computes evaluation, best move, and positional telemetry for starting position', async () => {
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        depth: 1,
        multiPv: 2,
      }),
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.turn, 'white');
    assert.equal(data.depth, 1);
    assert.equal(typeof data.score, 'number');
    assert.equal(typeof data.formattedScore, 'string');
    assert.ok(data.bestMove !== undefined);
    assert.ok(data.bestMove.from !== undefined);
    assert.ok(data.bestMove.to !== undefined);
    assert.ok(Array.isArray(data.pv));
    assert.ok(Array.isArray(data.candidateMoves));
    assert.equal(data.candidateMoves.length, 2);
    assert.ok(data.positionalBreakdown !== undefined);
    assert.ok(data.stats.nodes > 0);
  });

  it('detects tactical mate-in-1 opportunity and returns decisive score', async () => {
    const mateInOneFen = 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4';
    const req = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: mateInOneFen,
        depth: 2,
      }),
    });
    const res = await evaluateHandler(req);
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.bestMove.uci, 'f3f7');
    assert.ok(data.score > 10000);
    assert.ok(data.stats.depthReached >= 1);
  });

  it('validates maxTimeMs and respects time-budgeted iterative deepening requests', async () => {
    const invalidReq = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        maxTimeMs: -50,
      }),
    });
    const invalidRes = await evaluateHandler(invalidReq);
    assert.equal(invalidRes.status, 400);

    const budgetedReq = new Request('http://localhost:3000/api/engine/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 0 8',
        depth: 5,
        maxTimeMs: 15,
      }),
    });
    const budgetedRes = await evaluateHandler(budgetedReq);
    assert.equal(budgetedRes.status, 200);
    const data = await budgetedRes.json();
    assert.ok(data.stats.depthReached >= 1);
    assert.equal(typeof data.stats.timedOut, 'boolean');
    assert.equal(typeof data.stats.killerCutoffs, 'number');
    assert.equal(typeof data.stats.aspirationResearches, 'number');
    assert.equal(typeof data.positionalBreakdown.gamePhase, 'number');
    assert.equal(typeof data.positionalBreakdown.endgameMopUpScore, 'number');
  });
});