import { computeZobristHash, zobristHashToHex } from './zobrist';

export type NodeType = 'exact' | 'lowerbound' | 'upperbound';

export interface TranspositionEntry {
  key: string;
  depth: number;
  score: number;
  nodeType: NodeType;
  bestMove?: string;
  timestamp: number;
}

export interface TranspositionMetrics {
  size: number;
  maxCapacity: number;
  hits: number;
  misses: number;
  hitRatePercent: number;
}

export class TranspositionTable {
  private map: Map<string, TranspositionEntry>;
  private maxCapacity: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxCapacity: number = 50000) {
    this.map = new Map();
    this.maxCapacity = maxCapacity;
  }

  set(fen: string, depth: number, score: number, nodeType: NodeType, bestMove?: string): void {
    const hash = computeZobristHash(fen);
    const key = zobristHashToHex(hash);

    if (this.map.has(key)) {
      const existing = this.map.get(key)!;
      if (existing.depth <= depth) {
        this.map.delete(key);
        this.map.set(key, { key, depth, score, nodeType, bestMove, timestamp: Date.now() });
      }
      return;
    }

    if (this.map.size >= this.maxCapacity) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
      }
    }

    this.map.set(key, { key, depth, score, nodeType, bestMove, timestamp: Date.now() });
  }

  get(fen: string, minDepth: number = 0): TranspositionEntry | null {
    const hash = computeZobristHash(fen);
    const key = zobristHashToHex(hash);
    const entry = this.map.get(key);

    if (!entry || entry.depth < minDepth) {
      this.misses++;
      return null;
    }

    this.hits++;
    this.map.delete(key);
    this.map.set(key, entry);
    return entry;
  }

  getMetrics(): TranspositionMetrics {
    const total = this.hits + this.misses;
    const hitRatePercent = total > 0 ? Math.round((this.hits / total) * 1000) / 10 : 0;
    return {
      size: this.map.size,
      maxCapacity: this.maxCapacity,
      hits: this.hits,
      misses: this.misses,
      hitRatePercent,
    };
  }

  clear(): void {
    this.map.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

export const globalTranspositionTable = new TranspositionTable(50000);
