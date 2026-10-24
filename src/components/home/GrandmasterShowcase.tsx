import React from 'react';
import Link from 'next/link';
import styles from './GrandmasterShowcase.module.css';
import { GRANDMASTERS } from '@/lib/data/grandmasters';
import { PlayerCard } from '@/components/PlayerCard';

export function GrandmasterShowcase() {
  const topGms = GRANDMASTERS.slice(0, 6);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.sectionTitle}>Featured Grandmasters</h2>
            <p className={styles.sectionSubtitle}>
              Real-time rating telemetry and statistical breakdowns of elite chess masters
            </p>
          </div>

          <Link href="/leaderboard" className={styles.viewAllLink}>
            View Global Leaderboard →
          </Link>
        </div>

        <div className={styles.grid}>
          {topGms.map((gm) => (
            <PlayerCard key={gm.username} player={gm} />
          ))}
        </div>
      </div>
    </section>
  );
}
