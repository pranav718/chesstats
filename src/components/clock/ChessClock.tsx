'use client';

import React, { useState, useEffect } from 'react';
import styles from './ChessClock.module.css';
import { chessAudio } from '@/lib/sound';

interface TimePreset {
  label: string;
  initialSeconds: number;
  increment: number;
}

const PRESETS: TimePreset[] = [
  { label: '1 | 0', initialSeconds: 60, increment: 0 },
  { label: '3 | 0', initialSeconds: 180, increment: 0 },
  { label: '3 | 2', initialSeconds: 180, increment: 2 },
  { label: '5 | 0', initialSeconds: 300, increment: 0 },
  { label: '10 | 0', initialSeconds: 600, increment: 0 },
  { label: '15 | 10', initialSeconds: 900, increment: 10 },
];

export function ChessClock() {
  const [selectedPreset, setSelectedPreset] = useState<TimePreset>(PRESETS[1]);
  const [whiteTime, setWhiteTime] = useState<number>(180);
  const [blackTime, setBlackTime] = useState<number>(180);
  const [activeSide, setActiveSide] = useState<'white' | 'black' | null>(null);
  const [movesWhite, setMovesWhite] = useState(0);
  const [movesBlack, setMovesBlack] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeSide !== null) {
      interval = setInterval(() => {
        if (activeSide === 'white') {
          setWhiteTime((t) => {
            if (t <= 1) {
              chessAudio.playCheck();
              setActiveSide(null);
              return 0;
            }
            return t - 1;
          });
        } else {
          setBlackTime((t) => {
            if (t <= 1) {
              chessAudio.playCheck();
              setActiveSide(null);
              return 0;
            }
            return t - 1;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSide]);

  const handleSelectPreset = (preset: TimePreset) => {
    setSelectedPreset(preset);
    setWhiteTime(preset.initialSeconds);
    setBlackTime(preset.initialSeconds);
    setActiveSide(null);
    setMovesWhite(0);
    setMovesBlack(0);
  };

  const handleTap = (side: 'white' | 'black') => {
    if (whiteTime <= 0 || blackTime <= 0) return;
    chessAudio.playMove();

    if (side === 'white' && (activeSide === 'white' || activeSide === null)) {
      setWhiteTime((t) => t + selectedPreset.increment);
      setMovesWhite((m) => m + 1);
      setActiveSide('black');
    } else if (side === 'black' && (activeSide === 'black' || activeSide === null)) {
      setBlackTime((t) => t + selectedPreset.increment);
      setMovesBlack((m) => m + 1);
      setActiveSide('white');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePause = () => {
    setActiveSide(null);
  };

  const handleReset = () => {
    handleSelectPreset(selectedPreset);
  };

  return (
    <div className={styles.clockContainer}>
      <div className={styles.controlsBar}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => handleSelectPreset(p)}
            className={`${styles.timeClassPill} ${
              selectedPreset.label === p.label ? styles.activePill : ''
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.dualClocks}>
        <div
          onClick={() => handleTap('white')}
          className={`
            ${styles.clockCard} 
            ${activeSide === 'white' ? styles.activeClock : ''}
            ${whiteTime < 15 && whiteTime > 0 ? styles.urgentClock : ''}
          `}
        >
          <span className={styles.clockName}>White</span>
          <span className={styles.clockDisplay}>{formatTime(whiteTime)}</span>
          <span className={styles.movesCounter}>{movesWhite} moves</span>
        </div>

        <div
          onClick={() => handleTap('black')}
          className={`
            ${styles.clockCard} 
            ${activeSide === 'black' ? styles.activeClock : ''}
            ${blackTime < 15 && blackTime > 0 ? styles.urgentClock : ''}
          `}
        >
          <span className={styles.clockName}>Black</span>
          <span className={styles.clockDisplay}>{formatTime(blackTime)}</span>
          <span className={styles.movesCounter}>{movesBlack} moves</span>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <button onClick={handlePause} className="btn-secondary">
          ⏸ Pause Clock
        </button>
        <button onClick={handleReset} className="btn-secondary">
          🔄 Reset Timer
        </button>
      </div>
    </div>
  );
}
