import React from 'react';
import styles from './AnalysisHeader.module.css';
import { ChessGame } from '@/types/chess';

interface AnalysisHeaderProps {
  game: ChessGame;
}

export function AnalysisHeader({ game }: AnalysisHeaderProps) {
  return (
    <div className={styles.headerCard}>
      <div className={styles.matchup}>
        <div className={styles.playerBox}>
          <span className={styles.whiteDot} />
          <div className={styles.playerMeta}>
            <span className={styles.playerName}>
              {game.white.title && <span className="badge badge-gold">{game.white.title}</span>}
              {game.white.username}
              {game.winner === 'white' && <span className={styles.crown}>👑</span>}
            </span>
            <span className={styles.playerRating}>{game.white.rating}</span>
          </div>
        </div>

        <span className={styles.vsBadge}>VS</span>

        <div className={styles.playerBox}>
          <span className={styles.blackDot} />
          <div className={styles.playerMeta}>
            <span className={styles.playerName}>
              {game.black.title && <span className="badge badge-gold">{game.black.title}</span>}
              {game.black.username}
              {game.winner === 'black' && <span className={styles.crown}>👑</span>}
            </span>
            <span className={styles.playerRating}>{game.black.rating}</span>
          </div>
        </div>
      </div>

      <div className={styles.gameMeta}>
        <span className={styles.opening}>
          {game.eco ? `[${game.eco}] ` : ''}
          {game.openingName || 'Chess Clash'}
        </span>

        <div className={styles.statsRow}>
          <span>
            {game.timeControl} • {game.result}
          </span>
          {game.accuracy && (
            <>
              <span className={styles.accBadgeWhite}>
                ⚪ {game.accuracy.white}%
              </span>
              <span className={styles.accBadgeBlack}>
                ⚫ {game.accuracy.black}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
