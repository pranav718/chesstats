import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePositionalFeatures,
  evaluatePawnStructure,
  evaluateBishopPairs,
  evaluateRookFiles,
  evaluateKingShelter,
  computeGamePhase,
  evaluateEndgameMopUp,
} from '@/lib/positionalEvaluation';
import { parseFen } from '@/lib/fenPgn';

describe('Positional Evaluation Heuristics Engine', () => {
  it('evaluates starting position as balanced across material and heuristics', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const breakdown = evaluatePositionalFeatures(fen);

    assert.equal(breakdown.materialScore, 0);
    assert.equal(breakdown.pstScore, 0);
    assert.equal(breakdown.bishopPairScore, 0);
    assert.equal(breakdown.pawnStructureScore, 0);
    assert.equal(breakdown.rookFilesScore, 0);
    assert.equal(breakdown.kingShelterScore, 0);
    assert.equal(breakdown.endgameMopUpScore, 0);
    assert.equal(breakdown.gamePhase, 1);
    assert.equal(breakdown.totalScore, 0);
  });

  it('rewards bishop pair advantage when opponent loses a bishop', () => {
    const boardWhitePair = parseFen('r1bqk1nr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
    const pairs = evaluateBishopPairs(boardWhitePair);
    assert.equal(pairs.whiteBonus, 35);
    assert.equal(pairs.blackBonus, 0);
  });

  it('penalizes doubled pawns on the same file', () => {
    const boardDoubled = parseFen('8/8/8/4P3/4P3/8/8/8 w - - 0 1');
    const result = evaluatePawnStructure(boardDoubled);
    assert.ok(result.whiteDoubledPenalty >= 20);
  });

  it('penalizes isolated pawns without adjacent friendly pawn support', () => {
    const boardIsolated = parseFen('8/8/8/P7/8/8/8/8 w - - 0 1');
    const result = evaluatePawnStructure(boardIsolated);
    assert.ok(result.whiteIsolatedPenalty >= 20);
  });

  it('awards bonuses for passed pawns based on proximity to promotion', () => {
    const boardPassed = parseFen('8/8/3P4/8/8/8/8/8 w - - 0 1');
    const result = evaluatePawnStructure(boardPassed);
    assert.ok(result.whitePassedBonus >= 60);
  });

  it('awards open file bonus to rooks on unobstructed vertical files', () => {
    const boardOpen = parseFen('8/8/8/8/8/8/8/4R3 w - - 0 1');
    const result = evaluateRookFiles(boardOpen);
    assert.equal(result.whiteBonus, 30);
    assert.equal(result.blackBonus, 0);
  });

  it('penalizes destroyed or displaced king shelter pawns in castled positions', () => {
    const intactBoard = parseFen('8/8/8/8/8/8/5PPP/6K1 w - - 0 1');
    const intactResult = evaluateKingShelter(intactBoard);
    assert.equal(intactResult.whitePenalty, 0);

    const damagedBoard = parseFen('8/8/8/8/8/8/8/6K1 w - - 0 1');
    const damagedResult = evaluateKingShelter(damagedBoard);
    assert.ok(damagedResult.whitePenalty > 30);
  });

  it('synthesizes comprehensive positional evaluation breakdown with all attributes', () => {
    const fen = 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQkq - 0 8';
    const breakdown = evaluatePositionalFeatures(fen);

    assert.equal(typeof breakdown.materialScore, 'number');
    assert.equal(typeof breakdown.pstScore, 'number');
    assert.equal(typeof breakdown.bishopPairScore, 'number');
    assert.equal(typeof breakdown.pawnStructureScore, 'number');
    assert.equal(typeof breakdown.rookFilesScore, 'number');
    assert.equal(typeof breakdown.kingShelterScore, 'number');
    assert.equal(typeof breakdown.endgameMopUpScore, 'number');
    assert.equal(typeof breakdown.gamePhase, 'number');
    assert.equal(typeof breakdown.totalScore, 'number');
  });

  it('tapers king safety and encourages king centralization in pure endgames', () => {
    const startBoard = parseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    assert.equal(computeGamePhase(startBoard), 1);

    const centralKingEndgame = evaluatePositionalFeatures('4k3/8/8/8/4K3/8/4P3/8 w - - 0 1');
    const cornerKingEndgame = evaluatePositionalFeatures('4k3/8/8/8/8/8/4P3/K7 w - - 0 1');
    assert.equal(centralKingEndgame.gamePhase, 0);
    assert.ok(centralKingEndgame.pstScore > cornerKingEndgame.pstScore);
  });

  it('rewards endgame mop-up geometry when driving losing king to board corners', () => {
    const boardCornered = parseFen('k7/8/1K6/8/8/8/8/4R3 w - - 0 1');
    const boardCentral = parseFen('8/8/8/3k4/8/8/8/K3R3 w - - 0 1');
    const phase = computeGamePhase(boardCornered);

    const cornerBonus = evaluateEndgameMopUp(boardCornered, 500, phase);
    const centerBonus = evaluateEndgameMopUp(boardCentral, 500, phase);
    assert.ok(cornerBonus > centerBonus);
    assert.ok(cornerBonus > 50);
  });
});