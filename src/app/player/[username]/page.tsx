import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlayerProfile, getPlayerGames } from '@/lib/chessService';
import { Platform } from '@/types/chess';
import { ProfileHeader } from '@/components/player/ProfileHeader';
import { RatingHistoryChart } from '@/components/player/RatingHistoryChart';
import { ColorBreakdown } from '@/components/player/ColorBreakdown';
import { OpeningStatsTable } from '@/components/player/OpeningStatsTable';
import { TiltAnalyticsView } from '@/components/player/TiltAnalytics';
import { TimeScrambleChart } from '@/components/player/TimeScrambleChart';
import { PlayerGamesList } from '@/components/player/PlayerGamesList';

interface PlayerPageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ platform?: string }>;
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
  const { username } = await params;
  const { platform: rawPlatform } = await searchParams;
  const platform: Platform = rawPlatform === 'lichess' ? 'lichess' : 'chesscom';

  const player = await getPlayerProfile(username, platform);

  if (!player) {
    notFound();
  }

  const games = await getPlayerGames(username, platform);

  return (
    <main style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            ← Back to Overview
          </Link>
        </div>

        <ProfileHeader player={player} />
        <RatingHistoryChart player={player} />
        <ColorBreakdown player={player} />
        <TimeScrambleChart player={player} />
        <TiltAnalyticsView player={player} />
        <OpeningStatsTable player={player} />
        <PlayerGamesList games={games} currentUsername={player.username} />
      </div>
    </main>
  );
}
