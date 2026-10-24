'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './PgnStudio.module.css';
import { parsePgn } from '@/lib/fenPgn';
import { Chessboard } from '@/components/Chessboard';
import { SAMPLE_GAMES } from '@/lib/data/sampleGames';
import { chessAudio } from '@/lib/sound';

export function PgnStudio() {
  const [pgnText, setPgnText] = useState(SAMPLE_GAMES[0].pgn);
  const [copied, setCopied] = useState(false);

  const parsed = parsePgn(pgnText);

  const handleCopy = () => {
    navigator.clipboard.writeText(pgnText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    chessAudio.playMove();
    setPgnText(SAMPLE_GAMES[0].pgn);
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>PGN & FEN Syntax Studio</h1>
        <p className={styles.subtitle}>
          Parse, validate, and inspect Portable Game Notation headers and move tokens in real time
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.editorCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              Raw PGN Input
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {parsed.moves.length} moves detected
            </span>
          </div>

          <textarea
            value={pgnText}
            onChange={(e) => setPgnText(e.target.value)}
            className={styles.textarea}
            placeholder="Paste raw PGN move text here..."
          />

          <div className={styles.buttonRow}>
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? '✓ Copied!' : '📋 Copy PGN'}
            </button>
            <button onClick={handleLoadSample} className="btn-secondary">
              ⚡ Load Sample Game
            </button>
            <Link href="/analysis" className="btn-primary">
              Launch in Game Review Studio →
            </Link>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Parsed PGN Headers
            </h4>
            <div className={styles.tagTable}>
              {Object.entries(parsed.headers).map(([k, v]) => (
                <div key={k} className={styles.tagRow}>
                  <span className={styles.tagKey}>{k}:</span>
                  <span className={styles.tagVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Chessboard fen={SAMPLE_GAMES[0].fen} />
        </div>
      </div>
    </div>
  );
}
