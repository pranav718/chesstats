import React from 'react';
import { GRANDMASTERS } from '@/lib/data/grandmasters';
import { LeaderboardView } from './LeaderboardView';

export default function LeaderboardPage() {
  return <LeaderboardView players={GRANDMASTERS} />;
}
