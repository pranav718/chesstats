import { ChessGame } from '@/types/chess';
import { STARTING_FEN } from './constants';
import { computeZobristHash, zobristHashToHex } from './zobrist';

export interface OpeningTreeNode {
  zobristKey: string;
  fen: string;
  moveSan?: string;
  totalGames: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  whiteWinRate: number;
  blackWinRate: number;
  drawRate: number;
  children: Map<string, OpeningTreeNode>;
}

export interface MoveContinuationStats {
  san: string;
  totalGames: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  whiteWinRate: number;
  blackWinRate: number;
  drawRate: number;
  nextZobristKey: string;
}

function calculateRates(total: number, w: number, b: number, d: number) {
  if (total === 0) {
    return { whiteWinRate: 33.3, blackWinRate: 33.3, drawRate: 33.4 };
  }
  return {
    whiteWinRate: Math.round((w / total) * 1000) / 10,
    blackWinRate: Math.round((b / total) * 1000) / 10,
    drawRate: Math.round((d / total) * 1000) / 10,
  };
}

export class OpeningTreeBuilder {
  private nodeRegistry: Map<string, OpeningTreeNode>;
  private root: OpeningTreeNode;

  constructor() {
    this.nodeRegistry = new Map();
    const rootHash = zobristHashToHex(computeZobristHash(STARTING_FEN));
    this.root = {
      zobristKey: rootHash,
      fen: STARTING_FEN,
      totalGames: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      whiteWinRate: 0,
      blackWinRate: 0,
      drawRate: 0,
      children: new Map(),
    };
    this.nodeRegistry.set(rootHash, this.root);
  }

  getRoot(): OpeningTreeNode {
    return this.root;
  }

  addGame(game: ChessGame, maxPly: number = 24): void {
    const winner = game.winner;
    const isWhiteWin = winner === 'white';
    const isBlackWin = winner === 'black';
    const isDraw = !winner || game.result === '1/2-1/2';

    let currentNode = this.root;
    currentNode.totalGames++;
    if (isWhiteWin) currentNode.whiteWins++;
    else if (isBlackWin) currentNode.blackWins++;
    else if (isDraw) currentNode.draws++;

    const rates = calculateRates(
      currentNode.totalGames,
      currentNode.whiteWins,
      currentNode.blackWins,
      currentNode.draws
    );
    currentNode.whiteWinRate = rates.whiteWinRate;
    currentNode.blackWinRate = rates.blackWinRate;
    currentNode.drawRate = rates.drawRate;

    const moves = (game.moves || []).slice(0, maxPly);

    for (const move of moves) {
      const fen = move.fen;
      const hash = zobristHashToHex(computeZobristHash(fen));
      const san = move.san;

      let nextNode = currentNode.children.get(san);

      if (!nextNode) {
        if (this.nodeRegistry.has(hash)) {
          nextNode = this.nodeRegistry.get(hash)!;
        } else {
          nextNode = {
            zobristKey: hash,
            fen,
            moveSan: san,
            totalGames: 0,
            whiteWins: 0,
            blackWins: 0,
            draws: 0,
            whiteWinRate: 0,
            blackWinRate: 0,
            drawRate: 0,
            children: new Map(),
          };
          this.nodeRegistry.set(hash, nextNode);
        }
        currentNode.children.set(san, nextNode);
      }

      nextNode.totalGames++;
      if (isWhiteWin) nextNode.whiteWins++;
      else if (isBlackWin) nextNode.blackWins++;
      else if (isDraw) nextNode.draws++;

      const nextRates = calculateRates(
        nextNode.totalGames,
        nextNode.whiteWins,
        nextNode.blackWins,
        nextNode.draws
      );
      nextNode.whiteWinRate = nextRates.whiteWinRate;
      nextNode.blackWinRate = nextRates.blackWinRate;
      nextNode.drawRate = nextRates.drawRate;

      currentNode = nextNode;
    }
  }

  findNodeByFen(fen: string): OpeningTreeNode | null {
    const hash = zobristHashToHex(computeZobristHash(fen));
    return this.nodeRegistry.get(hash) || null;
  }

  getContinuations(fen: string): MoveContinuationStats[] {
    const node = this.findNodeByFen(fen);
    if (!node) return [];

    const result: MoveContinuationStats[] = [];

    node.children.forEach((childNode, san) => {
      result.push({
        san,
        totalGames: childNode.totalGames,
        whiteWins: childNode.whiteWins,
        blackWins: childNode.blackWins,
        draws: childNode.draws,
        whiteWinRate: childNode.whiteWinRate,
        blackWinRate: childNode.blackWinRate,
        drawRate: childNode.drawRate,
        nextZobristKey: childNode.zobristKey,
      });
    });

    return result.sort((a, b) => b.totalGames - a.totalGames);
  }
}

export function buildOpeningTree(games: ChessGame[], maxPly: number = 24): OpeningTreeBuilder {
  const tree = new OpeningTreeBuilder();
  for (const game of games) {
    tree.addGame(game, maxPly);
  }
  return tree;
}
