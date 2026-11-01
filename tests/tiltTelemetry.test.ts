import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStreak,
  computeTimeTroubleBlunderRate,
  detectPeakTiltHours,
  computeTiltScore,
  getTiltLevel,
  generateTiltAdvice,
  calculateTiltAnalytics,
} from '@/lib/tiltTelemetry';
import { ChessGame, MoveClassification, PieceColor } from '@/types/chess';
import { STARTING_FEN } from '@/lib/constants';

function createMockGame(whiteUser: string, blackUser: string, whiteResult: 'win' | 'loss' | 'draw', whiteBlunders: number = 0): ChessGame {
  const moves = Array.from({ length: 10 }, (_, i) => ({
    ply: i + 1,
    moveNumber: Math.floor(i / 2) + 1,
    san: 'e4',
    uci: 'e2e4',
    fen: STARTING_FEN,
    evaluation: 10,
    classification: (i === 8 && whiteBlunders > 0 && i % 2 === 0 ? 'blunder' : 'best') as MoveClassification,
    playedBy: (i % 2 === 0 ? 'white' : 'black') as PieceColor,
  }));

  return {
    id: `game-${Math.random()}`,
    url: 'https://chess.com/game/live/12345',
    pgn: '1. e4 e5',
    fen: STARTING_FEN,
    white: { username: whiteUser, rating: 2500, result: whiteResult },
    black: { username: blackUser, rating: 2480, result: whiteResult === 'win' ? 'loss' : whiteResult === 'loss' ? 'win' : 'draw' },
    result: whiteResult === 'win' ? '1-0' : whiteResult === 'loss' ? '0-1' : '1/2-1/2',
    winner: whiteResult === 'win' ? 'white' : whiteResult === 'loss' ? 'black' : undefined,
    timeControl: '180+0',
    timeClass: 'blitz',
    date: '2025-10-15T23:30:00Z',
    moves,
    accuracy: { white: 85, black: 80 },
    acpl: { white: 20, black: 25 },
    eco: 'B01',
    openingName: 'Scandinavian Defense',
    platform: 'chesscom',
  };
}

describe('Tilt Telemetry and Fatigue Diagnostics Engine', () => {
  it('computeStreak accurately determines current winning or losing streaks', () => {
    assert.deepEqual(computeStreak([], 'hikaru'), { type: 'neutral', count: 0 });

    const winGames = [
      createMockGame('hikaru', 'opponent1', 'win'),
      createMockGame('hikaru', 'opponent2', 'win'),
      createMockGame('opponent3', 'hikaru', 'win'),
    ];
    const streak = computeStreak(winGames, 'hikaru');
    assert.equal(streak.type, 'win');
    assert.equal(streak.count, 2);

    const lossGames = [
      createMockGame('hikaru', 'opponent1', 'loss'),
      createMockGame('hikaru', 'opponent2', 'win'),
    ];
    const lossStreak = computeStreak(lossGames, 'hikaru');
    assert.equal(lossStreak.type, 'loss');
    assert.equal(lossStreak.count, 1);
  });

  it('computeTimeTroubleBlunderRate calculates percentage of blunder occurrences', () => {
    const cleanGames = [createMockGame('carlsen', 'opponent', 'win', 0)];
    const lowRate = computeTimeTroubleBlunderRate(cleanGames, 'carlsen');
    assert.equal(lowRate, 0);

    const blunderGames = [createMockGame('carlsen', 'opponent', 'loss', 1)];
    const highRate = computeTimeTroubleBlunderRate(blunderGames, 'carlsen');
    assert.ok(highRate > 10);
  });

  it('detectPeakTiltHours returns formatted hour bands', () => {
    const games = [createMockGame('user1', 'opponent', 'loss')];
    const hours = detectPeakTiltHours(games, 'user1');
    assert.ok(hours.length > 0);
    assert.match(hours[0], /\d{2}:00 - \d{2}:00/);
  });

  it('computeTiltScore and getTiltLevel map performance degradation properly', () => {
    const lowTiltScore = computeTiltScore({ type: 'win', count: 4 }, 2, 0, 5);
    assert.ok(lowTiltScore <= 35);
    assert.equal(getTiltLevel(lowTiltScore), 'optimal');

    const highTiltScore = computeTiltScore({ type: 'loss', count: 3 }, 30, 4, 5);
    assert.ok(highTiltScore >= 70);
    assert.equal(getTiltLevel(highTiltScore), 'severe');
  });

  it('generateTiltAdvice provides tailored recommendations', () => {
    const severeAdvice = generateTiltAdvice('severe', { type: 'loss', count: 4 });
    assert.ok(severeAdvice.includes('30-minute'));

    const optimalAdvice = generateTiltAdvice('optimal', { type: 'win', count: 3 });
    assert.ok(optimalAdvice.includes('optimal'));
  });

  it('calculateTiltAnalytics synthesizes full telemetry report', () => {
    const games = [
      createMockGame('playerX', 'rival1', 'win'),
      createMockGame('rival2', 'playerX', 'loss'),
    ];
    const report = calculateTiltAnalytics('playerX', games);
    assert.ok(report.score >= 5 && report.score <= 100);
    assert.equal(report.currentStreak.type, 'win');
    assert.equal(report.currentStreak.count, 2);
    assert.ok(report.advice.length > 0);
  });
});
