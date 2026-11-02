import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyOpening } from '@/lib/ecoClassifier';
import {
  calculateExpectedScore,
  calculateEloChange,
  calculateTournamentPerformanceRating,
} from '@/lib/eloCalculator';

describe('ECO Opening Classifier and FIDE Elo Telemetry', () => {
  it('classifyOpening resolves exact opening names and ECO codes', () => {
    const najdorf = classifyOpening(['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6']);
    assert.equal(najdorf.eco, 'B90');
    assert.ok(najdorf.name.includes('Najdorf'));

    const ruyLopez = classifyOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
    assert.equal(ruyLopez.eco, 'C60');
    assert.equal(ruyLopez.name, 'Ruy Lopez');

    const kingsIndian = classifyOpening(['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7']);
    assert.equal(kingsIndian.eco, 'E60');
    assert.ok(kingsIndian.name.includes("King's Indian"));

    const empty = classifyOpening([]);
    assert.equal(empty.eco, 'A00');
  });

  it('calculateExpectedScore adheres to standard logistic formula', () => {
    assert.equal(calculateExpectedScore(2500, 2500), 0.5);

    const highFavorite = calculateExpectedScore(2800, 2400);
    assert.ok(highFavorite > 0.9);

    const underdog = calculateExpectedScore(2400, 2800);
    assert.ok(underdog < 0.1);
  });

  it('calculateEloChange calculates rating deltas across K-factors', () => {
    const upsetWin = calculateEloChange(2400, 2800, 1, 20);
    assert.ok(upsetWin.delta > 15);
    assert.equal(upsetWin.newRating, 2400 + Math.round(upsetWin.delta));

    const expectedWin = calculateEloChange(2800, 2400, 1, 20);
    assert.ok(expectedWin.delta < 5);

    const upsetLoss = calculateEloChange(2800, 2400, 0, 20);
    assert.ok(upsetLoss.delta < -15);
  });

  it('calculateTournamentPerformanceRating estimates performance rating accurately', () => {
    const opponents = [2500, 2500, 2500, 2500];
    const performanceEven = calculateTournamentPerformanceRating(opponents, 2);
    assert.equal(performanceEven, 2500);

    const performanceHigh = calculateTournamentPerformanceRating(opponents, 3.5);
    assert.ok(performanceHigh > 2700);
  });
});
