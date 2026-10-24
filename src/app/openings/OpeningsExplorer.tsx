'use client';

import React, { useState } from 'react';
import styles from './OpeningsExplorer.module.css';
import { OpeningStats } from '@/types/chess';
import { OpeningTree } from '@/components/openings/OpeningTree';
import { Chessboard } from '@/components/Chessboard';
import { chessAudio } from '@/lib/sound';

interface OpeningsExplorerProps {
  initialOpenings: OpeningStats[];
  defaultEco?: string;
}

export function OpeningsExplorer({ initialOpenings, defaultEco }: OpeningsExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedEco, setSelectedEco] = useState<string>(defaultEco || initialOpenings[0]?.eco || 'B90');

  const filtered = initialOpenings.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.eco.toLowerCase().includes(search.toLowerCase())
  );

  const activeOpening = initialOpenings.find((o) => o.eco === selectedEco) || initialOpenings[0];

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Opening Repertoire & Theory Explorer</h1>
        <p className={styles.subtitle}>
          Master game databases, winning percentages, and critical continuation branches across all ECO codes
        </p>
      </div>

      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Filter by ECO or opening name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebarList}>
          {filtered.map((op) => (
            <div
              key={op.eco}
              onClick={() => {
                chessAudio.playMove();
                setSelectedEco(op.eco);
              }}
              className={`${styles.openingItem} ${selectedEco === op.eco ? styles.activeItem : ''}`}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{op.name}</span>
                <span className={styles.itemEco}>{op.eco}</span>
              </div>
              <span className={styles.itemGames}>
                {op.totalGames.toLocaleString()} games • {op.winRateWhite}% White
              </span>
            </div>
          ))}
        </div>

        {activeOpening && (
          <div className={styles.detailCard}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-gold">{activeOpening.eco}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeOpening.name}
                </h2>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Master Database: {activeOpening.totalGames.toLocaleString()} Recorded Matches
              </span>
            </div>

            <div className={styles.movesRow}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                Line:
              </span>
              {activeOpening.movesSan.map((move, i) => (
                <span key={i} className={styles.movePill}>
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}
                  {move}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '2rem', alignItems: 'start' }}>
              <Chessboard />
              <OpeningTree opening={activeOpening} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
