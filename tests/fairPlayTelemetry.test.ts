import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeMoveTimeDistribution,
  calculateEngineCorrelation,
  assessFairPlayRisk,
} from '@/lib/fairPlayTelemetry';
import { ChessGame } from '@/types/chess';
import { STARTING_FEN } from '@/lib/constants';

function createMockFairPlayGame(
  player: string,
  moveTimes: number[],
  matchBestMove: boolean,
  accuracy: number
): ChessGame {
  return {
    id: `game-${Math.random()}`,
    url: 'https://chess.com/1',
    pgn: '',
    fen: STARTING_FEN,
    white: { username: player, rating: 2400, result: 'win' },
    black: { username: 'opponent', rating: 2380, result: 'loss' },
    winner: 'white',
    result: '1-0',
    timeControl: '180+0',
    timeClass: 'blitz',
    date: '2025-10-15',
    accuracy: { white: accuracy, black: 72 },
    moves: moveTimes.map((t, idx) => ({
      ply: idx * 2 + 1,
      moveNumber: idx + 1,
      san: matchBestMove ? 'Nf3' : 'e4',
      bestMoveSan: 'Nf3',
      uci: 'g1f3',
      fen: STARTING_FEN,
      evaluation: 40,
      classification: matchBestMove ? 'best' : 'good',
      playedBy: 'white',
      timeSpentSeconds: t,
    })),
    platform: 'chesscom',
  };
}

describe('Fair-Play Telemetry and CAPS Anomaly Detector', () => {
  it('analyzeMoveTimeDistribution detects human pacing variance vs bot uniformity', () => {
    const humanTimes = [1.2, 5.8, 0.4, 12.3, 3.1, 8.4, 2.0, 15.6, 1.1, 4.3];
    const humanMetrics = analyzeMoveTimeDistribution(humanTimes);
    assert.equal(humanMetrics.isUniformBotTiming, false);
    assert.ok(humanMetrics.stdDevSeconds > 1.5);
    assert.ok(humanMetrics.coefficientOfVariation > 0.4);

    const botTimes = [1.02, 1.01, 1.03, 1.00, 1.02, 1.01, 1.02, 1.01, 1.03, 1.02];
    const botMetrics = analyzeMoveTimeDistribution(botTimes);
    assert.equal(botMetrics.isUniformBotTiming, true);
    assert.ok(botMetrics.stdDevSeconds < 0.1);
  });

  it('calculateEngineCorrelation computes exact match percentages', () => {
    const perfectMoves = [
      { san: 'e4', bestMoveSan: 'e4' },
      { san: 'Nf3', bestMoveSan: 'Nf3' },
    ];
    assert.equal(calculateEngineCorrelation(perfectMoves).matchRatePercent, 100);

    const divergentMoves = [
      { san: 'h4', bestMoveSan: 'd4' },
      { san: 'a4', bestMoveSan: 'e4' },
    ];
    assert.equal(calculateEngineCorrelation(divergentMoves).matchRatePercent, 0);
  });

  it('assessFairPlayRisk classifies clean human accounts accurately', () => {
    const humanGame = createMockFairPlayGame('fairPlayer', [2.1, 7.3, 1.5, 9.4, 3.2, 14.1, 0.9, 4.5], false, 84.5);
    const report = assessFairPlayRisk([humanGame], 'fairPlayer');

    assert.equal(report.username, 'fairPlayer');
    assert.equal(report.riskLevel, 'clean');
    assert.equal(report.flags.length, 0);
    assert.ok(report.timeEntropyIndex > 30);
  });

  it('assessFairPlayRisk flags suspicious robotic uniformity and synthetic accuracy', () => {
    const botGame = createMockFairPlayGame('botUser', [1.01, 1.02, 1.01, 1.00, 1.02, 1.01, 1.02, 1.01], true, 99.2);
    const report = assessFairPlayRisk([botGame], 'botUser');

    assert.equal(report.username, 'botUser');
    assert.equal(report.riskLevel, 'anomalous');
    assert.ok(report.flags.length >= 1);
    assert.ok(report.flags.some((f) => f.includes('variance') || f.includes('pacing')));
  });
});
