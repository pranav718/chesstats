import React from 'react';
import styles from './TiltAnalytics.module.css';
import { PlayerProfile } from '@/types/chess';
import { getPlayerTiltAnalytics } from '@/lib/chessService';

interface TiltAnalyticsProps {
  player: PlayerProfile;
}

export function TiltAnalyticsView({ player }: TiltAnalyticsProps) {
  const tilt = getPlayerTiltAnalytics(player.username);

  const getLevelBadge = () => {
    switch (tilt.level) {
      case 'severe':
        return <span className="badge badge-red">Severe Tilt Risk</span>;
      case 'high':
        return <span className="badge badge-gold">High Tilt Tendency</span>;
      case 'moderate':
        return <span className="badge badge-blue">Moderate Variance</span>;
      default:
        return <span className="badge badge-emerald">Optimal Focus</span>;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Psychological & Tilt Telemetry</h3>
          <span className={styles.subtitle}>Fatigue indicators, streak momentum and clock panic rates</span>
        </div>
        {getLevelBadge()}
      </div>

      <div className={styles.grid}>
        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Tilt Index</span>
          <span className={styles.metricValue}>{tilt.score} / 100</span>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Momentum Streak</span>
          <span className={styles.metricValue} style={{ color: tilt.currentStreak.type === 'win' ? '#10b981' : '#dc2626' }}>
            {tilt.currentStreak.count} {tilt.currentStreak.type.toUpperCase()}S
          </span>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Clock Panic Blunders</span>
          <span className={styles.metricValue}>{tilt.timeTroubleBlunderRate}%</span>
        </div>

        <div className={styles.metricBox}>
          <span className={styles.metricLabel}>Vulnerable Hours</span>
          <span className={styles.metricValue} style={{ fontSize: '1rem', marginTop: '0.2rem' }}>
            {tilt.peakTiltHours[0]}
          </span>
        </div>
      </div>

      <div className={styles.adviceBox}>
        <span className={styles.adviceIcon}>🧠</span>
        <div>
          <strong>Coach Recommendation:</strong> {tilt.advice}
        </div>
      </div>
    </div>
  );
}
