import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateFen,
  parseFen,
  squareToCoords,
  coordsToSquare,
  extractPgnMoves,
  parsePgn,
  getPieceAtSquare,
  getTurnFromFen,
  countMaterial,
} from '@/lib/fenPgn';
import { STARTING_FEN } from '@/lib/constants';

describe('FEN and PGN Parsing Engine', () => {
  it('validateFen accepts standard starting position', () => {
    const result = validateFen(STARTING_FEN);
    assert.equal(result.valid, true);
    assert.equal(result.error, undefined);
  });

  it('validateFen flags invalid rank counts or bad characters', () => {
    const badRanks = validateFen('rnbqkbnr/pppppppp/8/8/8/8/8 w - - 0 1');
    assert.equal(badRanks.valid, false);

    const badPiece = validateFen('rnbqkbnr/pppppppp/8/8/8/8/8/RNBQKBNX w KQkq - 0 1');
    assert.equal(badPiece.valid, false);

    const missingKings = validateFen('8/8/8/8/8/8/8/8 w - - 0 1');
    assert.equal(missingKings.valid, false);

    const badTurn = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1');
    assert.equal(badTurn.valid, false);
  });

  it('parseFen generates an 8x8 matrix correctly', () => {
    const board = parseFen(STARTING_FEN);
    assert.equal(board.length, 8);
    for (const rank of board) {
      assert.equal(rank.length, 8);
    }
    assert.equal(board[0][0], 'r');
    assert.equal(board[0][4], 'k');
    assert.equal(board[7][4], 'K');
    assert.equal(board[3][3], null);
  });

  it('parseFen handles empty or malformed inputs without throwing', () => {
    const emptyBoard = parseFen('');
    assert.equal(emptyBoard.length, 8);
    assert.equal(emptyBoard[0].length, 8);
  });

  it('squareToCoords and coordsToSquare round-trip properly', () => {
    const e4Coords = squareToCoords('e4');
    assert.equal(coordsToSquare(e4Coords.row, e4Coords.col), 'e4');

    const a1Coords = squareToCoords('a1');
    assert.equal(coordsToSquare(a1Coords.row, a1Coords.col), 'a1');

    const h8Coords = squareToCoords('h8');
    assert.equal(coordsToSquare(h8Coords.row, h8Coords.col), 'h8');
  });

  it('getPieceAtSquare returns correct piece or null', () => {
    assert.equal(getPieceAtSquare(STARTING_FEN, 'e1'), 'K');
    assert.equal(getPieceAtSquare(STARTING_FEN, 'e8'), 'k');
    assert.equal(getPieceAtSquare(STARTING_FEN, 'e4'), null);
  });

  it('getTurnFromFen determines active color correctly', () => {
    assert.equal(getTurnFromFen(STARTING_FEN), 'white');
    assert.equal(getTurnFromFen('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'), 'black');
  });

  it('extractPgnMoves strips comments, clocks and annotations', () => {
    const sample = '1. e4 {[%clk 0:03:00]} e5 2. Nf3 $1 Nc6 (2... d6) 3. Bb5 1-0';
    const moves = extractPgnMoves(sample);
    assert.deepEqual(moves, ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
  });

  it('parsePgn extracts headers and moves', () => {
    const pgn = `[Event "World Championship"]
[Site "London"]
[Date "2018.11.09"]
[White "Carlsen, Magnus"]
[Black "Caruana, Fabiano"]
[Result "1/2-1/2"]

1. e4 c5 2. Nf3 Nc6 3. Bb5 g6 1/2-1/2`;

    const parsed = parsePgn(pgn);
    assert.equal(parsed.headers['Event'], 'World Championship');
    assert.equal(parsed.headers['White'], 'Carlsen, Magnus');
    assert.equal(parsed.result, '1/2-1/2');
    assert.deepEqual(parsed.moves, ['e4', 'c5', 'Nf3', 'Nc6', 'Bb5', 'g6']);
  });

  it('countMaterial tallies standard piece weights', () => {
    const counts = countMaterial(STARTING_FEN);
    assert.equal(counts.white, 39);
    assert.equal(counts.black, 39);
    assert.equal(counts.materialDifference, 0);

    const queenOdds = countMaterial('rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    assert.equal(queenOdds.white, 39);
    assert.equal(queenOdds.black, 30);
    assert.equal(queenOdds.materialDifference, 9);
  });
});
