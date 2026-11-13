import { NextResponse } from 'next/server';
import { getPlayerProfile, getPlayerGames, getPlayerTiltAnalytics, computePlayerComprehensiveTelemetry } from '@/lib/chessService';
import { Platform } from '@/types/chess';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    const trimmedUser = username.trim();
    if (trimmedUser.length < 2 || trimmedUser.length > 32) {
      return NextResponse.json(
        { error: 'Username must be between 2 and 32 characters in length' },
        { status: 400 }
      );
    }

    const validUserPattern = /^[a-zA-Z0-9_\-]+$/;
    if (!validUserPattern.test(trimmedUser)) {
      return NextResponse.json(
        { error: 'Username contains invalid characters; alphanumeric, underscore, and dash allowed' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platformParam = searchParams.get('platform');
    if (platformParam && platformParam !== 'chesscom' && platformParam !== 'lichess') {
      return NextResponse.json(
        { error: `Invalid platform "${platformParam}": supported values are "chesscom" or "lichess"` },
        { status: 400 }
      );
    }

    const platform: Platform = platformParam === 'lichess' ? 'lichess' : 'chesscom';

    const profile = await getPlayerProfile(trimmedUser, platform);
    if (!profile) {
      return NextResponse.json({ error: `Player "${trimmedUser}" not found` }, { status: 404 });
    }

    const games = await getPlayerGames(trimmedUser, platform);
    const tilt = getPlayerTiltAnalytics(trimmedUser, games);
    const telemetry = computePlayerComprehensiveTelemetry(trimmedUser, games);

    return NextResponse.json({
      profile,
      games,
      tilt,
      telemetry,
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected internal error occurred while fetching player telemetry' },
      { status: 500 }
    );
  }
}
