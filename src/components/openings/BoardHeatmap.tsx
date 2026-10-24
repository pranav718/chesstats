'use client';

import React, { useState } from 'react';
import styles from './BoardHeatmap.module.css';
import { ALL_SQUARES } from '@/lib/constants';
import { chessAudio } from '@/lib/sound';

export function BoardHeatmap() {
  const [mode, setMode] = useState<'control' | 'tactics' | 'outposts'>('control');
  const [hoveredSquare, setHoveredSquare] = useState<string | null>(null);

  const getHeatValue = (square: string): number => {
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1], 10) - 1;

    if (mode === 'control') {
      const distFromCenter = Math.abs(file - 3.5) + Math.abs(rank - 3.5);
      return Math.max(10, Math.round(100 - distFromCenter * 14));
    }
    if (mode === 'tactics') {
      if (['f7', 'f2', 'e4', 'd5', 'c7', 'g7'].includes(square)) return 95;
      if (['e5', 'd4', 'c5', 'f5'].includes(square)) return 80;
      return 25;
    }
    if (['d5', 'e5', 'c4', 'd4', 'f4', 'e6'].includes(square)) return 90;
    return 20;
  };

  const getColor = (val: number) => {
    if (val >= 80) return 'rgba(239, 68, 68, 0.75)';
    if (val >= 60) return 'rgba(245, 158, 11, 0.65)';
    if (val >= 40) return 'rgba(16, 185, 129, 0.55)';
    return 'rgba(30, 41, 59, 0.45)';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.heatmapGrid}>
        {ALL_SQUARES.map((square) => {
          const val = getHeatValue(square);
          const color = getColor(val);

          return (
            <div
              key={square}
              className={styles.cell}
              style={{ backgroundColor: color }}
              onMouseEnter={() => setHoveredSquare(square)}
              onMouseLeave={() => setHoveredSquare(null)}
              onClick={() => chessAudio.playMove()}
            >
              <span className={styles.cellLabel}>{square}</span>
              <span className={styles.valLabel}>{val}%</span>
            </div>
          );
        })}
      </div>

      <div className={styles.controls}>
        <div>
          <button
            onClick={() => {
              chessAudio.playMove();
              setMode('control');
            }}
            className={`${styles.filterBtn} ${mode === 'control' ? styles.activeFilter : ''}`}
          >
            Spatial Control
          </button>
          <button
            onClick={() => {
              chessAudio.playMove();
              setMode('tactics');
            }}
            className={`${styles.filterBtn} ${mode === 'tactics' ? styles.activeFilter : ''}`}
          >
            Attack Density
          </button>
          <button
            onClick={() => {
              chessAudio.playMove();
              setMode('outposts');
            }}
            className={`${styles.filterBtn} ${mode === 'outposts' ? styles.activeFilter : ''}`}
          >
            Outpost Value
          </button>
        </div>

        {hoveredSquare && (
          <span style={{ fontSize: '0.8rem', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
            Square {hoveredSquare}: <strong>{getHeatValue(hoveredSquare)}%</strong>
          </span>
        )}
      </div>
    </div>
  );
}
