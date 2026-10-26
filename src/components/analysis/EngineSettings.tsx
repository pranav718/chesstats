'use client';

import React, { useState, useEffect } from 'react';
import styles from './EngineSettings.module.css';
import {
  EngineConfig,
  DEFAULT_ENGINE_CONFIG,
  evaluatePositionLines,
  formatEngineScore,
} from '@/lib/engineSimulator';
import { ArrowData } from '@/components/ChessboardArrows';

interface EngineSettingsProps {
  fen: string;
  onArrowsChange?: (arrows: ArrowData[]) => void;
}

export function EngineSettings({ fen, onArrowsChange }: EngineSettingsProps) {
  const [config, setConfig] = useState<EngineConfig>(DEFAULT_ENGINE_CONFIG);

  const lines = evaluatePositionLines(fen, config);

  useEffect(() => {
    if (!onArrowsChange) return;

    if (!config.showArrows) {
      onArrowsChange([]);
      return;
    }

    const colors = ['#10b981', '#3b82f6', '#f59e0b'];
    const arrows: ArrowData[] = lines.map((line, idx) => ({
      from: line.fromSquare,
      to: line.toSquare,
      color: colors[idx % colors.length],
      opacity: idx === 0 ? 0.9 : 0.65,
      dashed: idx > 0,
    }));

    onArrowsChange(arrows);
  }, [fen, config, onArrowsChange, lines]);

  const toggleArrows = () => {
    setConfig((prev) => ({ ...prev, showArrows: !prev.showArrows }));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Neural Engine Analysis</h3>
        <span className={styles.badge}>Depth {config.depth}</span>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.controlGroup}>
          <label className={styles.label}>Search Depth</label>
          <select
            className={styles.select}
            value={config.depth}
            onChange={(e) => setConfig({ ...config, depth: Number(e.target.value) })}
          >
            <option value={14}>14 Plies (Fast)</option>
            <option value={18}>18 Plies (Balanced)</option>
            <option value={22}>22 Plies (Deep)</option>
            <option value={26}>26 Plies (Master)</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.label}>Multi-PV Lines</label>
          <select
            className={styles.select}
            value={config.multiPv}
            onChange={(e) => setConfig({ ...config, multiPv: Number(e.target.value) })}
          >
            <option value={1}>1 Best Line</option>
            <option value={2}>2 Lines</option>
            <option value={3}>3 Lines</option>
          </select>
        </div>
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Display Visual Threat Vectors</span>
        <button
          onClick={toggleArrows}
          className={`${styles.toggleBtn} ${config.showArrows ? styles.toggleOn : styles.toggleOff}`}
        >
          {config.showArrows ? 'Vectors Active' : 'Hidden'}
        </button>
      </div>

      <div className={styles.linesContainer}>
        {lines.map((line) => (
          <div key={line.rank} className={styles.lineCard}>
            <div className={styles.lineTop}>
              <div className={styles.lineMeta}>
                <span
                  className={`${styles.rankBadge} ${
                    line.rank === 1
                      ? styles.rank1
                      : line.rank === 2
                      ? styles.rank2
                      : styles.rank3
                  }`}
                >
                  #{line.rank}
                </span>
                <span
                  className={`${styles.scoreVal} ${
                    line.score >= 0 ? styles.scorePositive : styles.scoreNegative
                  }`}
                >
                  {formatEngineScore(line.score)}
                </span>
              </div>
              <span className={styles.depthMeta}>
                d={line.depth} | {(line.nodes / 1000).toFixed(0)}k nodes
              </span>
            </div>
            <div className={styles.pvSequence}>{line.pv.join(' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
