'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './CompareView.module.css';
import { HeadToHeadStats } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

interface CompareViewProps {
  stats: HeadToHeadStats;
}

export function CompareView({ stats }: CompareViewProps) {
  const [p1, setP1] = useState(stats.player1.username);
  const [p2, setP2] = useState(stats.player2.username);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1 && p2) {
      chessAudio.playMove();
      window.location.href = `/compare?p1=${encodeURIComponent(p1)}&p2=${encodeURIComponent(p2)}`;
    }
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Head-to-Head Rivalry Analyzer</h1>
        <p className={styles.subtitle}>
          Compare any two players across all formats, lifetime records, and head-to-head match histories
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.selectorRow}>
        <input
          type="text"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          className={styles.playerInput}
          placeholder="Player 1 username"
        />

        <span className={styles.vsPill}>VS</span>

        <input
          type="text"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          className={styles.playerInput}
          placeholder="Player 2 username"
        />

        <button type="submit" className="btn-primary">
          Compare →
        </button>
      </form>

      <div className={styles.scoreBanner}>
        <div className={styles.playerSide}>
          <span className={styles.playerName}>
            {stats.player1.name || stats.player1.username}
          </span>
          <span className="badge badge-emerald">@{stats.player1.username}</span>
          <span className={styles.winScore}>{stats.player1Wins}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Victories</span>
        </div>

        <div className={styles.middleScore}>
          <span className={styles.drawScore}>{stats.draws} Draws</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {stats.totalGames} Total Matches
          </span>
        </div>

        <div className={styles.playerSide}>
          <span className={styles.playerName}>
            {stats.player2.name || stats.player2.username}
          </span>
          <span className="badge badge-blue">@{stats.player2.username}</span>
          <span className={styles.winScore} style={{ color: '#3b82f6' }}>
            {stats.player2Wins}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Victories</span>
        </div>
      </div>

      <div className={styles.matchList}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
          Head-to-Head Encounter Log
        </h3>

        {stats.recentGames.map((game) => (
          <div
            key={game.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'var(--bg-glass-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <span style={{ fontWeight: 600, color: '#ffffff', marginRight: '0.75rem' }}>
                {game.white.username} ({game.result}) {game.black.username}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {game.eco ? `[${game.eco}] ` : ''}
                {game.openingName}
              </span>
            </div>

            <Link
              href={`/analysis?game=${game.id}`}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Review Game →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
