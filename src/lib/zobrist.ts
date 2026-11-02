import { parseFen, getTurnFromFen } from './fenPgn';

class XorShift64Star {
  private state: bigint;

  constructor(seed: bigint = BigInt('0x18581364a24f524e')) {
    this.state = seed === BigInt(0) ? BigInt('0x18581364a24f524e') : seed;
  }

  nextBigInt(): bigint {
    let x = this.state;
    x ^= x >> BigInt(12);
    x ^= x << BigInt(25);
    x ^= x >> BigInt(27);
    this.state = x;
    return (x * BigInt('0x2545f4914f6cdd1d')) & BigInt('0xffffffffffffffff');
  }
}

const PIECE_INDICES: Record<string, number> = {
  P: 0, N: 1, B: 2, R: 3, Q: 4, K: 5,
  p: 6, n: 7, b: 8, r: 9, q: 10, k: 11,
};

const rng = new XorShift64Star(BigInt('0x9e3779b97f4a7c15'));

const PIECE_KEYS: bigint[][] = Array.from({ length: 12 }, () =>
  Array.from({ length: 64 }, () => rng.nextBigInt())
);

const BLACK_TO_MOVE_KEY: bigint = rng.nextBigInt();

const CASTLING_KEYS: bigint[] = Array.from({ length: 16 }, () => rng.nextBigInt());

const EN_PASSANT_KEYS: bigint[] = Array.from({ length: 8 }, () => rng.nextBigInt());

function castlingToIndex(castlingPart: string): number {
  let idx = 0;
  if (castlingPart.includes('K')) idx |= 1;
  if (castlingPart.includes('Q')) idx |= 2;
  if (castlingPart.includes('k')) idx |= 4;
  if (castlingPart.includes('q')) idx |= 8;
  return idx;
}

export function computeZobristHash(fen: string): bigint {
  const parts = fen.trim().split(/\s+/);
  const board = parseFen(fen);
  let hash = BigInt(0);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const pieceIdx = PIECE_INDICES[piece];
      if (pieceIdx !== undefined) {
        const sqIdx = r * 8 + c;
        hash ^= PIECE_KEYS[pieceIdx][sqIdx];
      }
    }
  }

  if (getTurnFromFen(fen) === 'black') {
    hash ^= BLACK_TO_MOVE_KEY;
  }

  const castlingPart = parts[2] || '-';
  if (castlingPart !== '-') {
    const castlingIdx = castlingToIndex(castlingPart);
    hash ^= CASTLING_KEYS[castlingIdx];
  }

  const enPassantPart = parts[3] || '-';
  if (enPassantPart !== '-' && enPassantPart.length >= 2) {
    const fileChar = enPassantPart[0].toLowerCase();
    const fileIdx = fileChar.charCodeAt(0) - 97;
    if (fileIdx >= 0 && fileIdx < 8) {
      hash ^= EN_PASSANT_KEYS[fileIdx];
    }
  }

  return hash;
}

export function zobristHashToHex(hash: bigint): string {
  return hash.toString(16).padStart(16, '0');
}
