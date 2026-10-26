import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>♞</div>
            <span>Chesstats</span>
          </div>
          <p className={styles.motto}>
            State-of-the-art telemetry, move accuracy metrics, opening tree diagnostics, and tilt analytics for competitive chess players.
          </p>
          <div className={styles.quoteBox}>
            &ldquo;Tactics is knowing what to do when there is something to do; strategy is knowing what to do when there is nothing to do.&rdquo;
            <span className={styles.quoteAuthor}>— Savielly Tartakower</span>
          </div>
        </div>

        <div>
          <h4 className={styles.colTitle}>Analytics</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/analysis">Game Review Studio</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/openings">Opening Repertoire</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/compare">Head-to-Head Rivalry</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/heatmap">Square Control Heatmap</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Tools & Play</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <Link href="/puzzles">Tactical Puzzle Trainer</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/clock">Tournament Chess Clock</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/titles">FIDE Title Explorer</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/pgn">PGN & FEN Studio</Link>
            </li>
            <li className={styles.linkItem}>
              <Link href="/leaderboard">Grandmaster Ranks</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Supported Platforms</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <a href="https://chess.com" target="_blank" rel="noopener noreferrer">
                Chess.com API
              </a>
            </li>
            <li className={styles.linkItem}>
              <a href="https://lichess.org" target="_blank" rel="noopener noreferrer">
                Lichess Open API
              </a>
            </li>
            <li className={styles.linkItem}>
              <a href="https://stockfishchess.org" target="_blank" rel="noopener noreferrer">
                Stockfish Engine
              </a>
            </li>
            <li className={styles.linkItem}>
              <a href="https://fide.com" target="_blank" rel="noopener noreferrer">
                FIDE Ratings
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <div>&copy; {currentYear} Chesstats. Built for chess competitors worldwide.</div>
        <div className={styles.poweredBy}>
          <span>Data Providers:</span>
          <span className={styles.platformPill}>Chess.com</span>
          <span className={styles.platformPill}>Lichess</span>
        </div>
      </div>
    </footer>
  );
}
