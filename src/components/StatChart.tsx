'use client';

import React, { useState } from 'react';
import styles from './StatChart.module.css';

interface StatPoint {
  label: string;
  value: number;
}

interface StatChartProps {
  data: StatPoint[];
  height?: number;
  color?: string;
  gradientId?: string;
  showMinMax?: boolean;
}

export function StatChart({
  data,
  height = 140,
  color = '#10b981',
  gradientId = 'statGradient',
  showMinMax = true,
}: StatChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<StatPoint | null>(null);

  if (!data || data.length < 2) {
    return null;
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const width = 500;
  const paddingX = 10;
  const paddingY = 16;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * graphWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * graphHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={styles.chartWrapper}>
      {hoveredPoint && (
        <div className={styles.tooltip}>
          {hoveredPoint.label}: <strong>{hoveredPoint.value}</strong>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svgContainer}
        preserveAspectRatio="none"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill={`url(#${gradientId})`} />

        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={color}
            stroke="#0b0f19"
            strokeWidth="2"
            onMouseEnter={() => setHoveredPoint(p.data)}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
          />
        ))}
      </svg>

      {showMinMax && (
        <div className={styles.chartMeta}>
          <span>Low: {minVal}</span>
          <span>{data[data.length - 1]?.label || ''}</span>
          <span>Peak: {maxVal}</span>
        </div>
      )}
    </div>
  );
}
