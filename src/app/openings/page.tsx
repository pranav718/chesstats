import React from 'react';
import { getAllOpenings } from '@/lib/data/openings';
import { OpeningsExplorer } from './OpeningsExplorer';

interface OpeningsPageProps {
  searchParams: Promise<{ eco?: string }>;
}

export default async function OpeningsPage({ searchParams }: OpeningsPageProps) {
  const { eco } = await searchParams;
  const openings = getAllOpenings();

  return <OpeningsExplorer initialOpenings={openings} defaultEco={eco} />;
}
