import React from 'react';
import Link from 'next/link';
import styles from './OpeningStatsTable.module.css';
import { PlayerProfile } from '@/types/chess';
import { OPENINGS_DATA } from '@/lib/data/openings';

interface OpeningStatsTableProps {
  player: PlayerProfile;
}

export function OpeningStatsTable({ player }: OpeningStatsTableProps) {
  const hash = player.username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const openingsList = OPENINGS_DATA.slice(0, 6).map((op, idx) => {
    const games = Math.round(120 + ((hash * (idx + 1)) % 450));
    const winRate = Math.min(88, Math.max(38, Math.round(player.overallStats.winRate + (((hash + idx) % 20) - 10))));
    const accuracy = Math.round((82 + ((hash + idx * 3) % 12)) * 10) / 10;
    return {
      ...op,
      userGames: games,
      userWinRate: winRate,
      userAccuracy: accuracy,
    };
  });

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Repertoire & Opening Performance</h3>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ECO</th>
            <th>Opening</th>
            <th>Games</th>
            <th>Win Rate</th>
            <th>Master Benchmark</th>
            <th>Avg Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {openingsList.map((op) => (
            <tr key={op.eco} className={styles.row}>
              <td>
                <span className={styles.ecoBadge}>{op.eco}</span>
              </td>
              <td>
                <Link href={`/openings?eco=${op.eco}`} className={styles.openingLink}>
                  {op.name}
                </Link>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{op.userGames}</td>
              <td>
                <span
                  className={
                    op.userWinRate >= 60
                      ? styles.winRateHigh
                      : op.userWinRate >= 48
                      ? styles.winRateMed
                      : styles.winRateLow
                  }
                >
                  {op.userWinRate}%
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {op.winRateWhite}% W / {op.drawRate}% D
              </td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{op.userAccuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
