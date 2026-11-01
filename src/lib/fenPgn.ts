import { STARTING_FEN, BOARD_FILES, BOARD_RANKS } from './constants';

export interface ParsedPgn {
  headers: Record<string, string>;
  moves: string[];
  result: string;
}

export interface FenValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFen(fen: string): FenValidationResult {
  if (!fen || typeof fen !== 'string') {
    return { valid: false, error: 'FEN must be a non-empty string' };
  }

  const parts = fen.trim().split(/\s+/);
  if (parts.length < 2 || parts.length > 6) {
    return { valid: false, error: `Invalid number of FEN fields: expected 2 to 6, received ${parts.length}` };
  }

  const [boardPart, turnPart, castlingPart, enPassantPart] = parts;
  const ranks = boardPart.split('/');
  if (ranks.length !== 8) {
    return { valid: false, error: `Board part must have 8 ranks separated by '/', found ${ranks.length}` };
  }

  const validPieces = new Set(['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']);
  let whiteKings = 0;
  let blackKings = 0;

  for (let r = 0; r < 8; r++) {
    const rankStr = ranks[r];
    let fileCount = 0;

    for (const char of rankStr) {
      if (/\d/.test(char)) {
        const emptyCount = parseInt(char, 10);
        if (emptyCount < 1 || emptyCount > 8) {
          return { valid: false, error: `Invalid digit '${char}' in rank ${r + 1}` };
        }
        fileCount += emptyCount;
      } else if (validPieces.has(char)) {
        fileCount += 1;
        if (char === 'K') whiteKings++;
        if (char === 'k') blackKings++;
      } else {
        return { valid: false, error: `Invalid piece character '${char}' in rank ${r + 1}` };
      }
    }

    if (fileCount !== 8) {
      return { valid: false, error: `Rank ${r + 1} has ${fileCount} squares instead of 8` };
    }
  }

  if (whiteKings !== 1 || blackKings !== 1) {
    return { valid: false, error: `Invalid king count: white has ${whiteKings}, black has ${blackKings}` };
  }

  if (turnPart !== 'w' && turnPart !== 'b') {
    return { valid: false, error: `Invalid turn indicator '${turnPart}': must be 'w' or 'b'` };
  }

  if (castlingPart && castlingPart !== '-') {
    const validCastling = /^[KQkq]{1,4}$/;
    if (!validCastling.test(castlingPart)) {
      return { valid: false, error: `Invalid castling rights '${castlingPart}'` };
    }
  }

  if (enPassantPart && enPassantPart !== '-') {
    const validEnPassant = /^[a-h][36]$/;
    if (!validEnPassant.test(enPassantPart)) {
      return { valid: false, error: `Invalid en passant square '${enPassantPart}'` };
    }
  }

  return { valid: true };
}

export function parseFen(fen: string = STARTING_FEN): (string | null)[][] {
  const parts = (fen || '').trim().split(/\s+/);
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
    while (row.length < 8) {
      row.push(null);
    }
    board.push(row.slice(0, 8));
  }

  return board;
}

export function squareToCoords(square: string): { row: number; col: number } {
  if (!square || square.length < 2) {
    return { row: 0, col: 0 };
  }
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

export function extractPgnMoves(pgnText: string): string[] {
  let cleaned = pgnText
    .replace(/\[.*?\]/g, ' ')
    .replace(/\{[\s\S]*?\}/g, ' ')
    .replace(/\([\s\S]*?\)/g, ' ')
    .replace(/\$\d+/g, ' ');

  cleaned = cleaned.replace(/(1-0|0-1|1\/2-1\/2|\*)/g, ' ');

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const moves: string[] = [];

  for (const token of tokens) {
    const move = token.replace(/^\d+(\.+|\.{3})/, '').trim();
    if (move && !['1-0', '0-1', '1/2-1/2', '*'].includes(move)) {
      moves.push(move);
    }
  }

  return moves;
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

  const moves = extractPgnMoves(moveLines.join(' '));

  let result = headers['Result'] || '*';
  const fullText = moveLines.join(' ');
  const resultMatch = fullText.match(/(1-0|0-1|1\/2-1\/2|\*)$/);
  if (resultMatch) {
    result = resultMatch[0];
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
  const parts = (fen || '').trim().split(/\s+/);
  return parts[1] === 'b' ? 'black' : 'white';
}

export function countMaterial(fen: string): { white: number; black: number; materialDifference: number } {
  const pieceValues: Record<string, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
  };

  const board = parseFen(fen);
  let white = 0;
  let black = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const lower = piece.toLowerCase();
      const val = pieceValues[lower] || 0;
      if (piece === piece.toUpperCase()) {
        white += val;
      } else {
        black += val;
      }
    }
  }

  return {
    white,
    black,
    materialDifference: white - black,
  };
}
