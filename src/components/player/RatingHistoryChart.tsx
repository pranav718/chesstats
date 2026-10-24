'use client';

import React, { useState } from 'react';
import styles from './RatingHistoryChart.module.css';
import { PlayerProfile, TimeClass } from '@/types/chess';
import { StatChart } from '@/components/StatChart';
import { chessAudio } from '@/lib/sound';

interface RatingHistoryChartProps {
  player: PlayerProfile;
}

export function RatingHistoryChart({ player }: RatingHistoryChartProps) {
  const [selectedTc, setSelectedTc] = useState<TimeClass>('blitz');

  const baseRating = player.ratings[selectedTc]?.current || 2400;
  const peakRating = player.ratings[selectedTc]?.highest || baseRating + 50;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map((m, idx) => {
    const wave = Math.sin(idx * 0.8) * 35;
    const progress = (idx / 11) * (baseRating - (baseRating - 70));
    const value = Math.round(baseRating - 70 + progress + wave);
    return {
      label: m,
      value: Math.min(peakRating, Math.max(value, baseRating - 120)),
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Rating Progression History</h3>
          <span className={styles.subtitle}>12-Month Performance Trajectory</span>
        </div>

        <div className={styles.controls}>
          {(['bullet', 'blitz', 'rapid'] as TimeClass[]).map((tc) => (
            <button
              key={tc}
              onClick={() => {
                chessAudio.playMove();
                setSelectedTc(tc);
              }}
              className={`${styles.toggleBtn} ${
                selectedTc === tc ? styles.activeToggle : ''
              }`}
            >
              {tc.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <StatChart data={data} height={180} color="#10b981" gradientId="ratingProgGrad" />
    </div>
  );
}
