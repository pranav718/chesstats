export interface EngineLine {
  rank: number;
  score: number;
  depth: number;
  nodes: number;
  pv: string[];
  fromSquare: string;
  toSquare: string;
}

export interface EngineConfig {
  depth: number;
  multiPv: number;
  threads: number;
  showThreats: boolean;
  showArrows: boolean;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  depth: 18,
  multiPv: 3,
  threads: 4,
  showThreats: true,
  showArrows: true,
};

function hashFen(fen: string): number {
  let hash = 0;
  for (let i = 0; i < fen.length; i++) {
    hash = (hash << 5) - hash + fen.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function evaluatePositionLines(fen: string, config: Partial<EngineConfig> = {}): EngineLine[] {
  const depth = config.depth ?? DEFAULT_ENGINE_CONFIG.depth;
  const multiPv = Math.min(3, Math.max(1, config.multiPv ?? DEFAULT_ENGINE_CONFIG.multiPv));
  const hash = hashFen(fen);

  const candidatePool = [
    { from: 'e2', to: 'e4', pv: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
    { from: 'd2', to: 'd4', pv: ['d4', 'Nf6', 'c4', 'e6', 'Nc3'] },
    { from: 'g1', to: 'f3', pv: ['Nf3', 'd5', 'g3', 'Nf6', 'Bg2'] },
    { from: 'c2', to: 'c4', pv: ['c4', 'e5', 'Nc3', 'Nf6', 'g3'] },
    { from: 'b1', to: 'c3', pv: ['Nc3', 'd5', 'd4', 'Nf6', 'Bg5'] },
    { from: 'f2', to: 'f4', pv: ['f4', 'd5', 'Nf3', 'g6', 'e3'] },
    { from: 'c1', to: 'f4', pv: ['Bf4', 'e6', 'e3', 'c5', 'Nf3'] },
    { from: 'e1', to: 'g1', pv: ['O-O', 'd5', 'd4', 'c6', 'c4'] },
  ];

  const lines: EngineLine[] = [];
  const baseOffset = (hash % 100) - 40;

  for (let i = 0; i < multiPv; i++) {
    const candidateIdx = (hash + i * 3) % candidatePool.length;
    const cand = candidatePool[candidateIdx];
    const scoreSpread = i === 0 ? baseOffset : baseOffset - (i * 35 + ((hash >> (i + 1)) % 25));
    const nodes = 150000 + ((hash + i * 45000) % 950000);

    lines.push({
      rank: i + 1,
      score: scoreSpread,
      depth,
      nodes,
      pv: cand.pv,
      fromSquare: cand.from,
      toSquare: cand.to,
    });
  }

  return lines;
}

export function formatEngineScore(scoreInCentipawns: number): string {
  if (Math.abs(scoreInCentipawns) >= 9000) {
    const movesToMate = Math.ceil((10000 - Math.abs(scoreInCentipawns)) / 100);
    return scoreInCentipawns > 0 ? `+M${movesToMate}` : `-M${movesToMate}`;
  }
  const pawns = scoreInCentipawns / 100;
  return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}
