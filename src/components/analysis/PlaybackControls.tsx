'use client';

import React, { useState, useEffect } from 'react';
import styles from './PlaybackControls.module.css';
import { chessAudio } from '@/lib/sound';

interface PlaybackControlsProps {
  currentPly: number;
  totalPlies: number;
  onGoToPly: (ply: number) => void;
  onJumpKeyMoment?: () => void;
  onFlipBoard?: () => void;
}

export function PlaybackControls({
  currentPly,
  totalPlies,
  onGoToPly,
  onJumpKeyMoment,
  onFlipBoard,
}: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1000);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentPly >= totalPlies) {
          setIsPlaying(false);
        } else {
          chessAudio.playMove();
          onGoToPly(currentPly + 1);
        }
      }, speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed, currentPly, totalPlies, onGoToPly]);

  const togglePlay = () => {
    if (currentPly >= totalPlies) {
      onGoToPly(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleStep = (target: number) => {
    setIsPlaying(false);
    chessAudio.playMove();
    onGoToPly(target);
  };

  return (
    <div className={styles.controller}>
      <div className={styles.buttonGroup}>
        <button
          onClick={() => handleStep(0)}
          disabled={currentPly <= 0}
          className={styles.controlBtn}
          title="Start of game"
        >
          |◀
        </button>

        <button
          onClick={() => handleStep(Math.max(0, currentPly - 1))}
          disabled={currentPly <= 0}
          className={styles.controlBtn}
          title="Previous move"
        >
          ◀
        </button>

        <button
          onClick={togglePlay}
          className={`${styles.controlBtn} ${styles.playBtn}`}
          title={isPlaying ? 'Pause' : 'Autoplay'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => handleStep(Math.min(totalPlies, currentPly + 1))}
          disabled={currentPly >= totalPlies}
          className={styles.controlBtn}
          title="Next move"
        >
          ▶
        </button>

        <button
          onClick={() => handleStep(totalPlies)}
          disabled={currentPly >= totalPlies}
          className={styles.controlBtn}
          title="End of game"
        >
          ▶|
        </button>
      </div>

      <div className={styles.buttonGroup}>
        {onJumpKeyMoment && (
          <button
            onClick={() => {
              chessAudio.playMove();
              onJumpKeyMoment();
            }}
            className={styles.keyMomentBtn}
          >
            ⚡ Key Moment
          </button>
        )}

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className={styles.speedToggle}
        >
          <option value={1500}>0.7x</option>
          <option value={1000}>1.0x</option>
          <option value={500}>2.0x</option>
        </select>

        {onFlipBoard && (
          <button
            onClick={onFlipBoard}
            className={styles.controlBtn}
            title="Flip Board"
          >
            🔄
          </button>
        )}
      </div>
    </div>
  );
}
