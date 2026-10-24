import React from 'react';
import Link from 'next/link';
import styles from './FeaturesGrid.module.css';

const FEATURES = [
  {
    icon: '📊',
    title: 'Precision Accuracy & ACPL',
    desc: 'Deep centipawn loss evaluation and move accuracy modeling calibrated to official Grandmaster standards.',
    link: '/analysis',
    linkText: 'Open Game Review',
  },
  {
    icon: '📖',
    title: 'Opening Repertoire Trees',
    desc: 'Uncover your win/loss statistics across dozens of ECO classifications and identify your most punishing variations.',
    link: '/openings',
    linkText: 'Explore Openings',
  },
  {
    icon: '⚡',
    title: 'Tilt & Fatigue Telemetry',
    desc: 'Algorithmically detect session fatigue, late-night rating drops, and time scramble blunder tendencies.',
    link: '/player/magnuscarlsen',
    linkText: 'View Sample Tilt',
  },
  {
    icon: '⚔️',
    title: 'Head-to-Head Comparison',
    desc: 'Simulate head-to-head match histories, opening clash matrices, and rating progression trajectories.',
    link: '/compare',
    linkText: 'Compare Players',
  },
  {
    icon: '🗺️',
    title: 'Square Control Heatmap',
    desc: 'Visualize board spatial dominance, piece traffic density, and critical attack corridors.',
    link: '/heatmap',
    linkText: 'View Board Heatmap',
  },
  {
    icon: '📜',
    title: 'PGN & FEN Studio',
    desc: 'Parse, sanitize, and extract evaluation graphs directly from any raw PGN move text or FEN string.',
    link: '/pgn',
    linkText: 'Launch PGN Studio',
  },
];

export function FeaturesGrid() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.tagline}>Precision Engine</span>
          <h2 className={styles.title}>Everything You Need to Dominate the Board</h2>
          <p className={styles.subtitle}>
            Comprehensive analytical instruments designed for serious club players, coaches, and grandmasters.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((item, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.iconBox}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
              <Link href={item.link} className={styles.cardLink}>
                {item.linkText} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
