import React from 'react';
import styles from './OpeningTree.module.css';
import { OpeningStats } from '@/types/chess';

interface OpeningTreeProps {
  opening: OpeningStats;
  onSelectMove?: (san: string) => void;
}

export function OpeningTree({ opening, onSelectMove }: OpeningTreeProps) {
  const replies = opening.popularReplies || [
    { san: 'c5', games: 120000, whiteWinsPercent: 38, drawsPercent: 34, blackWinsPercent: 28 },
    { san: 'e5', games: 98000, whiteWinsPercent: 40, drawsPercent: 35, blackWinsPercent: 25 },
    { san: 'e6', games: 45000, whiteWinsPercent: 41, drawsPercent: 33, blackWinsPercent: 26 },
  ];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Grandmaster Continuation Tree</h3>

      <div className={styles.movesList}>
        {replies.map((reply) => (
          <div
            key={reply.san}
            className={styles.moveItem}
            onClick={() => onSelectMove && onSelectMove(reply.san)}
            style={{ cursor: onSelectMove ? 'pointer' : 'default' }}
          >
            <span className={styles.moveSan}>{reply.san}</span>
            <span className={styles.gamesCount}>
              {reply.games.toLocaleString()} games
            </span>

            <div className={styles.barTrack}>
              <div className={styles.whiteBar} style={{ width: `${reply.whiteWinsPercent}%` }} />
              <div className={styles.drawBar} style={{ width: `${reply.drawsPercent}%` }} />
              <div className={styles.blackBar} style={{ width: `${reply.blackWinsPercent}%` }} />
            </div>

            <div className={styles.percentages}>
              <span>⚪ {reply.whiteWinsPercent}%</span>
              <span>• {reply.drawsPercent}%</span>
              <span>⚫ {reply.blackWinsPercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
