import { parseFen, squareToCoords, coordsToSquare, getTurnFromFen } from './fenPgn';
import { PieceColor } from '@/types/chess';

export interface MoveStep {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  isCheck?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export type GameTerminationState =
  | 'active'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'fifty_moves_rule';

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

  if (movingPiece === 'K' && from === 'e1' && to === 'g1') {
    newBoard[7][6] = 'K';
    newBoard[7][7] = null;
    newBoard[7][5] = 'R';
    return newBoard;
  }
  if (movingPiece === 'K' && from === 'e1' && to === 'c1') {
    newBoard[7][2] = 'K';
    newBoard[7][0] = null;
    newBoard[7][3] = 'R';
    return newBoard;
  }
  if (movingPiece === 'k' && from === 'e8' && to === 'g8') {
    newBoard[0][6] = 'k';
    newBoard[0][7] = null;
    newBoard[0][5] = 'r';
    return newBoard;
  }
  if (movingPiece === 'k' && from === 'e8' && to === 'c8') {
    newBoard[0][2] = 'k';
    newBoard[0][0] = null;
    newBoard[0][3] = 'r';
    return newBoard;
  }

  if (movingPiece?.toLowerCase() === 'p' && fc !== tc && !newBoard[tr][tc]) {
    newBoard[fr][tc] = null;
  }

  newBoard[tr][tc] = promotionPiece ? promotionPiece : movingPiece;
  return newBoard;
}

