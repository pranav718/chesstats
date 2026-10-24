'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './PlayerGamesList.module.css';
import { ChessGame } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

interface PlayerGamesListProps {
  games: ChessGame[];
  currentUsername: string;
}

export function PlayerGamesList({ games, currentUsername }: PlayerGamesListProps) {
  const [filter, setFilter] = useState<'all' | 'win' | 'loss' | 'draw'>('all');

  const norm = currentUsername.trim().toLowerCase();

  const filteredGames = games.filter((g) => {
    if (filter === 'all') return true;
    const isWhite = g.white.username.toLowerCase() === norm;
    const playerResult = isWhite ? g.white.result : g.black.result;
    return playerResult === filter;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <h3 className={styles.title}>Recent Game Archive</h3>

        <div className={styles.filters}>
          {(['all', 'win', 'loss', 'draw'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                chessAudio.playMove();
                setFilter(f);
              }}
              className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ''}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gamesTable}>
        {filteredGames.map((game) => {
          const isWhite = game.white.username.toLowerCase() === norm;
          const myResult = isWhite ? game.white.result : game.black.result;
          const opponent = isWhite ? game.black : game.white;
          const myAccuracy = isWhite ? game.accuracy?.white : game.accuracy?.black;

          return (
            <Link
              key={game.id}
              href={`/analysis?game=${game.id}`}
              className={styles.gameRow}
              onClick={() => chessAudio.playMove()}
            >
              <span
                className={`${styles.outcomePill} ${
                  myResult === 'win'
                    ? styles.winPill
                    : myResult === 'loss'
                    ? styles.lossPill
                    : styles.drawPill
                }`}
              >
                {myResult.toUpperCase()}
              </span>

              <div className={styles.gameInfo}>
                <span className={styles.opponent}>
                  vs @{opponent.username} ({opponent.rating})
                </span>
                <span className={styles.opening}>
                  {game.eco ? `[${game.eco}] ` : ''}
                  {game.openingName || 'Standard Game'}
                </span>
              </div>

              <div className={styles.meta}>
                <span>{game.timeControl}</span>
                {myAccuracy && <span className={styles.accuracy}>{myAccuracy}%</span>}
                <span>{game.date}</span>
                <span className={styles.reviewLink}>Review →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
