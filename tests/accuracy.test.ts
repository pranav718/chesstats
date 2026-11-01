import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evalToWinProbability,
  classifyMove,
  calculateMoveAccuracy,
  calculateMedian,
  calculateGameAccuracy,
  calculatePerformanceRating,
} from '@/lib/accuracy';

describe('Accuracy and Evaluation Engine', () => {
  it('evalToWinProbability calculates expected win chances across edge centipawns', () => {
    assert.equal(evalToWinProbability(0), 50);
    assert.equal(evalToWinProbability(10000), 100);
    assert.equal(evalToWinProbability(-10000), 0);
    assert.equal(evalToWinProbability(NaN), 50);
    assert.ok(evalToWinProbability(500) > 80);
    assert.ok(evalToWinProbability(-500) < 20);
  });

  it('classifyMove correctly categorizes move qualities', () => {
    assert.equal(classifyMove(100, 100, 'white'), 'best');
    assert.equal(classifyMove(100, 96, 'white'), 'best');
    assert.equal(classifyMove(100, 80, 'white'), 'excellent');
    assert.equal(classifyMove(100, 40, 'white'), 'good');
    assert.equal(classifyMove(100, -30, 'white'), 'inaccuracy');
    assert.equal(classifyMove(200, -250, 'white'), 'blunder');
    assert.equal(classifyMove(150, 140, 'white', true), 'brilliant');
  });

  it('calculateMoveAccuracy maps probability loss to 0-100 score', () => {
    const perfectAccuracy = calculateMoveAccuracy(50, 50);
    assert.equal(perfectAccuracy, 100);

    const smallDrop = calculateMoveAccuracy(60, 58);
    assert.ok(smallDrop > 90);

    const severeDrop = calculateMoveAccuracy(80, 10);
    assert.ok(severeDrop < 20);
  });

  it('calculateMedian computes correct median for odd and even length arrays', () => {
    assert.equal(calculateMedian([]), 0);
    assert.equal(calculateMedian([5]), 5);
    assert.equal(calculateMedian([1, 9, 3]), 3);
    assert.equal(calculateMedian([10, 40, 20, 30]), 25);
  });

  it('calculateGameAccuracy computes full game statistics', () => {
    const emptyResult = calculateGameAccuracy([]);
    assert.equal(emptyResult.whiteAccuracy, 100);
    assert.equal(emptyResult.blackAccuracy, 100);
    assert.equal(emptyResult.whiteAcpl, 0);
    assert.equal(emptyResult.blackAcpl, 0);

    const moves = [
      { beforeEval: 20, afterEval: 25, playedBy: 'white' as const },
      { beforeEval: 25, afterEval: 20, playedBy: 'black' as const },
      { beforeEval: 20, afterEval: 15, playedBy: 'white' as const },
      { beforeEval: 15, afterEval: 500, playedBy: 'black' as const },
    ];

    const result = calculateGameAccuracy(moves);
    assert.ok(result.whiteAccuracy > 90);
    assert.ok(result.blackAccuracy < 70);
    assert.equal(result.blackBlunders, 1);
    assert.equal(result.whiteBlunders, 0);
    assert.ok(result.blackAcpl > result.whiteAcpl);
    assert.ok(result.blackMcpl > 0);
  });

  it('calculatePerformanceRating calculates FIDE linear performance estimate', () => {
    assert.equal(calculatePerformanceRating([], 0), 0);
    const opponents = [2400, 2400, 2400, 2400];
    const evenScore = calculatePerformanceRating(opponents, 2);
    assert.equal(evenScore, 2400);

    const strongScore = calculatePerformanceRating(opponents, 3);
    assert.ok(strongScore > 2400);

    const weakScore = calculatePerformanceRating(opponents, 1);
    assert.ok(weakScore < 2400);
  });
});
