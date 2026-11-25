import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { POST as streamHandler } from '@/app/api/analysis/stream/route';

describe('Server-Sent Events Streaming Analysis API', () => {
  it('rejects missing or invalid payload with 400', async () => {
    const req = new Request('http://localhost:3000/api/analysis/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await streamHandler(req);
    assert.equal(res.status, 400);
  });

  it('rejects empty moves PGN with 422', async () => {
    const req = new Request('http://localhost:3000/api/analysis/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn: '[Event "No Moves"]\n\n*' }),
    });
    const res = await streamHandler(req);
    assert.equal(res.status, 422);
  });

  it('rejects PGN with illegal moves before streaming with 422', async () => {
    const req = new Request('http://localhost:3000/api/analysis/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn: '1. e4 e5 2. Qxg7# 1-0' }),
    });
    const res = await streamHandler(req);
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.equal(data.ply, 3);
    assert.equal(data.token, 'Qxg7#');
  });

  it('streams progressive move analysis with real FEN progression and complete event over SSE', async () => {
    const pgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 1-0';
    const req = new Request('http://localhost:3000/api/analysis/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn }),
    });

    const res = await streamHandler(req);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('Content-Type')?.includes('text/event-stream'));

    const reader = res.body?.getReader();
    assert.ok(reader !== undefined);

    const decoder = new TextDecoder();
    let accumulated = '';
    let done = false;

    while (!done) {
      const chunk = await reader!.read();
      done = chunk.done;
      if (chunk.value) {
        accumulated += decoder.decode(chunk.value, { stream: !done });
      }
    }

    assert.ok(accumulated.includes('event: meta'));
    assert.ok(accumulated.includes('event: move'));
    assert.ok(accumulated.includes('event: complete'));
    assert.ok(accumulated.includes('"totalMoves":6'));
    assert.ok(accumulated.includes('"accuracy"'));
    assert.ok(accumulated.includes('"engineStats"'));
    assert.ok(accumulated.includes('"eco":"C60"'));
    assert.ok(accumulated.includes('r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R'));
  });
});
