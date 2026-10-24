import React from 'react';
import styles from './MoveReviewPanel.module.css';
import { MoveAnalysis } from '@/types/chess';
import { CLASSIFICATION_CONFIG } from '@/lib/constants';
import { evalToWinProbability } from '@/lib/accuracy';

interface MoveReviewPanelProps {
  move?: MoveAnalysis;
}

export function MoveReviewPanel({ move }: MoveReviewPanelProps) {
  if (!move) {
    return (
      <div className={styles.panel}>
        <span style={{ color: 'var(--text-muted)' }}>
          Select any move from the list or board to inspect engine evaluation.
        </span>
      </div>
    );
  }

  const config = CLASSIFICATION_CONFIG[move.classification] || CLASSIFICATION_CONFIG['good'];
  const winProb = Math.round(evalToWinProbability(move.evaluation) * 10) / 10;

  return (
    <div className={styles.panel}>
      <div className={styles.topRow}>
        <span className={styles.moveName}>
          {move.moveNumber}. {move.playedBy === 'white' ? '' : '...'}
          {move.san}
        </span>

        <div
          className={styles.classificationBadge}
          style={{
            backgroundColor: config.badgeBg,
            color: config.color,
            border: `1px solid ${config.color}`,
          }}
        >
          <span>{config.symbol}</span>
          <span>{config.label}</span>
        </div>
      </div>

      <p className={styles.description}>
        {move.commentary || config.description}
      </p>

      <div className={styles.winProbBar}>
        <div className={styles.winProbLabel}>
          <span>White Win Probability</span>
          <span>{winProb}%</span>
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${winProb}%` }} />
        </div>
      </div>

      <div className={styles.engineBox}>
        <div className={styles.engineMeta}>
          <span>Stockfish 16 NNUE</span>
          <span>Depth 26 • 2.4M nodes</span>
        </div>

        <div className={styles.engineLine}>
          <span className={styles.lineLabel}>Engine Best:</span>
          <span className={styles.bestMoveSan}>
            {move.bestMoveSan || move.bestMove || move.san}
          </span>
        </div>
      </div>
    </div>
  );
}