export function generatePseudoLegalMoves(fen: string): MoveStep[] {
  const parts = fen.trim().split(/\s+/);
  const board = parseFen(fen);
  const turn = getTurnFromFen(fen);
  const castlingPart = parts[2] || '-';
  const enPassantPart = parts[3] || '-';
  const opponentColor: PieceColor = turn === 'white' ? 'black' : 'white';
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
            const to = coordsToSquare(capR, capC);
            if (target && getPieceColor(target) !== turn) {
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
            } else if (!target && enPassantPart !== '-' && to === enPassantPart) {
              moves.push({
                from,
                to,
                piece,
                captured: turn === 'white' ? 'p' : 'P',
                isEnPassant: true,
              });
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

        if (turn === 'white' && r === 7 && c === 4) {
          if (
            castlingPart.includes('K') &&
            !board[7][5] &&
            !board[7][6] &&
            board[7][7] === 'R' &&
            !isSquareAttacked(board, 'e1', opponentColor) &&
            !isSquareAttacked(board, 'f1', opponentColor) &&
            !isSquareAttacked(board, 'g1', opponentColor)
          ) {
            moves.push({ from: 'e1', to: 'g1', piece: 'K', isCastling: true });
          }
          if (
            castlingPart.includes('Q') &&
            !board[7][3] &&
            !board[7][2] &&
            !board[7][1] &&
            board[7][0] === 'R' &&
            !isSquareAttacked(board, 'e1', opponentColor) &&
            !isSquareAttacked(board, 'd1', opponentColor) &&
            !isSquareAttacked(board, 'c1', opponentColor)
          ) {
            moves.push({ from: 'e1', to: 'c1', piece: 'K', isCastling: true });
          }
        } else if (turn === 'black' && r === 0 && c === 4) {
          if (
            castlingPart.includes('k') &&
            !board[0][5] &&
            !board[0][6] &&
            board[0][7] === 'r' &&
            !isSquareAttacked(board, 'e8', opponentColor) &&
            !isSquareAttacked(board, 'f8', opponentColor) &&
            !isSquareAttacked(board, 'g8', opponentColor)
          ) {
            moves.push({ from: 'e8', to: 'g8', piece: 'k', isCastling: true });
          }
          if (
            castlingPart.includes('q') &&
            !board[0][3] &&
            !board[0][2] &&
            !board[0][1] &&
            board[0][0] === 'r' &&
            !isSquareAttacked(board, 'e8', opponentColor) &&
            !isSquareAttacked(board, 'd8', opponentColor) &&
            !isSquareAttacked(board, 'c8', opponentColor)
          ) {
            moves.push({ from: 'e8', to: 'c8', piece: 'k', isCastling: true });
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

export function isInsufficientMaterial(fen: string): boolean {
  const board = parseFen(fen);
  const whiteBishops: { r: number; c: number }[] = [];
  const blackBishops: { r: number; c: number }[] = [];
  let whiteKnights = 0;
  let blackKnights = 0;
  let otherPieces = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.toLowerCase() === 'k') continue;
      if (p === 'B') whiteBishops.push({ r, c });
      else if (p === 'b') blackBishops.push({ r, c });
      else if (p === 'N') whiteKnights++;
      else if (p === 'n') blackKnights++;
      else otherPieces++;
    }
  }

  if (otherPieces > 0) return false;

  const totalMinors = whiteBishops.length + blackBishops.length + whiteKnights + blackKnights;
  if (totalMinors === 0) return true;
  if (totalMinors === 1) return true;

  if (whiteBishops.length === 1 && blackBishops.length === 1 && whiteKnights === 0 && blackKnights === 0) {
    const wbIsLight = (whiteBishops[0].r + whiteBishops[0].c) % 2 === 0;
    const bbIsLight = (blackBishops[0].r + blackBishops[0].c) % 2 === 0;
    if (wbIsLight === bbIsLight) return true;
  }

  return false;
}

export function getGameState(fen: string): GameTerminationState {
  const parts = fen.trim().split(/\s+/);
  const halfmove = parts[4] ? parseInt(parts[4], 10) : 0;
  if (halfmove >= 100) {
    return 'fifty_moves_rule';
  }

  if (isInsufficientMaterial(fen)) {
    return 'insufficient_material';
  }

  const turn = getTurnFromFen(fen);
  const inCheck = isKingInCheck(fen, turn);
  const legalMoves = generateLegalMoves(fen);

  if (legalMoves.length === 0) {
    return inCheck ? 'checkmate' : 'stalemate';
  }

  return inCheck ? 'check' : 'active';
}

function updateCastlingRights(
  currentRights: string,
  from: string,
  to: string,
  piece: string
): string {
  if (currentRights === '-') return '-';
  let rights = currentRights;

  if (piece === 'K') {
    rights = rights.replace('K', '').replace('Q', '');
  } else if (piece === 'k') {
    rights = rights.replace('k', '').replace('q', '');
  } else if (piece === 'R') {
    if (from === 'h1') rights = rights.replace('K', '');
    if (from === 'a1') rights = rights.replace('Q', '');
  } else if (piece === 'r') {
    if (from === 'h8') rights = rights.replace('k', '');
    if (from === 'a8') rights = rights.replace('q', '');
  }

  if (to === 'h1') rights = rights.replace('K', '');
  if (to === 'a1') rights = rights.replace('Q', '');
  if (to === 'h8') rights = rights.replace('k', '');
  if (to === 'a8') rights = rights.replace('q', '');

  return rights.length > 0 ? rights : '-';
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
  const { row: fr } = squareToCoords(from);
  const { row: tr } = squareToCoords(to);
  const movingPiece = board[fr][squareToCoords(from).col] || '';

  const nextBoard = makeHypotheticalMove(board, from, to, promotion);
  const nextBoardFen = boardToFenPart(nextBoard);
  const nextTurn = turn === 'white' ? 'b' : 'w';

  const rawCastling = parts[2] || '-';
  const nextCastling = updateCastlingRights(rawCastling, from, to, movingPiece);

  let nextEnPassant = '-';
  if (movingPiece.toLowerCase() === 'p' && Math.abs(fr - tr) === 2) {
    const epRow = (fr + tr) / 2;
    nextEnPassant = coordsToSquare(epRow, squareToCoords(from).col);
  }

  const isPawnMove = movingPiece.toLowerCase() === 'p';
  const isCapture = Boolean(board[tr][squareToCoords(to).col]) || (isPawnMove && from[0] !== to[0]);
  const prevHalfmove = parts[4] ? parseInt(parts[4], 10) : 0;
  const nextHalfmove = isPawnMove || isCapture ? '0' : String(prevHalfmove + 1);

  const prevFullmove = parts[5] ? parseInt(parts[5], 10) : 1;
  const nextFullmove = turn === 'black' ? String(prevFullmove + 1) : String(prevFullmove);

  return `${nextBoardFen} ${nextTurn} ${nextCastling} ${nextEnPassant} ${nextHalfmove} ${nextFullmove}`;
}
