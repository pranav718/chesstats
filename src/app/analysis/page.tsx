import React from 'react';
import { SAMPLE_GAMES, getSampleGameById } from '@/lib/data/sampleGames';
import { AnalysisStudio } from './AnalysisStudio';

interface AnalysisPageProps {
  searchParams: Promise<{ game?: string }>;
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const { game: gameId } = await searchParams;
  const game = (gameId ? getSampleGameById(gameId) : null) || SAMPLE_GAMES[0];

  return <AnalysisStudio game={game} />;
}
