'use client';

import React from 'react';
import styles from './EvalBar.module.css';

interface EvalBarProps {
  evaluation: number;
  isMate?: boolean;
  mateIn?: number;
  height?: number | string;
}

export function EvalBar({
  evaluation,
  isMate = false,
  mateIn,
  height = '100%',
}: EvalBarProps) {
  let whitePercent = 50;
  let label = '0.0';

  if (isMate) {
    if (evaluation > 0) {
      whitePercent = 100;
      label = mateIn !== undefined ? `M${mateIn}` : 'M';
    } else {
      whitePercent = 0;
      label = mateIn !== undefined ? `-M${Math.abs(mateIn)}` : '-M';
    }
  } else {
    const clampedCp = Math.max(-1200, Math.min(1200, evaluation));
    whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.0035 * clampedCp)) - 1);
    whitePercent = Math.max(3, Math.min(97, whitePercent));
    
    const evalScore = (evaluation / 100).toFixed(1);
    label = evaluation > 0 ? `+${evalScore}` : evalScore;
  }

  const isWhiteWinning = whitePercent >= 50;

  return (
    <div className={styles.evalBarContainer} style={{ height }}>
      <div className={styles.barTrack}>
        <div
          className={styles.whiteFill}
          style={{ height: `${whitePercent}%` }}
        />

        <span
          className={`${styles.evalText} ${
            isWhiteWinning ? styles.textBottom : styles.textTop
          }`}
        >
          {label}
        </span>
      </div>

      <div className={styles.advantageBadge}>
        {isWhiteWinning ? `⚪ ${label}` : `⚫ ${label}`}
      </div>
    </div>
  );
}
