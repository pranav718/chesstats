'use client';

import React from 'react';
import Link from 'next/link';
import styles from './PlayerCard.module.css';
import { PlayerProfile } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

interface PlayerCardProps {
  player: PlayerProfile;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/player/${encodeURIComponent(player.username)}`}
      className={styles.card}
      onClick={() => chessAudio.playMove()}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>
          {player.countryFlag ? player.countryFlag : '♟️'}
        </div>

        <div className={styles.nameInfo}>
          <div className={styles.topRow}>
            {player.title && <span className={styles.titleBadge}>{player.title}</span>}
            <span className={styles.username}>{player.name || player.username}</span>
          </div>
          <span className={styles.country}>
            @{player.username}
          </span>
        </div>
      </div>

      <div className={styles.ratingGrid}>
        <div className={styles.ratingBox}>
          <span className={styles.timeClass}>⚡ Bullet</span>
          <span className={styles.ratingNum}>
            {player.ratings.bullet?.current || '—'}
          </span>
        </div>

        <div className={styles.ratingBox}>
          <span className={styles.timeClass}>🔥 Blitz</span>
          <span className={styles.ratingNum}>
            {player.ratings.blitz?.current || '—'}
          </span>
        </div>

        <div className={styles.ratingBox}>
          <span className={styles.timeClass}>⏱️ Rapid</span>
          <span className={styles.ratingNum}>
            {player.ratings.rapid?.current || '—'}
          </span>
        </div>
      </div>

      <div className={styles.statsFooter}>
        <span className={styles.winRate}>
          {player.overallStats.winRate}% Win Rate
        </span>
        <span className={styles.gamesCount}>
          {player.overallStats.totalGames.toLocaleString()} games
        </span>
      </div>
    </Link>
  );
}
