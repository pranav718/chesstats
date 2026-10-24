'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './HeroSection.module.css';
import { Chessboard } from '@/components/Chessboard';
import { Platform } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

export function HeroSection() {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>('chesscom');
  const [username, setUsername] = useState('');

  const previewFen = '8/1p3k2/p3R1Q1/3Pp3/2r1p2P/1N1n4/PP2q3/1K6 b - - 6 32';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    chessAudio.playMove();
    router.push(`/player/${encodeURIComponent(username.trim().toLowerCase())}?platform=${platform}`);
  };

  const handleQuickPick = (name: string) => {
    setUsername(name);
    chessAudio.playMove();
    router.push(`/player/${encodeURIComponent(name)}?platform=${platform}`);
  };

  return (
    <section className={styles.heroWrapper}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.leftCol}>
          <div className={styles.badgeRow}>
            <span className="badge badge-emerald">Live Telemetry 2.0</span>
            <span className="badge badge-gold">Stockfish 16 Enabled</span>
          </div>

          <h1 className={styles.title}>
            Next-Gen Chess Analytics, <span className={styles.gradientText}>Move Precision</span> & Tilt Radar
          </h1>

          <p className={styles.subtitle}>
            Connect your Chess.com or Lichess account to unlock Grandmaster-grade accuracy metrics, blunder heatmaps, opening repertoire flaws, and time-pressure diagnostics.
          </p>

          <div className={styles.platformTabs}>
            <button
              onClick={() => {
                chessAudio.playMove();
                setPlatform('chesscom');
              }}
              className={`${styles.platformTab} ${platform === 'chesscom' ? styles.activeTab : ''}`}
            >
              ♟️ Chess.com
            </button>
            <button
              onClick={() => {
                chessAudio.playMove();
                setPlatform('lichess');
              }}
              className={`${styles.platformTab} ${platform === 'lichess' ? styles.activeTab : ''}`}
            >
              ♞ Lichess
            </button>
          </div>

          <form onSubmit={handleSearch} className={styles.searchBox}>
            <input
              type="text"
              placeholder={`Enter ${platform === 'chesscom' ? 'Chess.com' : 'Lichess'} username...`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className="btn-primary">
              Analyze Account →
            </button>
          </form>

          <div className={styles.suggestions}>
            <span>Try masters:</span>
            {['magnuscarlsen', 'hikaru', 'gukesh_d', 'alireza2003', 'danielnaroditsky'].map((name) => (
              <button
                key={name}
                onClick={() => handleQuickPick(name)}
                className={styles.suggestPill}
              >
                @{name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.rightCol}>
          <Chessboard
            fen={previewFen}
            lastMoveSquares={['g3', 'g6']}
            checkSquare="f7"
          />
        </div>
      </div>
    </section>
  );
}
