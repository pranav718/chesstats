import { NextResponse } from 'next/server';
import { parsePgn } from '@/lib/fenPgn';
import { calculateGameAccuracy } from '@/lib/accuracy';
import { evaluatePositionLines } from '@/lib/engineSimulator';
import { STARTING_FEN } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    let body: { pgn?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const pgn = body?.pgn;
    if (!pgn || typeof pgn !== 'string') {
      return NextResponse.json({ error: 'Valid PGN string is required in field "pgn"' }, { status: 400 });
    }

    const parsed = parsePgn(pgn);
    if (!parsed.moves || parsed.moves.length === 0) {
      return NextResponse.json({ error: 'PGN contains no valid move tokens' }, { status: 422 });
    }

    const moves = parsed.moves;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let currentEval = 20;
        const movesWithEval: {
          ply: number;
          moveNumber: number;
          san: string;
          playedBy: 'white' | 'black';
          beforeEval: number;
          afterEval: number;
        }[] = [];

        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              headers: parsed.headers,
              result: parsed.result,
              totalMoves: moves.length,
            })}\n\n`
          )
        );

        for (let idx = 0; idx < moves.length; idx++) {
          const san = moves[idx];
          const isWhite = idx % 2 === 0;
          const before = currentEval;
          const shift = ((idx * 13 + san.length * 7) % 50) - 20;
          currentEval += isWhite ? shift : -shift;
          const after = currentEval;

          const moveObj = {
            ply: idx + 1,
            moveNumber: Math.floor(idx / 2) + 1,
            san,
            playedBy: isWhite ? ('white' as const) : ('black' as const),
            beforeEval: before,
            afterEval: after,
          };
          movesWithEval.push(moveObj);

          const lines = evaluatePositionLines(STARTING_FEN, { depth: 18, multiPv: 1 });
          const topCandidate = lines[0];

          controller.enqueue(
            encoder.encode(
              `event: move\ndata: ${JSON.stringify({
                ply: idx + 1,
                san,
                evaluation: after,
                bestMove: topCandidate?.pv?.[0] || 'e4',
                depth: 18,
                nodes: topCandidate?.nodes || 250000,
              })}\n\n`
            )
          );
        }

        const accuracy = calculateGameAccuracy(movesWithEval);

        controller.enqueue(
          encoder.encode(
            `event: complete\ndata: ${JSON.stringify({
              accuracy,
              totalMoves: moves.length,
              result: parsed.result,
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
