export type Platform = 'chesscom' | 'lichess';

export type TimeClass = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'daily';

export type PieceColor = 'white' | 'black';

export type MoveClassification = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'excellent' 
  | 'good' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'miss' 
  | 'blunder' 
  | 'book';

export type WinReason = 
  | 'checkmate' 
  | 'resignation' 
  | 'timeout' 
  | 'stalemate' 
  | 'repetition' 
  | 'insufficient' 
  | 'agreement' 
  | 'abandoned'
  | 'rules-infraction';

export interface RatingStats {
  current: number;
  highest: number;
  highestDate?: string;
  gamesPlayed: number;
  winCount: number;
  lossCount: number;
  drawCount: number;
  ratingProgression?: { date: string; rating: number }[];
}

export interface PlayerProfile {
  username: string;
  title?: string; // GM, IM, FM, etc.
  name?: string;
  avatar?: string;
  country?: string;
  countryFlag?: string;
  bio?: string;
  url: string;
  joinedDate: string;
  followers?: number;
  isOnline?: boolean;
  isStreamer?: boolean;
  platform: Platform;
  fideRating?: number;
  ratings: Partial<Record<TimeClass, RatingStats>>;
  overallStats: {
    totalGames: number;
    winRate: number;
    drawRate: number;
    lossRate: number;
    averageAccuracy: number;
    favoriteOpeningWhite: string;
    favoriteOpeningBlack: string;
  };
}

export interface GamePlayerInfo {
  username: string;
  rating: number;
  title?: string;
  result: 'win' | 'loss' | 'draw';
  accuracy?: number;
  avatar?: string;
}

export interface MoveAnalysis {
  ply: number;
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  evaluation: number; // in centipawns (+1.25 = 125), or +10000 for mate
  isMate?: boolean;
  mateIn?: number;
  classification: MoveClassification;
  bestMove?: string;
  bestMoveSan?: string;
  commentary?: string;
  playedBy: PieceColor;
  timeSpentSeconds?: number;
  clockRemaining?: string;
}

export interface ChessGame {
  id: string;
  url: string;
  pgn: string;
  fen: string;
  white: GamePlayerInfo;
  black: GamePlayerInfo;
  timeControl: string;
  timeClass: TimeClass;
  date: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  winner?: PieceColor;
  winReason?: WinReason;
  eco?: string;
  openingName?: string;
  moves: MoveAnalysis[];
  accuracy?: {
    white: number;
    black: number;
  };
  acpl?: {
    white: number; // Average Centipawn Loss
    black: number;
  };
  classificationCounts?: {
    white: Record<MoveClassification, number>;
    black: Record<MoveClassification, number>;
  };
  platform: Platform;
}

export interface OpeningStats {
  eco: string;
  name: string;
  movesSan: string[];
  movesUci?: string[];
  totalGames: number;
  winRateWhite: number;
  drawRate: number;
  winRateBlack: number;
  userPerformance?: {
    gamesPlayed: number;
    winRate: number;
    averageAccuracy: number;
  };
  popularReplies?: {
    san: string;
    games: number;
    whiteWinsPercent: number;
    drawsPercent: number;
    blackWinsPercent: number;
  }[];
}

export interface HeadToHeadStats {
  player1: PlayerProfile;
  player2: PlayerProfile;
  totalGames: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  recentGames: ChessGame[];
  performanceByTimeClass: Record<TimeClass, { p1Wins: number; p2Wins: number; draws: number }>;
}

export interface TiltAnalytics {
  score: number; // 0 to 100
  level: 'optimal' | 'moderate' | 'high' | 'severe';
  currentStreak: {
    type: 'win' | 'loss' | 'neutral';
    count: number;
  };
  peakTiltHours: string[]; // e.g., ["01:00 - 04:00"]
  timeTroubleBlunderRate: number; // % blunders made with < 15 seconds
  ratingVarianceLast30Days: number;
  advice: string;
}

export interface SquareHeatmapData {
  square: string; // e.g. "e4"
  count: number; // number of times occupied or attacked
  intensity: number; // 0 to 1
  dominantPiece?: string;
}
