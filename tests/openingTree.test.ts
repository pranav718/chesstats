import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OpeningTreeBuilder, buildOpeningTree } from '@/lib/openingTree';
import { ChessGame } from '@/types/chess';
import { STARTING_FEN } from '@/lib/constants';

function createMockOpeningGame(moves: { san: string; fen: string }[], winner: 'white' | 'black' | undefined): ChessGame {
  return {
    id: `game-${Math.random()}`,
    url: 'https://chess.com/game/1',
    pgn: '',
    fen: STARTING_FEN,
    white: { username: 'whitePlayer', rating: 2600, result: winner === 'white' ? 'win' : winner === 'black' ? 'loss' : 'draw' },
    black: { username: 'blackPlayer', rating: 2600, result: winner === 'black' ? 'win' : winner === 'white' ? 'loss' : 'draw' },
    winner,
    result: winner === 'white' ? '1-0' : winner === 'black' ? '0-1' : '1/2-1/2',
    timeControl: '300+0',
    timeClass: 'blitz',
    date: '2025-10-15',
    moves: moves.map((m, idx) => ({
      ply: idx + 1,
      moveNumber: Math.floor(idx / 2) + 1,
      san: m.san,
      uci: 'e2e4',
      fen: m.fen,
      evaluation: 20,
      classification: 'best',
      playedBy: idx % 2 === 0 ? 'white' : 'black',
    })),
    platform: 'chesscom',
  };
}

describe('Opening Repertoire DAG and Transposition Trie', () => {
  it('initializes with root at starting FEN and empty children', () => {
    const builder = new OpeningTreeBuilder();
    const root = builder.getRoot();
    assert.equal(root.fen, STARTING_FEN);
    assert.equal(root.totalGames, 0);
    assert.equal(root.children.size, 0);
  });

  it('aggregates game counts and win percentages accurately across plies', () => {
    const fenE4 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const fenE5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';

    const game1 = createMockOpeningGame([
      { san: 'e4', fen: fenE4 },
      { san: 'e5', fen: fenE5 },
    ], 'white');

    const game2 = createMockOpeningGame([
      { san: 'e4', fen: fenE4 },
      { san: 'e5', fen: fenE5 },
    ], 'black');

    const builder = buildOpeningTree([game1, game2]);
    const root = builder.getRoot();
    assert.equal(root.totalGames, 2);
    assert.equal(root.whiteWinRate, 50);
    assert.equal(root.blackWinRate, 50);

    const continuations = builder.getContinuations(STARTING_FEN);
    assert.equal(continuations.length, 1);
    assert.equal(continuations[0].san, 'e4');
    assert.equal(continuations[0].totalGames, 2);
  });

  it('unifies transpositions arriving via different move orders into the same node', () => {
    const fenD4 = 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';
    const fenD4Nf6 = 'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2';
    const fenTransposition = 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2';

    const fenC4 = 'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq c3 0 1';
    const fenC4Nf6 = 'rnbqkb1r/pppppppp/5n2/8/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 1 2';

    const orderA = createMockOpeningGame([
      { san: 'd4', fen: fenD4 },
      { san: 'Nf6', fen: fenD4Nf6 },
      { san: 'c4', fen: fenTransposition },
    ], 'white');

    const orderB = createMockOpeningGame([
      { san: 'c4', fen: fenC4 },
      { san: 'Nf6', fen: fenC4Nf6 },
      { san: 'd4', fen: fenTransposition },
    ], 'black');

    const builder = buildOpeningTree([orderA, orderB]);
    const transposedNode = builder.findNodeByFen(fenTransposition);

    assert.ok(transposedNode !== null);
    assert.equal(transposedNode.totalGames, 2);
    assert.equal(transposedNode.whiteWins, 1);
    assert.equal(transposedNode.blackWins, 1);
    assert.equal(transposedNode.whiteWinRate, 50);
  });
});
