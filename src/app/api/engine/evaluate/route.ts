import { NextResponse } from 'next/server';
import { validateFen, getTurnFromFen } from '@/lib/fenPgn';
import { searchBestMove } from '@/lib/chessSearchEngine';
import { evaluatePositionalFeatures } from '@/lib/positionalEvaluation';
import { formatEngineScore } from '@/lib/engineSimulator';

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const { fen, depth, multiPv } = body as {
      fen?: string;
      depth?: unknown;
      multiPv?: unknown;
    };

    if (!fen || typeof fen !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "fen" property; expected non-empty string' },
        { status: 400 }
      );
    }

    const trimmedFen = fen.trim();
    const fenValidation = validateFen(trimmedFen);
    if (!fenValidation.valid) {
      return NextResponse.json(
        { error: fenValidation.error || 'Provided FEN string is invalid' },
        { status: 422 }
      );
    }

    let parsedDepth = 3;
    if (depth !== undefined) {
      if (typeof depth !== 'number' || isNaN(depth) || depth < 1) {
        return NextResponse.json(
          { error: 'Optional "depth" property must be a positive integer' },
          { status: 400 }
        );
      }
      parsedDepth = Math.min(4, Math.max(1, Math.floor(depth)));
    }

    let parsedMultiPv = 1;
    if (multiPv !== undefined) {
      if (typeof multiPv !== 'number' || isNaN(multiPv) || multiPv < 1) {
        return NextResponse.json(
          { error: 'Optional "multiPv" property must be a positive integer' },
          { status: 400 }
        );
      }
      parsedMultiPv = Math.min(3, Math.max(1, Math.floor(multiPv)));
    }

    const searchResult = searchBestMove(trimmedFen, {
      depth: parsedDepth,
      multiPv: parsedMultiPv,
    });

    const positionalBreakdown = evaluatePositionalFeatures(trimmedFen);
    const turn = getTurnFromFen(trimmedFen);
    const formattedScore = formatEngineScore(searchResult.score);

    return NextResponse.json({
      fen: trimmedFen,
      turn,
      depth: searchResult.depth,
      score: searchResult.score,
      formattedScore,
      bestMove: searchResult.bestMove,
      pv: searchResult.pv,
      candidateMoves: searchResult.candidateMoves,
      positionalBreakdown,
      stats: {
        nodes: searchResult.nodes,
        timeMs: searchResult.timeMs,
        nps: searchResult.nps,
        betaCutoffs: searchResult.stats.betaCutoffs,
        quiescenceNodes: searchResult.stats.quiescenceNodes,
        transpositionHits: searchResult.stats.transpositionHits,
        transpositionCutoffs: searchResult.stats.transpositionCutoffs,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during engine evaluation' },
      { status: 500 }
    );
  }
}