import React from 'react';
import styles from './HeatmapPage.module.css';
import { BoardHeatmap } from '@/components/openings/BoardHeatmap';
import { MetricCard } from '@/components/MetricCard';

export default function HeatmapPage() {
  return (
    <main className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Square Dominance & Tactical Density Heatmap</h1>
        <p className={styles.subtitle}>
          Spatial analysis measuring piece landing frequencies, central outposts, and king-safety vulnerabilities
        </p>
      </div>

      <div className={styles.layout}>
        <BoardHeatmap />

        <div className={styles.infoColumn}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MetricCard
              title="Center Control (d4/e4/d5/e5)"
              value="52.4%"
              icon="🎯"
              delta="+4.1%"
              subtitle="Dominant central territory"
            />
            <MetricCard
              title="Outpost Utilization"
              value="38.7%"
              icon="🏰"
              subtitle="c4, d5, e5 squares"
            />
          </div>

          <div className={styles.guideCard}>
            <h3 className={styles.cardTitle}>Spatial Dominance Principles</h3>
            <p className={styles.text}>
              Grandmaster play is fundamentally dictated by square control rather than passive piece placement. Controlling the key central squares (d4, e4, d5, e5) allows knights to exert maximum fork threats and opens files for rooks and queens.
            </p>

            <div className={styles.statRow}>
              <span>Critical King Flank Weakness</span>
              <strong style={{ color: '#ef4444' }}>f7 / f2 vulnerability: 78%</strong>
            </div>

            <div className={styles.statRow}>
              <span>Knight Outpost Power Rating</span>
              <strong style={{ color: 'var(--brand-emerald)' }}>d5 / e5: +1.4 Pawns</strong>
            </div>

            <div className={styles.statRow}>
              <span>Open C-File Infiltration</span>
              <strong style={{ color: '#60a5fa' }}>c2 / c7 entry: 64%</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
