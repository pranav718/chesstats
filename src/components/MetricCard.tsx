import React from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: string;
  delta?: string;
  isPositiveDelta?: boolean;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  delta,
  isPositiveDelta = true,
  subtitle,
}: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {delta && (
          <span
            className={`${styles.delta} ${
              isPositiveDelta ? styles.deltaPos : styles.deltaNeg
            }`}
          >
            {isPositiveDelta ? '↑' : '↓'} {delta}
          </span>
        )}
      </div>

      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
}
