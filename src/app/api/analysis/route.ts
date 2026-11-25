import { NextResponse } from 'next/server';
import { parsePgn } from '@/lib/fenPgn';
import { analyzePgnGame, PgnReplayError } from '@/lib/pgnAnalyzer';

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 102400) {
      return NextResponse.json(
        { error: 'Payload too large: maximum PGN size is 100KB' },
        { status: 413 }
      );
    }

    let body: { pgn?: unknown; depth?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload: valid JSON required' },
        { status: 400 }
      );
    }

    const pgn = body?.pgn;
    if (!pgn || typeof pgn !== 'string') {
      return NextResponse.json(
        { error: 'Valid non-empty PGN string is required in field "pgn"' },
        { status: 400 }
      );
    }

    if (pgn.length > 102400) {
      return NextResponse.json(
        { error: 'Payload too large: maximum PGN size is 100KB' },
        { status: 413 }
      );
    }

    let parsedDepth = 1;
    if (body?.depth !== undefined) {
      if (typeof body.depth !== 'number' || isNaN(body.depth) || body.depth < 1) {
        return NextResponse.json(
          { error: 'Optional "depth" property must be a positive integer' },
          { status: 400 }
        );
      }
      parsedDepth = Math.min(3, Math.max(1, Math.floor(body.depth)));
    }

    const parsed = parsePgn(pgn);
    if (!parsed.moves || parsed.moves.length === 0) {
      return NextResponse.json(
        { error: 'PGN contains no valid move tokens' },
        { status: 422 }
      );
    }

    try {
      const analysis = analyzePgnGame(pgn, { depth: parsedDepth });
      return NextResponse.json({
        headers: analysis.headers,
        result: analysis.result,
        opening: analysis.opening,
        totalMoves: analysis.totalMoves,
        accuracy: analysis.accuracy,
        engineStats: analysis.engineStats,
        moves: analysis.moves,
      });
    } catch (err) {
      if (err instanceof PgnReplayError) {
        return NextResponse.json(
          { error: err.message, ply: err.ply, token: err.san },
          { status: 422 }
        );
      }
      throw err;
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to process game analysis' },
      { status: 500 }
    );
  }
}