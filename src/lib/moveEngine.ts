import { parseFen, squareToCoords, coordsToSquare, getTurnFromFen } from './fenPgn';
import { PieceColor } from '@/types/chess';

export interface MoveStep {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  isCheck?: boolean;
}

export type GameTerminationState = 'active' | 'check' | 'checkmate' | 'stalemate';

const KNIGHT_DELTAS: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const KING_DELTAS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const BISHOP_RAYS: [number, number][] = [
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

const ROOK_RAYS: [number, number][] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];

function isInsideBoard(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getPieceColor(piece: string): PieceColor {
  return piece === piece.toUpperCase() ? 'white' : 'black';
}

export function isSquareAttacked(
  board: (string | null)[][],
  targetSquare: string,
  attackedBy: PieceColor
): boolean {
  const { row: tr, col: tc } = squareToCoords(targetSquare);

  for (const [dr, dc] of KNIGHT_DELTAS) {
    const nr = tr + dr;
    const nc = tc + dc;
    if (isInsideBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && getPieceColor(p) === attackedBy && p.toLowerCase() === 'n') {
        return true;
      }
    }
  }

  for (const [dr, dc] of KING_DELTAS) {
    const nr = tr + dr;
    const nc = tc + dc;
    if (isInsideBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && getPieceColor(p) === attackedBy && p.toLowerCase() === 'k') {
        return true;
      }
    }
  }

  const pawnForward = attackedBy === 'white' ? 1 : -1;
  const pawnAttackR = tr + pawnForward;
  for (const dc of [-1, 1]) {
    const pawnAttackC = tc + dc;
    if (isInsideBoard(pawnAttackR, pawnAttackC)) {
      const p = board[pawnAttackR][pawnAttackC];
      if (p && getPieceColor(p) === attackedBy && p.toLowerCase() === 'p') {
        return true;
      }
    }
  }

  for (const [dr, dc] of BISHOP_RAYS) {
    let r = tr + dr;
    let c = tc + dc;
    while (isInsideBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (getPieceColor(p) === attackedBy && (p.toLowerCase() === 'b' || p.toLowerCase() === 'q')) {
          return true;
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }

  for (const [dr, dc] of ROOK_RAYS) {
    let r = tr + dr;
    let c = tc + dc;
    while (isInsideBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (getPieceColor(p) === attackedBy && (p.toLowerCase() === 'r' || p.toLowerCase() === 'q')) {
          return true;
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }

  return false;
}

export function findKingSquare(board: (string | null)[][], color: PieceColor): string | null {
  const kingChar = color === 'white' ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) {
        return coordsToSquare(r, c);
      }
    }
  }
  return null;
}

export function isKingInCheck(fen: string, color: PieceColor): boolean {
  const board = parseFen(fen);
  const kingSq = findKingSquare(board, color);
  if (!kingSq) return false;
  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingSq, opponentColor);
}

export function boardToFenPart(board: (string | null)[][]): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = '';
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rowStr += String(emptyCount);
          emptyCount = 0;
        }
        rowStr += p;
      }
    }
    if (emptyCount > 0) {
      rowStr += String(emptyCount);
    }
    rows.push(rowStr);
  }
  return rows.join('/');
}

export function makeHypotheticalMove(
  board: (string | null)[][],
  from: string,
  to: string,
  promotionPiece?: string
): (string | null)[][] {
  const { row: fr, col: fc } = squareToCoords(from);
  const { row: tr, col: tc } = squareToCoords(to);
  const newBoard = board.map((row) => [...row]);
  const movingPiece = newBoard[fr][fc];
  newBoard[fr][fc] = null;
  newBoard[tr][tc] = promotionPiece ? promotionPiece : movingPiece;
  return newBoard;
}

