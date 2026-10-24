'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './LeaderboardView.module.css';
import { PlayerProfile, TimeClass } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

interface LeaderboardViewProps {
  players: PlayerProfile[];
}

export function LeaderboardView({ players }: LeaderboardViewProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<TimeClass | 'fide'>('blitz');

  const filtered = players.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'fide') {
      return (b.fideRating || 0) - (a.fideRating || 0);
    }
    return (b.ratings[sortKey]?.current || 0) - (a.ratings[sortKey]?.current || 0);
  });

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Global Grandmaster Leaderboard</h1>
        <p className={styles.subtitle}>
          Rankings and live performance ratings across Bullet, Blitz, Rapid, and Classical disciplines
        </p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Filter by master name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.sortGroup}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</span>
          {(['blitz', 'bullet', 'rapid', 'fide'] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                chessAudio.playMove();
                setSortKey(key);
              }}
              className={`${styles.sortBtn} ${sortKey === key ? styles.activeSort : ''}`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>#</th>
              <th>Grandmaster</th>
              <th>Country</th>
              <th>Blitz</th>
              <th>Bullet</th>
              <th>Rapid</th>
              <th>FIDE</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => (
              <tr key={p.username} className={styles.row}>
                <td className={styles.rankCell}>#{idx + 1}</td>
                <td>
                  <div className={styles.playerCell}>
                    {p.title && <span className="badge badge-gold">{p.title}</span>}
                    <Link
                      href={`/player/${p.username}`}
                      className={styles.playerLink}
                      onClick={() => chessAudio.playMove()}
                    >
                      {p.name || p.username}
                    </Link>
                  </div>
                </td>
                <td>
                  <span>{p.countryFlag} {p.country}</span>
                </td>
                <td className={styles.ratingCell}>{p.ratings.blitz?.current || '—'}</td>
                <td className={styles.ratingCell}>{p.ratings.bullet?.current || '—'}</td>
                <td className={styles.ratingCell}>{p.ratings.rapid?.current || '—'}</td>
                <td className={styles.ratingCell} style={{ color: 'var(--brand-gold)' }}>
                  {p.fideRating || '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--brand-emerald)', fontWeight: 700 }}>
                  {p.overallStats.winRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
