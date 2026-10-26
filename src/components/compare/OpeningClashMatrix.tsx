import React from 'react';
import styles from './OpeningClashMatrix.module.css';
import { PlayerProfile } from '@/types/chess';

interface OpeningClashMatrixProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
}

export function OpeningClashMatrix({ player1, player2 }: OpeningClashMatrixProps) {
  const clashes = [
    {
      eco: 'B90',
      name: 'Sicilian Defense: Najdorf',
      p1Wins: 6,
      draws: 4,
      p2Wins: 3,
    },
    {
      eco: 'C50',
      name: 'Italian Game: Giuoco Piano',
      p1Wins: 4,
      draws: 5,
      p2Wins: 2,
    },
    {
      eco: 'D37',
      name: "Queen's Gambit Declined",
      p1Wins: 3,
      draws: 7,
      p2Wins: 4,
    },
    {
      eco: 'C65',
      name: 'Ruy Lopez: Berlin Defense',
      p1Wins: 2,
      draws: 8,
      p2Wins: 3,
    },
    {
      eco: 'E60',
      name: "King's Indian Defense",
      p1Wins: 5,
      draws: 2,
      p2Wins: 3,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Opening Repertoire Head-to-Head Clash</h3>
      <span className={styles.subtitle}>
        Direct encounter outcomes when navigating signature opening frameworks
      </span>

      <div className={styles.matrixGrid}>
        {clashes.map((clash) => {
          const total = clash.p1Wins + clash.draws + clash.p2Wins;
          const p1Pct = Math.round((clash.p1Wins / total) * 100);
          const drawPct = Math.round((clash.draws / total) * 100);
          const p2Pct = 100 - p1Pct - drawPct;

          return (
            <div key={clash.eco} className={styles.clashRow}>
              <div className={styles.openingMeta}>
                <span className={styles.ecoTag}>{clash.eco}</span>
                <span className={styles.openingName}>{clash.name}</span>
              </div>

              <div className={styles.barContainer}>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-emerald)', fontWeight: 700, minWidth: '40px' }}>
                  {clash.p1Wins}W
                </span>

                <div className={styles.barTrack}>
                  <div className={styles.p1Bar} style={{ width: `${p1Pct}%` }} />
                  <div className={styles.drawBar} style={{ width: `${drawPct}%` }} />
                  <div className={styles.p2Bar} style={{ width: `${p2Pct}%` }} />
                </div>

                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                  {clash.p2Wins}W
                </span>
              </div>

              <div className={styles.scoreLabel}>
                {clash.p1Wins > clash.p2Wins ? (
                  <span style={{ color: 'var(--brand-emerald)' }}>+{clash.p1Wins - clash.p2Wins} {player1.username}</span>
                ) : clash.p2Wins > clash.p1Wins ? (
                  <span style={{ color: '#3b82f6' }}>+{clash.p2Wins - clash.p1Wins} {player2.username}</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Even</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
