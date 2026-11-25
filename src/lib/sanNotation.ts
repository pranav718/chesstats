import {
  generateLegalMoves,
  executeMoveOnFen,
  getGameState,
  MoveStep,
} from './moveEngine';

export class InvalidSanMoveError extends Error {
  public readonly san: string;
  public readonly fen: string;
  public readonly reason: string;

  constructor(san: string, fen: string, reason: string) {
    super(`Invalid SAN move "${san}": ${reason}`);
    this.name = 'InvalidSanMoveError';
    this.san = san;
    this.fen = fen;
    this.reason = reason;
  }
}

export function parseSanMove(fen: string, rawSan: string): MoveStep {
  if (!rawSan || typeof rawSan !== 'string') {
    throw new InvalidSanMoveError(String(rawSan), fen, 'Move token must be a non-empty string');
  }

  const core = rawSan.trim().replace(/[+#!?]+$/g, '');
  if (!core) {
    throw new InvalidSanMoveError(rawSan, fen, 'Move token is empty after stripping annotations');
  }

  const legalMoves = generateLegalMoves(fen);
  const castleNormalized = core.replace(/0/g, 'O');

  if (castleNormalized === 'O-O' || castleNormalized === 'O-O-O') {
    const targetFile = castleNormalized === 'O-O' ? 'g' : 'c';
    const castleMove = legalMoves.find((m) => m.isCastling && m.to[0] === targetFile);
    if (!castleMove) {
      throw new InvalidSanMoveError(rawSan, fen, `Castling ${castleNormalized} is illegal in current position`);
    }
    return castleMove;
  }

  const sanPattern = /^([KQRBN])?([a-h])?([1-8])?(x)?([a-h][1-8])(?:=([QRBNqrbn])|([QRBN]))?$/;
  const match = core.match(sanPattern);

  if (!match) {
    throw new InvalidSanMoveError(rawSan, fen, 'Token does not conform to Standard Algebraic Notation');
  }

  const [, pieceChar, sourceFile, sourceRank, captureMark, targetSquare, eqPromo, barePromo] = match;
  const expectedPiece = (pieceChar || 'P').toLowerCase();
  const promoChar = (eqPromo || barePromo)?.toLowerCase();
  const expectsCapture = Boolean(captureMark);

  const candidates = legalMoves.filter((m) => {
    if (m.piece.toLowerCase() !== expectedPiece) return false;
    if (m.to !== targetSquare) return false;
    if (expectsCapture !== Boolean(m.captured)) return false;
    if (sourceFile && m.from[0] !== sourceFile) return false;
    if (sourceRank && m.from[1] !== sourceRank) return false;

    const movePromo = m.promotion?.toLowerCase();
    if (promoChar) {
      if (movePromo !== promoChar) return false;
    } else if (movePromo) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) {
    throw new InvalidSanMoveError(rawSan, fen, 'No legal move matches the SAN specification');
  }

  if (candidates.length > 1) {
    throw new InvalidSanMoveError(rawSan, fen, 'Ambiguous SAN specification matches multiple legal moves');
  }

  return candidates[0];
}

export function formatMoveToSan(
  fen: string,
  move: MoveStep,
  cachedLegalMoves?: MoveStep[],
  nextFen?: string
): string {
  let base = '';

  if (move.isCastling) {
    base = move.to[0] === 'g' ? 'O-O' : 'O-O-O';
  } else if (move.piece.toLowerCase() === 'p') {
    if (move.captured) {
      base = `${move.from[0]}x${move.to}`;
    } else {
      base = move.to;
    }
    if (move.promotion) {
      base += `=${move.promotion.toUpperCase()}`;
    }
  } else {
    const pieceLetter = move.piece.toUpperCase();
    const legalMoves = cachedLegalMoves ?? generateLegalMoves(fen);
    const ambiguous = legalMoves.filter(
      (m) =>
        m.from !== move.from &&
        m.to === move.to &&
        m.piece.toLowerCase() === move.piece.toLowerCase()
    );

    let disambiguation = '';
    if (ambiguous.length > 0) {
      const sameFile = ambiguous.some((m) => m.from[0] === move.from[0]);
      const sameRank = ambiguous.some((m) => m.from[1] === move.from[1]);
      if (!sameFile) {
        disambiguation = move.from[0];
      } else if (!sameRank) {
        disambiguation = move.from[1];
      } else {
        disambiguation = move.from;
      }
    }

    const captureStr = move.captured ? 'x' : '';
    base = `${pieceLetter}${disambiguation}${captureStr}${move.to}`;
  }

  if (move.isCheck) {
    const resultingFen = nextFen ?? executeMoveOnFen(fen, move.from, move.to, move.promotion);
    const state = getGameState(resultingFen);
    base += state === 'checkmate' ? '#' : '+';
  }

  return base;
}

export function formatUciToSan(
  fen: string,
  uci: string,
  cachedLegalMoves?: MoveStep[]
): string | null {
  if (!uci || uci.length < 4) return null;
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci.slice(4).toLowerCase() : undefined;

  const legalMoves = cachedLegalMoves ?? generateLegalMoves(fen);
  const match = legalMoves.find(
    (m) =>
      m.from === from &&
      m.to === to &&
      (promotion ? m.promotion?.toLowerCase() === promotion : !m.promotion)
  );

  if (!match) return null;
  return formatMoveToSan(fen, match, legalMoves);
}