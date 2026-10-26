import React from 'react';
import styles from './BlunderMotifs.module.css';
import { ChessGame } from '@/types/chess';

interface BlunderMotifsProps {
  game: ChessGame;
}

export function BlunderMotifs({ game }: BlunderMotifsProps) {
  const blunderCount = game.moves.filter((m) => m.classification === 'blunder').length;
  const mistakeCount = game.moves.filter((m) => m.classification === 'mistake').length;
  const missCount = game.moves.filter((m) => m.classification === 'miss').length;

  const motifs = [
    {
      name: 'Hanging Pieces & Undefended Units',
      icon: '♟️',
      count: Math.min(blunderCount, 2),
      severity: blunderCount > 0 ? 'danger' : 'zero',
    },
    {
      name: 'Knight Fork Vulnerabilities',
      icon: '♞',
      count: Math.min(mistakeCount, 1),
      severity: mistakeCount > 0 ? 'warning' : 'zero',
    },
    {
      name: 'Pin & Diagonal Alignment Oversights',
      icon: '♝',
      count: Math.min(missCount, 2),
      severity: missCount > 0 ? 'warning' : 'zero',
    },
    {
      name: 'Back-Rank Air (Luft) Deficits',
      icon: '🏰',
      count: game.winReason === 'checkmate' ? 1 : 0,
      severity: game.winReason === 'checkmate' ? 'danger' : 'zero',
    },
    {
      name: 'Overextended Pawn Formations',
      icon: '⚔️',
      count: Math.max(0, mistakeCount - 1),
      severity: mistakeCount > 1 ? 'warning' : 'zero',
    },
  ];

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Tactical Blunder Motifs</h3>
      <span className={styles.subtitle}>Motif classification of errors detected by the engine</span>

      <div className={styles.grid}>
        {motifs.map((motif) => (
          <div key={motif.name} className={styles.motifRow}>
            <div className={styles.motifInfo}>
              <span className={styles.motifIcon}>{motif.icon}</span>
              <span className={styles.motifName}>{motif.name}</span>
            </div>

            <span
              className={`${styles.countBadge} ${
                motif.severity === 'danger'
                  ? styles.countDanger
                  : motif.severity === 'warning'
                  ? styles.countWarning
                  : styles.countZero
              }`}
            >
              {motif.count === 0 ? 'Clean' : `${motif.count} Detected`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
