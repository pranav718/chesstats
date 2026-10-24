import React from 'react';
import styles from './AccuracyBreakdown.module.css';
import { ChessGame, MoveClassification } from '@/types/chess';
import { CLASSIFICATION_CONFIG } from '@/lib/constants';

interface AccuracyBreakdownProps {
  game: ChessGame;
}

export function AccuracyBreakdown({ game }: AccuracyBreakdownProps) {
  const whiteCounts: Record<MoveClassification, number> = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    miss: 0,
    blunder: 0,
  };

  const blackCounts: Record<MoveClassification, number> = {
    brilliant: 0,
    great: 0,
    best: 0,
    excellent: 0,
    good: 0,
    book: 0,
    inaccuracy: 0,
    mistake: 0,
    miss: 0,
    blunder: 0,
  };

  game.moves.forEach((m) => {
    if (m.playedBy === 'white') {
      whiteCounts[m.classification] = (whiteCounts[m.classification] || 0) + 1;
    } else {
      blackCounts[m.classification] = (blackCounts[m.classification] || 0) + 1;
    }
  });

  const categories: MoveClassification[] = [
    'brilliant',
    'great',
    'best',
    'excellent',
    'good',
    'book',
    'inaccuracy',
    'mistake',
    'miss',
    'blunder',
  ];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Move Precision Breakdown</h3>

      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center', width: '60px' }}>⚪ White</th>
            <th style={{ textAlign: 'left' }}>Move Category</th>
            <th style={{ textAlign: 'center', width: '60px' }}>⚫ Black</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const config = CLASSIFICATION_CONFIG[cat];
            return (
              <tr key={cat}>
                <td className={styles.countCell} style={{ color: whiteCounts[cat] > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                  {whiteCounts[cat]}
                </td>
                <td>
                  <div className={styles.classCell}>
                    <span
                      className={styles.symbolBadge}
                      style={{
                        color: config.color,
                        backgroundColor: config.badgeBg,
                      }}
                    >
                      {config.symbol}
                    </span>
                    <span style={{ color: config.color }}>{config.label}</span>
                  </div>
                </td>
                <td className={styles.countCell} style={{ color: blackCounts[cat] > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                  {blackCounts[cat]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
