'use client';

import React from 'react';
import Link from 'next/link';
import styles from './RecentGamesSpotlight.module.css';
import { SAMPLE_GAMES } from '@/lib/data/sampleGames';
import { chessAudio } from '@/lib/sound';

export function RecentGamesSpotlight() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>Recent Master Clashes</h2>
            <p className={styles.subtitle}>
              Inspect move-by-move evaluations, blunder points, and brilliancy triggers in elite games
            </p>
          </div>

          <Link href="/analysis" className="btn-secondary">
            Analysis Studio →
          </Link>
        </div>

        <div className={styles.gamesList}>
          {SAMPLE_GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/analysis?game=${game.id}`}
              className={styles.gameCard}
              onClick={() => chessAudio.playMove()}
            >
              <div className={styles.matchup}>
                <div className={styles.timePill}>
                  <span>{game.timeControl}</span>
                  <span>{game.timeClass}</span>
                </div>

                <div className={styles.playersCol}>
                  <div className={styles.playerRow}>
                    <span className={styles.whiteDot} />
                    <strong>{game.white.username}</strong>
                    <span className={styles.rating}>({game.white.rating})</span>
                    {game.winner === 'white' && <span className={styles.winnerCrown}>👑</span>}
                  </div>

                  <div className={styles.playerRow}>
                    <span className={styles.blackDot} />
                    <strong>{game.black.username}</strong>
                    <span className={styles.rating}>({game.black.rating})</span>
                    {game.winner === 'black' && <span className={styles.winnerCrown}>👑</span>}
                  </div>
                </div>
              </div>

              <div className={styles.metaCol}>
                <span className={styles.openingName}>
                  {game.eco ? `[${game.eco}] ` : ''}
                  {game.openingName || 'Standard Opening'}
                </span>

                {game.accuracy && (
                  <div className={styles.accuracies}>
                    <span className={styles.accWhite}>⚪ {game.accuracy.white}%</span>
                    <span className={styles.accBlack}>⚫ {game.accuracy.black}%</span>
                  </div>
                )}
              </div>

              <div className={styles.actionBtn}>
                <span>Review Game</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
