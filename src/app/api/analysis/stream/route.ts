import { NextResponse } from 'next/server';
import { parsePgn } from '@/lib/fenPgn';
import { STARTING_FEN } from '@/lib/constants';
import { classifyOpening } from '@/lib/ecoClassifier';
import { analyzePgnGame, replayPgnMoves, PgnReplayError } from '@/lib/pgnAnalyzer';

export async function POST(request: Request) {
  try {
    let body: { pgn?: unknown; depth?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const pgn = body?.pgn;
    if (!pgn || typeof pgn !== 'string') {
      return NextResponse.json({ error: 'Valid PGN string is required in field "pgn"' }, { status: 400 });
    }

    let parsedDepth = 1;
    if (body?.depth !== undefined) {
      if (typeof body.depth !== 'number' || isNaN(body.depth) || body.depth < 1) {
        return NextResponse.json({ error: 'Optional "depth" property must be a positive integer' }, { status: 400 });
      }
      parsedDepth = Math.min(3, Math.max(1, Math.floor(body.depth)));
    }

    const parsed = parsePgn(pgn);
    if (!parsed.moves || parsed.moves.length === 0) {
      return NextResponse.json({ error: 'PGN contains no valid move tokens' }, { status: 422 });
    }

    const initialFen = parsed.headers['FEN'] || STARTING_FEN;
    try {
      replayPgnMoves(parsed.moves, initialFen);
    } catch (err) {
      if (err instanceof PgnReplayError) {
        return NextResponse.json(
          { error: err.message, ply: err.ply, token: err.san },
          { status: 422 }
        );
      }
      throw err;
    }

    const opening = classifyOpening(parsed.moves);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              headers: parsed.headers,
              result: parsed.result,
              totalMoves: parsed.moves.length,
              opening,
            })}\n\n`
          )
        );

        const analysis = analyzePgnGame(pgn, {
          depth: parsedDepth,
          onMove: (move) => {
            controller.enqueue(
              encoder.encode(
                `event: move\ndata: ${JSON.stringify({
                  ply: move.ply,
                  san: move.san,
                  uci: move.uci,
                  fen: move.fen,
                  evaluation: move.evaluation,
                  bestMove: move.bestMoveSan,
                  classification: move.classification,
                  motifs: move.motifs,
                  depth: parsedDepth,
                  nodes: move.nodes,
                })}\n\n`
              )
            );
          },
        });

        controller.enqueue(
          encoder.encode(
            `event: complete\ndata: ${JSON.stringify({
              accuracy: analysis.accuracy,
              opening: analysis.opening,
              engineStats: analysis.engineStats,
              totalMoves: analysis.totalMoves,
              result: analysis.result,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to initialize analysis stream' }, { status: 500 });
  }
}