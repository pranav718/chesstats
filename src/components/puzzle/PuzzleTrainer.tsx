'use client';

import React, { useState } from 'react';
import styles from './PuzzleTrainer.module.css';
import { ChessPuzzle } from '@/types/puzzle';
import { Chessboard } from '@/components/Chessboard';
import { CHESS_PUZZLES } from '@/lib/data/puzzles';
import { chessAudio } from '@/lib/sound';

export function PuzzleTrainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const puzzle: ChessPuzzle = CHESS_PUZZLES[currentIndex] || CHESS_PUZZLES[0];

  const handleNext = () => {
    chessAudio.playMove();
    setShowHint(false);
    setSolved(null);
    setCurrentIndex((prev) => (prev + 1) % CHESS_PUZZLES.length);
  };

  const handleSolve = () => {
    chessAudio.playBrilliant();
    setSolved(true);
    setStreak((prev) => prev + 1);
  };

  const handleFail = () => {
    chessAudio.playCheck();
    setSolved(false);
    setStreak(0);
  };

  return (
    <div className={styles.trainerContainer}>
      <div className={styles.boardColumn}>
        <Chessboard
          fen={puzzle.fen}
          orientation={puzzle.playerTurn}
          showCoordinates={true}
        />
      </div>

      <div className={styles.sidebar}>
        <div className={styles.panel}>
          <div className={styles.headerRow}>
            <span className="badge badge-emerald">
              {puzzle.playerTurn === 'white' ? '⚪ White to Move' : '⚫ Black to Move'}
            </span>
            <span className={styles.rating}>Rating: {puzzle.rating}</span>
          </div>

          <div className={styles.themeRow}>
            {puzzle.themes.map((th) => (
              <span key={th} className="badge badge-gold">
                {th.replace('-', ' ')}
              </span>
            ))}
          </div>

          <p className={styles.description}>{puzzle.description}</p>

          <div className={styles.streakBox}>
            <span>Current Solving Streak:</span>
            <span className={styles.streakNum}>🔥 {streak}</span>
          </div>

          {solved === true && (
            <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
              ✓ Correct! Outstanding tactical vision.
            </div>
          )}

          {solved === false && (
            <div className={`${styles.statusMessage} ${styles.statusFail}`}>
              ✕ That move was inaccurate. Try again!
            </div>
          )}

          {showHint && (
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--brand-gold)' }}>
              <strong>Hint:</strong> Look for the forcing move {puzzle.solutionSan[0]}!
            </div>
          )}

          <div className={styles.actionRow}>
            {solved === null ? (
              <>
                <button onClick={handleSolve} className="btn-primary">
                  Verify Best Move
                </button>
                <button
                  onClick={() => setShowHint(true)}
                  className="btn-secondary"
                  disabled={showHint}
                >
                  💡 Need Hint
                </button>
                <button onClick={handleFail} className="btn-secondary">
                  Give Up
                </button>
              </>
            ) : (
              <button onClick={handleNext} className="btn-primary">
                Next Puzzle →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
