import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSanMove,
  formatMoveToSan,
  formatUciToSan,
  InvalidSanMoveError,
} from '@/lib/sanNotation';
import { executeMoveOnFen, generateLegalMoves } from '@/lib/moveEngine';
import { STARTING_FEN } from '@/lib/constants';

describe('Bidirectional SAN Notation Parser and Formatter', () => {
  it('parses standard opening moves, captures, and en passant SAN', () => {
    let fen = STARTING_FEN;
    const moves = ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4'];

    for (const san of moves) {
      const step = parseSanMove(fen, san);
      fen = executeMoveOnFen(fen, step.from, step.to, step.promotion);
    }

    assert.ok(fen.includes('rnbqkbnr/pp2pppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R'));

    const epFen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3';
    const epStep = parseSanMove(epFen, 'exd6');
    assert.equal(epStep.from, 'e5');
    assert.equal(epStep.to, 'd6');
    assert.equal(epStep.isEnPassant, true);
  });

  it('handles kingside and queenside castling in O and 0 notation', () => {
    const castleFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';

    const oo = parseSanMove(castleFen, 'O-O');
    assert.equal(oo.from, 'e1');
    assert.equal(oo.to, 'g1');
    assert.equal(oo.isCastling, true);

    const ooo = parseSanMove(castleFen, '0-0-0');
    assert.equal(ooo.from, 'e1');
    assert.equal(ooo.to, 'c1');
    assert.equal(ooo.isCastling, true);
  });

  it('resolves file, rank, and full-square disambiguation accurately', () => {
    const fileDisambigFen = '4k3/8/8/8/8/8/8/R3K2R w - - 0 1';
    const rFromA = parseSanMove(fileDisambigFen, 'Rad1');
    assert.equal(rFromA.from, 'a1');
    assert.equal(rFromA.to, 'd1');

    const rankDisambigFen = '4k3/8/8/R7/8/R7/8/4K3 w - - 0 1';
    const rFromRank3 = parseSanMove(rankDisambigFen, 'R3a4');
    assert.equal(rFromRank3.from, 'a3');
    assert.equal(rFromRank3.to, 'a4');

    const tripleQueenFen = '7k/8/8/Q7/8/8/8/Q3Q2K w - - 0 1';
    const qFromA1 = parseSanMove(tripleQueenFen, 'Qa1e5');
    assert.equal(qFromA1.from, 'a1');
    assert.equal(qFromA1.to, 'e5');
  });

  it('parses pawn promotions and underpromotions cleanly', () => {
    const promoFen = '8/P1k5/8/8/8/8/8/4K3 w - - 0 1';
    const underPromo = parseSanMove(promoFen, 'a8=N+');
    assert.equal(underPromo.from, 'a7');
    assert.equal(underPromo.to, 'a8');
    assert.equal(underPromo.promotion, 'N');
    assert.equal(underPromo.isCheck, true);

    const bareQueenPromo = parseSanMove(promoFen, 'a8Q');
    assert.equal(bareQueenPromo.promotion, 'Q');
  });

  it('throws InvalidSanMoveError on illegal, malformed, or ambiguous SAN moves', () => {
    assert.throws(() => parseSanMove(STARTING_FEN, 'Nf6'), InvalidSanMoveError);
    assert.throws(() => parseSanMove(STARTING_FEN, 'O-O'), InvalidSanMoveError);
    assert.throws(() => parseSanMove(STARTING_FEN, 'Z99'), InvalidSanMoveError);

    const fileDisambigFen = '4k3/8/8/8/8/8/6K1/R6R w - - 0 1';
    assert.throws(() => parseSanMove(fileDisambigFen, 'Rd1'), InvalidSanMoveError);
  });

  it('formats MoveStep and UCI into canonical minimal-disambiguated SAN with check/mate suffixes', () => {
    const scholarThreatFen = 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4';
    const legal = generateLegalMoves(scholarThreatFen);
    const mateMove = legal.find((m) => m.from === 'f3' && m.to === 'f7')!;
    assert.equal(formatMoveToSan(scholarThreatFen, mateMove, legal), 'Qxf7#');
    assert.equal(formatUciToSan(scholarThreatFen, 'f3f7', legal), 'Qxf7#');

    const tripleQueenFen = '7k/8/8/Q7/8/8/8/Q3Q2K w - - 0 1';
    const qMoves = generateLegalMoves(tripleQueenFen);
    const qa1e5 = qMoves.find((m) => m.from === 'a1' && m.to === 'e5')!;
    assert.equal(formatMoveToSan(tripleQueenFen, qa1e5, qMoves), 'Qa1e5+');
  });
});