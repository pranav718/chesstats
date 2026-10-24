'use client';

import React from 'react';
import styles from './EvalGraph.module.css';
import { MoveAnalysis } from '@/types/chess';
import { chessAudio } from '@/lib/sound';

interface EvalGraphProps {
  moves: MoveAnalysis[];
  currentPly: number;
  onSelectPly: (ply: number) => void;
}

export function EvalGraph({ moves, currentPly, onSelectPly }: EvalGraphProps) {
  if (!moves || moves.length === 0) return null;

  const width = 800;
  const height = 100;
  const midY = height / 2;

  const clampEval = (cp: number) => Math.max(-1000, Math.min(1000, cp));

  const points = moves.map((m, idx) => {
    const x = (idx / Math.max(1, moves.length - 1)) * width;
    const cp = clampEval(m.evaluation);
    const y = midY - (cp / 1000) * (midY - 10);
    return { x, y, move: m };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${midY} L 0 ${midY} Z`;

  const activePoint = points.find((p) => p.move.ply === currentPly);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIdx = Math.round(ratio * (moves.length - 1));
    const selectedMove = moves[targetIdx];
    if (selectedMove) {
      chessAudio.playMove();
      onSelectPly(selectedMove.ply);
    }
  };

  return (
    <div className={styles.graphWrapper}>
      <div className={styles.header}>
        <span>Centipawn Advantage Evolution</span>
        <span>0.0 Equality Axis</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svgBox}
        preserveAspectRatio="none"
        onClick={handleClick}
      >
        <line
          x1="0"
          y1={midY}
          x2={width}
          y2={midY}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeDasharray="4 4"
        />

        <path d={areaD} fill="rgba(16, 185, 129, 0.15)" />
        <path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {points.map((p) => {
          if (p.move.classification === 'blunder') {
            return (
              <circle
                key={p.move.ply}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          }
          if (p.move.classification === 'brilliant') {
            return (
              <circle
                key={p.move.ply}
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#14b8a6"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          }
          return null;
        })}

        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height}
            stroke="#ffffff"
            strokeWidth="2"
          />
        )}
      </svg>

      <div className={styles.legendRow}>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#14b8a6' }} />
          <span>Brilliant Move</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#dc2626' }} />
          <span>Blunder</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#10b981' }} />
          <span>Advantage</span>
        </div>
      </div>
    </div>
  );
}