export function generatePseudoLegalMoves(fen: string): MoveStep[] {
  const board = parseFen(fen);
  const turn = getTurnFromFen(fen);
  const moves: MoveStep[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || getPieceColor(piece) !== turn) continue;
      const from = coordsToSquare(r, c);
      const lower = piece.toLowerCase();

      if (lower === 'p') {
        const forward = turn === 'white' ? -1 : 1;
        const startRow = turn === 'white' ? 6 : 1;
        const promoRow = turn === 'white' ? 0 : 7;

        const oneStepR = r + forward;
        if (isInsideBoard(oneStepR, c) && !board[oneStepR][c]) {
          const to = coordsToSquare(oneStepR, c);
          if (oneStepR === promoRow) {
            for (const promo of ['q', 'r', 'b', 'n']) {
              moves.push({
                from,
                to,
                piece,
                promotion: turn === 'white' ? promo.toUpperCase() : promo,
              });
            }
          } else {
            moves.push({ from, to, piece });
          }

          const twoStepR = r + forward * 2;
          if (r === startRow && isInsideBoard(twoStepR, c) && !board[twoStepR][c]) {
            moves.push({ from, to: coordsToSquare(twoStepR, c), piece });
          }
        }

        for (const dc of [-1, 1]) {
          const capR = r + forward;
          const capC = c + dc;
          if (isInsideBoard(capR, capC)) {
            const target = board[capR][capC];
            if (target && getPieceColor(target) !== turn) {
              const to = coordsToSquare(capR, capC);
              if (capR === promoRow) {
                for (const promo of ['q', 'r', 'b', 'n']) {
                  moves.push({
                    from,
                    to,
                    piece,
                    captured: target,
                    promotion: turn === 'white' ? promo.toUpperCase() : promo,
                  });
                }
              } else {
                moves.push({ from, to, piece, captured: target });
              }
            }
          }
        }
      } else if (lower === 'n') {
        for (const [dr, dc] of KNIGHT_DELTAS) {
          const nr = r + dr;
          const nc = c + dc;
          if (isInsideBoard(nr, nc)) {
            const target = board[nr][nc];
            if (!target || getPieceColor(target) !== turn) {
              moves.push({
                from,
                to: coordsToSquare(nr, nc),
                piece,
                captured: target || undefined,
              });
            }
          }
        }
      } else if (lower === 'k') {
        for (const [dr, dc] of KING_DELTAS) {
          const nr = r + dr;
          const nc = c + dc;
          if (isInsideBoard(nr, nc)) {
            const target = board[nr][nc];
            if (!target || getPieceColor(target) !== turn) {
              moves.push({
                from,
                to: coordsToSquare(nr, nc),
                piece,
                captured: target || undefined,
              });
            }
          }
        }
      } else {
        const rays = lower === 'b' ? BISHOP_RAYS : lower === 'r' ? ROOK_RAYS : [...BISHOP_RAYS, ...ROOK_RAYS];
        for (const [dr, dc] of rays) {
          let stepR = r + dr;
          let stepC = c + dc;
          while (isInsideBoard(stepR, stepC)) {
            const target = board[stepR][stepC];
            if (!target) {
              moves.push({ from, to: coordsToSquare(stepR, stepC), piece });
            } else {
              if (getPieceColor(target) !== turn) {
                moves.push({ from, to: coordsToSquare(stepR, stepC), piece, captured: target });
              }
              break;
            }
            stepR += dr;
            stepC += dc;
          }
        }
      }
    }
  }

  return moves;
}

export function generateLegalMoves(fen: string): MoveStep[] {
  const board = parseFen(fen);
  const turn = getTurnFromFen(fen);
  const pseudoMoves = generatePseudoLegalMoves(fen);
  const legalMoves: MoveStep[] = [];
  const opponentColor: PieceColor = turn === 'white' ? 'black' : 'white';

  for (const m of pseudoMoves) {
    const nextBoard = makeHypotheticalMove(board, m.from, m.to, m.promotion);
    const kingSq = findKingSquare(nextBoard, turn);
    if (!kingSq) continue;
    if (!isSquareAttacked(nextBoard, kingSq, opponentColor)) {
      const oppKingSq = findKingSquare(nextBoard, opponentColor);
      const givesCheck = oppKingSq ? isSquareAttacked(nextBoard, oppKingSq, turn) : false;
      legalMoves.push({
        ...m,
        isCheck: givesCheck,
      });
    }
  }

  return legalMoves;
}

export function getGameState(fen: string): GameTerminationState {
  const turn = getTurnFromFen(fen);
  const inCheck = isKingInCheck(fen, turn);
  const legalMoves = generateLegalMoves(fen);

  if (legalMoves.length === 0) {
    return inCheck ? 'checkmate' : 'stalemate';
  }

  return inCheck ? 'check' : 'active';
}

export function executeMoveOnFen(
  fen: string,
  from: string,
  to: string,
  promotion?: string
): string {
  const parts = fen.trim().split(/\s+/);
  const board = parseFen(fen);
  const turn = getTurnFromFen(fen);
  const nextBoard = makeHypotheticalMove(board, from, to, promotion);
  const nextBoardFen = boardToFenPart(nextBoard);
  const nextTurn = turn === 'white' ? 'b' : 'w';

  const castling = parts[2] || '-';
  const enPassant = '-';
  const halfmove = parts[4] ? String(parseInt(parts[4], 10) + 1) : '0';
  const fullmove = turn === 'black' && parts[5] ? String(parseInt(parts[5], 10) + 1) : parts[5] || '1';

  return `${nextBoardFen} ${nextTurn} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
}
