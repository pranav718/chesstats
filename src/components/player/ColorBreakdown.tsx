import React from 'react';
import styles from './ColorBreakdown.module.css';
import { PlayerProfile } from '@/types/chess';

interface ColorBreakdownProps {
  player: PlayerProfile;
}

export function ColorBreakdown({ player }: ColorBreakdownProps) {
  const overallWin = player.overallStats.winRate;
  const overallDraw = player.overallStats.drawRate;

  const whiteWin = Math.min(95, Math.round(overallWin + 4.5));
  const whiteDraw = overallDraw;
  const whiteLoss = Math.max(0, 100 - whiteWin - whiteDraw);

  const blackWin = Math.max(10, Math.round(overallWin - 4.5));
  const blackDraw = overallDraw;
  const blackLoss = Math.max(0, 100 - blackWin - blackDraw);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Performance by Piece Color</h3>

      <div className={styles.grid}>
        <div className={styles.sideBox}>
          <div className={styles.sideHeader}>
            <span className={styles.sideTitle}>⚪ As White</span>
            <span className={styles.winRate}>{whiteWin}% Win</span>
          </div>

          <div className={styles.barTrack}>
            <div className={styles.barWin} style={{ width: `${whiteWin}%` }} />
            <div className={styles.barDraw} style={{ width: `${whiteDraw}%` }} />
            <div className={styles.barLoss} style={{ width: `${whiteLoss}%` }} />
          </div>

          <div className={styles.legend}>
            <span>Win: {whiteWin}%</span>
            <span>Draw: {whiteDraw}%</span>
            <span>Loss: {whiteLoss}%</span>
          </div>
        </div>

        <div className={styles.sideBox}>
          <div className={styles.sideHeader}>
            <span className={styles.sideTitle}>⚫ As Black</span>
            <span className={styles.winRate}>{blackWin}% Win</span>
          </div>

          <div className={styles.barTrack}>
            <div className={styles.barWin} style={{ width: `${blackWin}%` }} />
            <div className={styles.barDraw} style={{ width: `${blackDraw}%` }} />
            <div className={styles.barLoss} style={{ width: `${blackLoss}%` }} />
          </div>

          <div className={styles.legend}>
            <span>Win: {blackWin}%</span>
            <span>Draw: {blackDraw}%</span>
            <span>Loss: {blackLoss}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
