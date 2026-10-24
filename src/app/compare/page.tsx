import React from 'react';
import { getHeadToHead } from '@/lib/chessService';
import { CompareView } from './CompareView';

interface ComparePageProps {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { p1, p2 } = await searchParams;
  const player1 = p1 || 'magnuscarlsen';
  const player2 = p2 || 'hikaru';

  const stats = (await getHeadToHead(player1, player2)) || (await getHeadToHead('magnuscarlsen', 'hikaru'))!;

  return <CompareView stats={stats} />;
}
