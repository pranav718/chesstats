import React from 'react';
import styles from './ProfileHeader.module.css';
import { PlayerProfile, TimeClass } from '@/types/chess';
import { TIME_CLASS_CONFIG } from '@/lib/constants';

interface ProfileHeaderProps {
  player: PlayerProfile;
}

export function ProfileHeader({ player }: ProfileHeaderProps) {
  const timeClasses: TimeClass[] = ['bullet', 'blitz', 'rapid', 'daily'];

  return (
    <div className={styles.headerCard}>
      <div className={styles.topSection}>
        <div className={styles.playerInfo}>
          <div className={styles.avatar}>
            {player.countryFlag || '♟️'}
          </div>

          <div className={styles.details}>
            <div className={styles.titleRow}>
              {player.title && <span className={styles.titleBadge}>{player.title}</span>}
              <h1 className={styles.name}>{player.name || player.username}</h1>
            </div>
            <span className={styles.username}>@{player.username}</span>
            {player.bio && <p className={styles.bio}>{player.bio}</p>}
          </div>
        </div>

        <div className={styles.badgesCol}>
          <span className="badge badge-emerald">
            {player.platform === 'chesscom' ? '♟️ Chess.com' : '♞ Lichess'}
          </span>
          {player.fideRating && (
            <span className="badge badge-gold">
              FIDE {player.fideRating}
            </span>
          )}
          {player.isOnline && (
            <span className="badge badge-blue">● Online Now</span>
          )}
        </div>
      </div>

      <div className={styles.ratingsGrid}>
        {timeClasses.map((tc) => {
          const stats = player.ratings[tc];
          const config = TIME_CLASS_CONFIG[tc];

          return (
            <div key={tc} className={styles.ratingCard}>
              <div className={styles.cardTop}>
                <span className={styles.timeLabel}>
                  {config.icon} {config.label}
                </span>
                <span className={styles.peakRating}>
                  Peak: {stats?.highest || '—'}
                </span>
              </div>

              <div className={styles.currentRating}>
                {stats?.current || '—'}
              </div>

              {stats && (
                <div className={styles.record}>
                  <span className={styles.winText}>{stats.winCount}W</span>
                  <span className={styles.lossText}>{stats.lossCount}L</span>
                  <span className={styles.drawText}>{stats.drawCount}D</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
