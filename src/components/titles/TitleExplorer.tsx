import React from 'react';
import styles from './TitleExplorer.module.css';
import { CHESS_TITLES } from '@/lib/titles';

export function TitleExplorer() {
  const titles = Object.values(CHESS_TITLES);

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>FIDE Master Titles & Standards</h1>
        <p className={styles.subtitle}>
          Official rating baselines, norm criteria, and historical title holders certified by the International Chess Federation
        </p>
      </div>

      <div className={styles.grid}>
        {titles.map((t) => (
          <div key={t.code} className={styles.titleCard}>
            <div className={styles.cardHeader}>
              <div className={styles.nameRow}>
                <span
                  className={styles.badge}
                  style={{
                    backgroundColor: t.badgeBg,
                    color: t.badgeColor,
                    border: `1px solid ${t.badgeColor}`,
                  }}
                >
                  {t.code}
                </span>
                <span className={styles.titleName}>{t.name}</span>
              </div>

              <span className={styles.threshold}>{t.ratingThreshold}+ FIDE Elo</span>
            </div>

            <p className={styles.desc}>{t.description}</p>

            <div className={styles.normsBox}>
              <strong style={{ color: '#ffffff' }}>Norm Requirement:</strong> {t.normsRequired}
            </div>

            <div className={styles.holdersRow}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Holders:</span>
              {t.notableHolders.map((name) => (
                <span key={name} className={styles.holderPill}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
