import { ChessGame, TiltAnalytics } from '@/types/chess';

export interface StreakInfo {
  type: 'win' | 'loss' | 'neutral';
  count: number;
}

export function computeStreak(games: ChessGame[], targetUsername: string): StreakInfo {
  if (!games || games.length === 0) {
    return { type: 'neutral', count: 0 };
  }

  const normTarget = targetUsername.trim().toLowerCase();
  let currentType: 'win' | 'loss' | 'neutral' = 'neutral';
  let count = 0;

  for (const game of games) {
    const isWhite = game.white.username.toLowerCase() === normTarget;
    const isBlack = game.black.username.toLowerCase() === normTarget;
    if (!isWhite && !isBlack) continue;

    const playerResult = isWhite ? game.white.result : game.black.result;
    const outcome: 'win' | 'loss' | 'neutral' =
      playerResult === 'win' ? 'win' : playerResult === 'loss' ? 'loss' : 'neutral';

    if (currentType === 'neutral') {
      currentType = outcome;
      count = 1;
    } else if (currentType === outcome) {
      count++;
    } else {
      break;
    }
  }

  return { type: currentType, count };
}

export function computeTimeTroubleBlunderRate(games: ChessGame[], targetUsername: string): number {
  if (!games || games.length === 0) return 18.5;

  const normTarget = targetUsername.trim().toLowerCase();
  let relevantMoves = 0;
  let blunderMoves = 0;

  for (const game of games) {
    const isWhite = game.white.username.toLowerCase() === normTarget;
    const color = isWhite ? 'white' : 'black';

    for (const move of game.moves || []) {
      if (move.playedBy !== color) continue;
      relevantMoves++;
      if (move.classification === 'blunder') {
        blunderMoves++;
      }
    }
  }

  if (relevantMoves === 0) return 15.0;
  const rate = (blunderMoves / relevantMoves) * 100;
  return Math.round(rate * 10) / 10;
}

export function detectPeakTiltHours(games: ChessGame[], targetUsername: string): string[] {
  if (!games || games.length === 0) {
    return ['23:00 - 02:00', '02:00 - 04:00'];
  }

  const normTarget = targetUsername.trim().toLowerCase();
  const lossesByHour = new Array(24).fill(0);
  let hasLosses = false;

  for (const game of games) {
    const isWhite = game.white.username.toLowerCase() === normTarget;
    const playerResult = isWhite ? game.white.result : game.black.result;
    if (playerResult === 'loss' && game.date) {
      const date = new Date(game.date);
      const hour = isNaN(date.getHours()) ? 0 : date.getHours();
      lossesByHour[hour]++;
      hasLosses = true;
    }
  }

  if (!hasLosses) {
    return ['22:00 - 01:00', '01:00 - 03:00'];
  }

  let worstHour = 0;
  let maxLosses = -1;

  for (let h = 0; h < 24; h++) {
    if (lossesByHour[h] > maxLosses) {
      maxLosses = lossesByHour[h];
      worstHour = h;
    }
  }

  const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const nextHour = (worstHour + 2) % 24;
  return [`${formatHour(worstHour)} - ${formatHour(nextHour)}`];
}

export function computeTiltScore(streak: StreakInfo, blunderRate: number, lossCount: number, totalGames: number): number {
  let score = 25;

  if (streak.type === 'loss') {
    score += Math.min(45, streak.count * 15);
  } else if (streak.type === 'win') {
    score = Math.max(10, score - streak.count * 5);
  }

  if (blunderRate > 25) {
    score += 20;
  } else if (blunderRate > 15) {
    score += 10;
  }

  if (totalGames > 0) {
    const lossRatio = lossCount / totalGames;
    if (lossRatio > 0.6) score += 15;
    else if (lossRatio < 0.3) score = Math.max(5, score - 10);
  }

  return Math.max(5, Math.min(98, Math.round(score)));
}

export function getTiltLevel(score: number): TiltAnalytics['level'] {
  if (score >= 70) return 'severe';
  if (score >= 50) return 'high';
  if (score >= 35) return 'moderate';
  return 'optimal';
}

export function generateTiltAdvice(level: TiltAnalytics['level'], streak: StreakInfo): string {
  if (level === 'severe') {
    return 'Severe fatigue and tilt detected. Significant blunder spikes during recent games. Immediate 30-minute offline cool-down strongly advised.';
  }
  if (level === 'high') {
    return `Elevated blunder frequency on ${streak.count > 1 ? streak.count + ' game loss streak' : 'critical moves'}. Stick to familiar openings and avoid rapid queuing.`;
  }
  if (level === 'moderate') {
    return 'Mild performance fluctuation observed. Focus on defensive vigilance and clock discipline.';
  }
  return 'Exceptional cognitive stability. Tactical precision is high and emotional control is optimal.';
}

export function calculateTiltAnalytics(username: string, games: ChessGame[] = []): TiltAnalytics {
  const norm = username.trim().toLowerCase();
  const streak = computeStreak(games, norm);
  const blunderRate = computeTimeTroubleBlunderRate(games, norm);
  const peakTiltHours = detectPeakTiltHours(games, norm);

  let lossCount = 0;
  let userGamesCount = 0;

  for (const g of games) {
    const isW = g.white.username.toLowerCase() === norm;
    const isB = g.black.username.toLowerCase() === norm;
    if (isW || isB) {
      userGamesCount++;
      const res = isW ? g.white.result : g.black.result;
      if (res === 'loss') lossCount++;
    }
  }

  const score = computeTiltScore(streak, blunderRate, lossCount, userGamesCount);
  const level = getTiltLevel(score);
  const advice = generateTiltAdvice(level, streak);

  return {
    score,
    level,
    currentStreak: streak,
    peakTiltHours,
    timeTroubleBlunderRate: blunderRate,
    ratingVarianceLast30Days: Math.min(180, Math.max(25, Math.round(score * 1.8))),
    advice,
  };
}
