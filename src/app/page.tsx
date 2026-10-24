import React from 'react';
import styles from './page.module.css';
import { HeroSection } from '@/components/home/HeroSection';
import { GrandmasterShowcase } from '@/components/home/GrandmasterShowcase';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { RecentGamesSpotlight } from '@/components/home/RecentGamesSpotlight';
import { MetricCard } from '@/components/MetricCard';

export default function HomePage() {
  return (
    <main className={styles.mainContainer}>
      <HeroSection />

      <section className={styles.statsBanner}>
        <div className={`container ${styles.statsGrid}`}>
          <MetricCard
            title="Monitored Games"
            value="14.8M+"
            icon="♟️"
            delta="124k this week"
            isPositiveDelta={true}
            subtitle="Analyzed across platforms"
          />
          <MetricCard
            title="Avg CAPS Accuracy"
            value="84.2%"
            icon="🎯"
            delta="+1.4%"
            isPositiveDelta={true}
            subtitle="Community precision benchmark"
          />
          <MetricCard
            title="Opening ECO Profiles"
            value="2,480"
            icon="📖"
            subtitle="With win rate continuations"
          />
          <MetricCard
            title="Tilt Detection Speed"
            value="< 50ms"
            icon="⚡"
            subtitle="Real-time session alert radar"
          />
        </div>
      </section>

      <GrandmasterShowcase />
      <FeaturesGrid />
      <RecentGamesSpotlight />
    </main>
  );
}
