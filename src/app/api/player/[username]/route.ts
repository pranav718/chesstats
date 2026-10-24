import { NextResponse } from 'next/server';
import { getPlayerProfile, getPlayerGames } from '@/lib/chessService';
import { Platform } from '@/types/chess';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const platform: Platform = searchParams.get('platform') === 'lichess' ? 'lichess' : 'chesscom';

  const profile = await getPlayerProfile(username, platform);
  if (!profile) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  const games = await getPlayerGames(username, platform);

  return NextResponse.json({
    profile,
    games,
  });
}
