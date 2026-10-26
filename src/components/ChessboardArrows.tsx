'use client';

import React from 'react';
import styles from './ChessboardArrows.module.css';

export interface ArrowData {
  from: string;
  to: string;
  color?: string;
  opacity?: number;
  dashed?: boolean;
}

interface ChessboardArrowsProps {
  arrows?: ArrowData[];
  orientation?: 'white' | 'black';
}

function getSquareCenter(square: string, orientation: 'white' | 'black'): { x: number; y: number } | null {
  if (!square || square.length < 2) return null;
  const fileChar = square[0].toLowerCase();
  const rankNum = parseInt(square[1], 10);
  if (isNaN(rankNum) || rankNum < 1 || rankNum > 8) return null;

  const fileIdx = fileChar.charCodeAt(0) - 97;
  if (fileIdx < 0 || fileIdx > 7) return null;

  const col = orientation === 'white' ? fileIdx : 7 - fileIdx;
  const row = orientation === 'white' ? 8 - rankNum : rankNum - 1;

  return {
    x: col * 100 + 50,
    y: row * 100 + 50,
  };
}

export function ChessboardArrows({ arrows = [], orientation = 'white' }: ChessboardArrowsProps) {
  if (!arrows || arrows.length === 0) return null;

  return (
    <svg className={styles.arrowOverlay} viewBox="0 0 800 800">
      <defs>
        <marker
          id="arrowhead-green"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
        </marker>
        <marker
          id="arrowhead-red"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
        </marker>
        <marker
          id="arrowhead-blue"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
        </marker>
        <marker
          id="arrowhead-amber"
          markerWidth="6"
          markerHeight="6"
          refX="4"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
        </marker>
      </defs>
      {arrows.map((arr, idx) => {
        const start = getSquareCenter(arr.from, orientation);
        const end = getSquareCenter(arr.to, orientation);
        if (!start || !end) return null;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;

        const shorten = 28;
        const targetX = end.x - (dx / dist) * shorten;
        const targetY = end.y - (dy / dist) * shorten;

        const color = arr.color || '#10b981';
        let markerId = 'arrowhead-green';
        if (color.includes('ef4444') || color === 'red') markerId = 'arrowhead-red';
        else if (color.includes('3b82f6') || color === 'blue') markerId = 'arrowhead-blue';
        else if (color.includes('f59e0b') || color === 'amber' || color === 'yellow') markerId = 'arrowhead-amber';

        return (
          <line
            key={`${arr.from}-${arr.to}-${idx}`}
            x1={start.x}
            y1={start.y}
            x2={targetX}
            y2={targetY}
            stroke={color}
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={arr.dashed ? '12 8' : undefined}
            opacity={arr.opacity ?? 0.85}
            markerEnd={`url(#${markerId})`}
          />
        );
      })}
    </svg>
  );
}
