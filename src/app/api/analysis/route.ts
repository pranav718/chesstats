import { NextResponse } from 'next/server';
import { parsePgn } from '@/lib/fenPgn';
import { calculateGameAccuracy } from '@/lib/accuracy';

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 102400) {
      return NextResponse.json(
        { error: 'Payload too large: maximum PGN size is 100KB' },
        { status: 413 }
      );
    }

    let body: { pgn?: unknown };
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

    const parsed = parsePgn(pgn);
    if (!parsed.moves || parsed.moves.length === 0) {
      return NextResponse.json(
        { error: 'PGN contains no valid move tokens' },
        { status: 422 }
      );
    }

    let currentEval = 20;
    const movesWithEval = parsed.moves.map((san, idx) => {
      const isWhite = idx % 2 === 0;
      const before = currentEval;
      const shift = ((idx * 17 + san.length * 11) % 60) - 25;
      currentEval += isWhite ? shift : -shift;
      const after = currentEval;

      return {
        ply: idx + 1,
        moveNumber: Math.floor(idx / 2) + 1,
        san,
        playedBy: isWhite ? ('white' as const) : ('black' as const),
        beforeEval: before,
        afterEval: after,
      };
    });

    const accuracy = calculateGameAccuracy(movesWithEval);

    return NextResponse.json({
      headers: parsed.headers,
      result: parsed.result,
      totalMoves: parsed.moves.length,
      accuracy,
      moves: movesWithEval,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process game analysis' },
      { status: 500 }
    );
  }
}
