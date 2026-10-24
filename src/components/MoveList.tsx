'use client';

import React, { useEffect, useRef } from 'react';
import styles from './MoveList.module.css';
import { MoveAnalysis } from '@/types/chess';
import { CLASSIFICATION_CONFIG } from '@/lib/constants';
import { chessAudio } from '@/lib/sound';

interface MoveListProps {
  moves: MoveAnalysis[];
  currentPly: number;
  onSelectPly: (ply: number) => void;
}

export function MoveList({ moves, currentPly, onSelectPly }: MoveListProps) {
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPly]);

  const movePairs: { moveNumber: number; white?: MoveAnalysis; black?: MoveAnalysis }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    const white = moves[i];
    const black = moves[i + 1];
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white,
      black,
    });
  }

  const handleMoveClick = (ply: number) => {
    chessAudio.playMove();
    onSelectPly(ply);
  };

  return (
    <div className={styles.moveListContainer}>
      <div className={styles.header}>
        <span>Move Notation</span>
        <span>{moves.length} plies</span>
      </div>

      <div className={styles.scrollArea}>
        {movePairs.map((pair) => (
          <div key={pair.moveNumber} className={styles.moveRow}>
            <span className={styles.moveNumber}>{pair.moveNumber}.</span>

            {pair.white ? (
              <button
                ref={currentPly === pair.white.ply ? activeBtnRef : null}
                onClick={() => handleMoveClick(pair.white!.ply)}
                className={`${styles.moveBtn} ${
                  currentPly === pair.white.ply ? styles.activeMove : ''
                }`}
              >
                <span>{pair.white.san}</span>
                {pair.white.classification && pair.white.classification !== 'book' && (
                  <span
                    className={styles.classBadge}
                    style={{
                      color: CLASSIFICATION_CONFIG[pair.white.classification]?.color,
                      backgroundColor:
                        CLASSIFICATION_CONFIG[pair.white.classification]?.badgeBg,
                    }}
                  >
                    {CLASSIFICATION_CONFIG[pair.white.classification]?.symbol}
                  </span>
                )}
              </button>
            ) : (
              <div />
            )}

            {pair.black ? (
              <button
                ref={currentPly === pair.black.ply ? activeBtnRef : null}
                onClick={() => handleMoveClick(pair.black!.ply)}
                className={`${styles.moveBtn} ${
                  currentPly === pair.black.ply ? styles.activeMove : ''
                }`}
              >
                <span>{pair.black.san}</span>
                {pair.black.classification && pair.black.classification !== 'book' && (
                  <span
                    className={styles.classBadge}
                    style={{
                      color: CLASSIFICATION_CONFIG[pair.black.classification]?.color,
                      backgroundColor:
                        CLASSIFICATION_CONFIG[pair.black.classification]?.badgeBg,
                    }}
                  >
                    {CLASSIFICATION_CONFIG[pair.black.classification]?.symbol}
                  </span>
                )}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
