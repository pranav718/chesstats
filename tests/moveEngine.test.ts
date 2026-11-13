import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSquareAttacked,
  findKingSquare,
  isKingInCheck,
  generateLegalMoves,
  getGameState,
  executeMoveOnFen,
  isInsufficientMaterial,
} from '@/lib/moveEngine';
import { parseFen } from '@/lib/fenPgn';
import { STARTING_FEN } from '@/lib/constants';

describe('Chess Move Engine and Attack Matrix', () => {
  it('findKingSquare accurately locates kings for both sides', () => {
    const board = parseFen(STARTING_FEN);
    assert.equal(findKingSquare(board, 'white'), 'e1');
    assert.equal(findKingSquare(board, 'black'), 'e8');
  });

  it('isSquareAttacked correctly identifies tactical threats across ranks and diagonals', () => {
    const board = parseFen(STARTING_FEN);
    assert.equal(isSquareAttacked(board, 'e3', 'white'), true);
    assert.equal(isSquareAttacked(board, 'd3', 'white'), true);
    assert.equal(isSquareAttacked(board, 'f3', 'white'), true);
    assert.equal(isSquareAttacked(board, 'e4', 'white'), false);
    assert.equal(isSquareAttacked(board, 'e6', 'black'), true);
  });

  it('generateLegalMoves calculates exactly 20 starting moves for White', () => {
    const legalMoves = generateLegalMoves(STARTING_FEN);
    assert.equal(legalMoves.length, 20);
    const knightMoves = legalMoves.filter((m) => m.piece.toLowerCase() === 'n');
    assert.equal(knightMoves.length, 4);
    const pawnMoves = legalMoves.filter((m) => m.piece.toLowerCase() === 'p');
    assert.equal(pawnMoves.length, 16);
  });

  it('isKingInCheck detects checks accurately', () => {
    assert.equal(isKingInCheck(STARTING_FEN, 'white'), false);
    assert.equal(isKingInCheck(STARTING_FEN, 'black'), false);

    const checkedFen = 'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3';
    assert.equal(isKingInCheck(checkedFen, 'white'), true);
  });

  it('getGameState identifies checkmate in Scholar Mate', () => {
    const scholarsMateFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
    assert.equal(getGameState(scholarsMateFen), 'checkmate');
  });

  it('getGameState identifies stalemate correctly', () => {
    const stalemateFen = 'k7/8/1Q6/8/8/8/8/7K b - - 0 1';
    assert.equal(getGameState(stalemateFen), 'stalemate');
  });

  it('generateLegalMoves includes kingside and queenside castling when squares are open', () => {
    const whiteCanCastleFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    const moves = generateLegalMoves(whiteCanCastleFen);
    const castlingMoves = moves.filter((m) => m.isCastling);
    assert.equal(castlingMoves.length, 2);
    assert.ok(castlingMoves.some((m) => m.from === 'e1' && m.to === 'g1'));
    assert.ok(castlingMoves.some((m) => m.from === 'e1' && m.to === 'c1'));

    const castledFen = executeMoveOnFen(whiteCanCastleFen, 'e1', 'g1');
    assert.ok(castledFen.includes('R4RK1'));
    assert.ok(!castledFen.includes('KQ'));
  });

  it('generateLegalMoves includes en passant capture when en passant square is set', () => {
    const enPassantFen = 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3';
    const moves = generateLegalMoves(enPassantFen);
    const epMove = moves.find((m) => m.isEnPassant);
    assert.ok(epMove !== undefined);
    assert.equal(epMove.from, 'e5');
    assert.equal(epMove.to, 'f6');

    const nextFen = executeMoveOnFen(enPassantFen, 'e5', 'f6');
    assert.ok(nextFen.startsWith('rnbqkbnr/ppp1p1pp/5P2/3p4/8/8/PPPP1PPP/RNBQKBNR b'));
  });

  it('isInsufficientMaterial accurately adjudicates bare king and minor piece dead positions', () => {
    assert.equal(isInsufficientMaterial('4k3/8/8/8/8/8/8/4K3 w - - 0 1'), true);
    assert.equal(isInsufficientMaterial('4k3/8/8/8/8/8/8/4KB2 w - - 0 1'), true);
    assert.equal(isInsufficientMaterial('4k3/8/8/8/8/8/8/4KN2 w - - 0 1'), true);
    assert.equal(isInsufficientMaterial('4k3/8/8/8/8/8/4P3/4K3 w - - 0 1'), false);
    assert.equal(isInsufficientMaterial('4k3/8/8/8/8/8/4R3/4K3 w - - 0 1'), false);

    assert.equal(getGameState('4k3/8/8/8/8/8/8/4K3 w - - 0 1'), 'insufficient_material');
  });

  it('getGameState adjudicates fifty moves rule draws', () => {
    const fiftyMovesFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 100 50';
    assert.equal(getGameState(fiftyMovesFen), 'fifty_moves_rule');
  });

  it('executeMoveOnFen updates board and increments move turn', () => {
    const nextFen = executeMoveOnFen(STARTING_FEN, 'e2', 'e4');
    assert.ok(nextFen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b'));
    assert.ok(nextFen.includes('e3'));
  });
});
