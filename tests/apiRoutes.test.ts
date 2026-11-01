import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as analysisHandler } from '@/app/api/analysis/route';
import { GET as playerHandler } from '@/app/api/player/[username]/route';
import { GET as healthHandler } from '@/app/api/health/route';

describe('Backend API Routes and Validation Handlers', () => {
  it('GET /api/health returns operational status and timestamp', async () => {
    const res = await healthHandler();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'chesstats-api');
    assert.ok(typeof data.uptimeSeconds === 'number');
    assert.ok(typeof data.timestamp === 'string');
  });

  it('POST /api/analysis validates payload presence and rejects missing pgn', async () => {
    const reqEmpty = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const resEmpty = await analysisHandler(reqEmpty);
    assert.equal(resEmpty.status, 400);
    const dataEmpty = await resEmpty.json();
    assert.ok(dataEmpty.error.includes('Valid non-empty PGN'));

    const reqMalformed = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json{',
    });
    const resMalformed = await analysisHandler(reqMalformed);
    assert.equal(resMalformed.status, 400);
    const dataMalformed = await resMalformed.json();
    assert.ok(dataMalformed.error.includes('Malformed JSON'));
  });

  it('POST /api/analysis rejects empty move PGNs with 422', async () => {
    const req = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn: '[Event "Empty"]\n\n*' }),
    });
    const res = await analysisHandler(req);
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.ok(data.error.includes('no valid move tokens'));
  });

  it('POST /api/analysis computes accuracy metrics for valid game PGN', async () => {
    const pgn = `[Event "Live Chess"]
[White "PlayerA"]
[Black "PlayerB"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 1-0`;

    const req = new Request('http://localhost:3000/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn }),
    });
    const res = await analysisHandler(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalMoves, 8);
    assert.ok(data.accuracy.whiteAccuracy > 0);
    assert.ok(data.accuracy.blackAccuracy > 0);
    assert.equal(data.moves.length, 8);
  });

  it('GET /api/player/[username] validates username format and constraints', async () => {
    const reqShort = new Request('http://localhost:3000/api/player/x');
    const resShort = await playerHandler(reqShort, { params: Promise.resolve({ username: 'x' }) });
    assert.equal(resShort.status, 400);

    const reqBadChars = new Request('http://localhost:3000/api/player/user%20name!');
    const resBadChars = await playerHandler(reqBadChars, { params: Promise.resolve({ username: 'user name!' }) });
    assert.equal(resBadChars.status, 400);

    const reqBadPlatform = new Request('http://localhost:3000/api/player/magnus?platform=unknownplatform');
    const resBadPlatform = await playerHandler(reqBadPlatform, { params: Promise.resolve({ username: 'magnus' }) });
    assert.equal(resBadPlatform.status, 400);
  });

  it('GET /api/player/[username] returns profile and games for grandmaster', async () => {
    const req = new Request('http://localhost:3000/api/player/magnuscarlsen?platform=chesscom');
    const res = await playerHandler(req, { params: Promise.resolve({ username: 'magnuscarlsen' }) });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.profile.username, 'magnuscarlsen');
    assert.ok(Array.isArray(data.games));
    assert.ok(data.tilt !== undefined);
    assert.ok(data.tilt.score >= 0);
  });
});
