import { NextResponse } from 'next/server';
import { parsePgn } from '@/lib/fenPgn';
import { calculateGameAccuracy } from '@/lib/accuracy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pgn = body.pgn;

    if (!pgn || typeof pgn !== 'string') {
      return NextResponse.json({ error: 'Valid PGN string is required' }, { status: 400 });
    }

    const parsed = parsePgn(pgn);
    const movesWithEval = parsed.moves.map((san, idx) => {
      const isWhite = idx % 2 === 0;
      const fakeBefore = isWhite ? 20 : 35;
      const fakeAfter = isWhite ? 35 : 15;
      return {
        ply: idx + 1,
        moveNumber: Math.floor(idx / 2) + 1,
        san,
        playedBy: isWhite ? ('white' as const) : ('black' as const),
        beforeEval: fakeBefore,
        afterEval: fakeAfter,
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
    return NextResponse.json({ error: 'Failed to analyze game' }, { status: 500 });
  }
}
