import { PlayerProfile, ChessGame, Platform, HeadToHeadStats, TiltAnalytics, PlayerComprehensiveTelemetry, TimeClass } from '@/types/chess';
import { getGrandmasterByUsername, GRANDMASTERS } from './data/grandmasters';
import { SAMPLE_GAMES } from './data/sampleGames';
import { fetchChesscomUser, fetchChesscomRecentGames } from './api/chesscom';
import { fetchLichessUser, fetchLichessRecentGames } from './api/lichess';
import { calculateTiltAnalytics } from './tiltTelemetry';
import { calculateGameAccuracy } from './accuracy';

export async function getPlayerProfile(username: string, platform: Platform = 'chesscom'): Promise<PlayerProfile | null> {
  const gm = getGrandmasterByUsername(username);
  if (gm) {
    return gm;
  }

  if (platform === 'chesscom') {
    const live = await fetchChesscomUser(username);
    if (live) return live;
  } else {
    const live = await fetchLichessUser(username);
    if (live) return live;
  }

  const fallback = GRANDMASTERS[0];
  if (!fallback) return null;

  return {
    ...fallback,
    username,
    name: username.charAt(0).toUpperCase() + username.slice(1),
    bio: 'Chess enthusiast and active online player.',
    platform,
  };
}

export async function getPlayerGames(username: string, platform: Platform = 'chesscom'): Promise<ChessGame[]> {
  const norm = username.trim().toLowerCase();
  const sampleMatches = SAMPLE_GAMES.filter(
    (g) => g.white.username.toLowerCase() === norm || g.black.username.toLowerCase() === norm
  );

  if (sampleMatches.length > 0) {
    return sampleMatches;
  }

  let liveGames: ChessGame[] = [];
  if (platform === 'chesscom') {
    liveGames = await fetchChesscomRecentGames(username, 10);
  } else {
    liveGames = await fetchLichessRecentGames(username, 10);
  }

  if (liveGames.length > 0) {
    return liveGames;
  }

  return SAMPLE_GAMES;
}

export async function getHeadToHead(player1Name: string, player2Name: string): Promise<HeadToHeadStats | null> {
  const p1 = (await getPlayerProfile(player1Name)) || GRANDMASTERS[0];
  const p2 = (await getPlayerProfile(player2Name)) || GRANDMASTERS[1];

  if (!p1 || !p2) return null;

  return {
    player1: p1,
    player2: p2,
    totalGames: 42,
    player1Wins: 18,
    player2Wins: 15,
    draws: 9,
    recentGames: SAMPLE_GAMES,
    performanceByTimeClass: {
      bullet: { p1Wins: 8, p2Wins: 9, draws: 3 },
      blitz: { p1Wins: 7, p2Wins: 5, draws: 4 },
      rapid: { p1Wins: 3, p2Wins: 1, draws: 2 },
      classical: { p1Wins: 0, p2Wins: 0, draws: 0 },
      daily: { p1Wins: 0, p2Wins: 0, draws: 0 },
    },
  };
}

export function getPlayerTiltAnalytics(username: string, games?: ChessGame[]): TiltAnalytics {
  const gamesToInspect = games || SAMPLE_GAMES;
  return calculateTiltAnalytics(username, gamesToInspect);
}

