import { STARTING_FEN, BOARD_FILES, BOARD_RANKS } from './constants';

export interface ParsedPgn {
  headers: Record<string, string>;
  moves: string[];
  result: string;
}

export function parseFen(fen: string = STARTING_FEN): (string | null)[][] {
  const parts = fen.trim().split(' ');
  const boardPart = parts[0] || '';
  const rows = boardPart.split('/');
  const board: (string | null)[][] = [];

  for (let r = 0; r < 8; r++) {
    const rowStr = rows[r] || '8';
    const row: (string | null)[] = [];
    for (const ch of rowStr) {
      if (/\d/.test(ch)) {
        const count = parseInt(ch, 10);
        for (let i = 0; i < count; i++) {
          row.push(null);
        }
      } else {
        row.push(ch);
      }
    }
    board.push(row);
  }

  return board;
}

export function squareToCoords(square: string): { row: number; col: number } {
  const file = square[0]?.toLowerCase();
  const rank = square[1];
  const col = BOARD_FILES.indexOf(file as (typeof BOARD_FILES)[number]);
  const row = BOARD_RANKS.indexOf(rank as (typeof BOARD_RANKS)[number]);
  return { row: row !== -1 ? row : 0, col: col !== -1 ? col : 0 };
}

export function coordsToSquare(row: number, col: number): string {
  const file = BOARD_FILES[col] || 'a';
  const rank = BOARD_RANKS[row] || '1';
  return `${file}${rank}`;
}

export function parsePgn(pgnString: string): ParsedPgn {
  const headers: Record<string, string> = {};
  const lines = pgnString.trim().split('\n');
  const moveLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const match = trimmed.match(/^\[([A-Za-z0-9_]+)\s+"(.*)"\]$/);
      if (match && match[1] && match[2] !== undefined) {
        headers[match[1]] = match[2];
      }
    } else if (trimmed.length > 0) {
      moveLines.push(trimmed);
    }
  }

  let fullMoveText = moveLines.join(' ');
  fullMoveText = fullMoveText.replace(/\{[^}]*\}/g, ' ');
  fullMoveText = fullMoveText.replace(/\([^)]*\)/g, ' ');

  const resultMatches = fullMoveText.match(/(1-0|0-1|1\/2-1\/2|\*)$/);
  const result = resultMatches ? resultMatches[0] : (headers['Result'] || '*');
  if (resultMatches) {
    fullMoveText = fullMoveText.substring(0, fullMoveText.lastIndexOf(result)).trim();
  }

  const rawTokens = fullMoveText.split(/\s+/).filter(Boolean);
  const moves: string[] = [];

  for (const token of rawTokens) {
    const cleaned = token.replace(/^\d+\.+/, '').replace(/\$\d+/g, '').trim();
    if (cleaned && !['1-0', '0-1', '1/2-1/2', '*'].includes(cleaned)) {
      moves.push(cleaned);
    }
  }

  return {
    headers,
    moves,
    result,
  };
}

export function getPieceAtSquare(fen: string, square: string): string | null {
  const board = parseFen(fen);
  const { row, col } = squareToCoords(square);
  return board[row]?.[col] || null;
}

export function getTurnFromFen(fen: string): 'white' | 'black' {
  const parts = fen.trim().split(' ');
  return parts[1] === 'b' ? 'black' : 'white';
}
