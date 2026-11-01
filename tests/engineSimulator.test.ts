import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePositionLines,
  formatEngineScore,
  detectTacticalMotifs,
  DEFAULT_ENGINE_CONFIG,
} from '@/lib/engineSimulator';
import { STARTING_FEN } from '@/lib/constants';

describe('Multi-PV Engine and Tactical Motifs Simulator', () => {
  it('evaluatePositionLines returns requested number of ranked candidate lines', () => {
    const lines = evaluatePositionLines(STARTING_FEN, { multiPv: 3, depth: 20 });
    assert.equal(lines.length, 3);
    assert.equal(lines[0].rank, 1);
    assert.equal(lines[1].rank, 2);
    assert.equal(lines[2].rank, 3);
    assert.equal(lines[0].depth, 20);
    assert.ok(lines[0].score >= lines[1].score);
    assert.ok(lines[1].score >= lines[2].score);
    assert.ok(lines[0].nodes > 0);
  });

  it('evaluatePositionLines respects default configuration', () => {
    const lines = evaluatePositionLines(STARTING_FEN);
    assert.equal(lines.length, DEFAULT_ENGINE_CONFIG.multiPv);
    assert.equal(lines[0].depth, DEFAULT_ENGINE_CONFIG.depth);
  });

  it('formatEngineScore formats pawn evaluations and forced mate scores', () => {
    assert.equal(formatEngineScore(0), '0.00');
    assert.equal(formatEngineScore(150), '+1.50');
    assert.equal(formatEngineScore(-240), '-2.40');
    assert.equal(formatEngineScore(9900), '+M1');
    assert.equal(formatEngineScore(-9800), '-M2');
    assert.equal(formatEngineScore(NaN), '0.00');
  });

  it('detectTacticalMotifs identifies material concessions and blunder themes', () => {
    const startingFen = STARTING_FEN;
    const queenLostFen = 'rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    const hangingMotifs = detectTacticalMotifs(startingFen, queenLostFen, 900);
    const types = hangingMotifs.map((m) => m.type);
    assert.ok(types.includes('hanging_piece'));
    assert.ok(types.includes('missed_win'));

    const quietFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const quietMotifs = detectTacticalMotifs(startingFen, quietFen, 20);
    assert.equal(quietMotifs.length, 1);
    assert.equal(quietMotifs[0].type, 'tempo_loss');
  });

  it('detectTacticalMotifs detects endgame precision faults in simplified positions', () => {
    const endgameFenBefore = '4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1';
    const endgameFenAfter = '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1';

    const motifs = detectTacticalMotifs(endgameFenBefore, endgameFenAfter, 180);
    const types = motifs.map((m) => m.type);
    assert.ok(types.includes('endgame_blunder'));
  });
});