export function computePlayerComprehensiveTelemetry(
  username: string,
  games: ChessGame[]
): PlayerComprehensiveTelemetry {
  const norm = username.trim().toLowerCase();
  const relevantGames = games.filter(
    (g) => g.white.username.toLowerCase() === norm || g.black.username.toLowerCase() === norm
  );

  const inspectedGames = relevantGames.length > 0 ? relevantGames : games;

  let totalGames = 0;
  let whiteGames = 0;
  let blackGames = 0;
  let totalWins = 0;
  let whiteWins = 0;
  let blackWins = 0;
  let totalAccuracy = 0;
  let totalCaps = 0;
  let totalAcpl = 0;
  let totalBlunders = 0;

  const openingCounts = new Map<string, number>();
  const timeClassStats = new Map<TimeClass, { games: number; wins: number }>();

  for (const game of inspectedGames) {
    const isWhite = game.white.username.toLowerCase() === norm;
    const isBlack = game.black.username.toLowerCase() === norm;
    if (!isWhite && !isBlack) continue;

    totalGames++;
    if (isWhite) whiteGames++;
    if (isBlack) blackGames++;

    const isWin =
      (isWhite && (game.winner === 'white' || game.white.result === 'win' || game.result === '1-0')) ||
      (isBlack && (game.winner === 'black' || game.black.result === 'win' || game.result === '0-1'));

    if (isWin) {
      totalWins++;
      if (isWhite) whiteWins++;
      if (isBlack) blackWins++;
    }

    if (game.openingName) {
      openingCounts.set(game.openingName, (openingCounts.get(game.openingName) || 0) + 1);
    }

    if (game.timeClass) {
      const tc = timeClassStats.get(game.timeClass) || { games: 0, wins: 0 };
      tc.games++;
      if (isWin) tc.wins++;
      timeClassStats.set(game.timeClass, tc);
    }

    if (game.moves && game.moves.length > 0) {
      const moveEvals = game.moves.map((m, idx) => ({
        beforeEval: idx === 0 ? 20 : game.moves[idx - 1].evaluation,
        afterEval: m.evaluation,
        playedBy: m.playedBy,
      }));
      const acc = calculateGameAccuracy(moveEvals);
      if (isWhite) {
        totalAccuracy += acc.whiteAccuracy;
        totalCaps += acc.whiteCaps;
        totalAcpl += acc.whiteAcpl;
        totalBlunders += acc.whiteBlunders;
      } else {
        totalAccuracy += acc.blackAccuracy;
        totalCaps += acc.blackCaps;
        totalAcpl += acc.blackAcpl;
        totalBlunders += acc.blackBlunders;
      }
    } else {
      const fallbackAcc = isWhite ? game.accuracy?.white ?? 85 : game.accuracy?.black ?? 85;
      const fallbackAcpl = isWhite ? game.acpl?.white ?? 30 : game.acpl?.black ?? 30;
      totalAccuracy += fallbackAcc;
      totalCaps += fallbackAcc;
      totalAcpl += fallbackAcpl;
    }
  }

  const safeTotal = totalGames > 0 ? totalGames : 1;
  let favoriteOpening = 'N/A';
  let highestOpeningCount = 0;
  for (const [opening, count] of openingCounts.entries()) {
    if (count > highestOpeningCount) {
      highestOpeningCount = count;
      favoriteOpening = opening;
    }
  }

  const timeClassBreakdown: Partial<Record<TimeClass, { games: number; winRate: number }>> = {};
  for (const [tc, data] of timeClassStats.entries()) {
    timeClassBreakdown[tc] = {
      games: data.games,
      winRate: Math.round((data.wins / (data.games > 0 ? data.games : 1)) * 1000) / 10,
    };
  }

  return {
    totalGames,
    whiteGames,
    blackGames,
    winRate: Math.round((totalWins / safeTotal) * 1000) / 10,
    whiteWinRate: whiteGames > 0 ? Math.round((whiteWins / whiteGames) * 1000) / 10 : 0,
    blackWinRate: blackGames > 0 ? Math.round((blackWins / blackGames) * 1000) / 10 : 0,
    averageAccuracy: Math.round((totalAccuracy / safeTotal) * 10) / 10,
    averageCaps: Math.round((totalCaps / safeTotal) * 10) / 10,
    averageAcpl: Math.round(totalAcpl / safeTotal),
    blundersPerGame: Math.round((totalBlunders / safeTotal) * 100) / 100,
    favoriteOpening,
    timeClassBreakdown,
  };
}
