export type TacticalTheme = 
  | 'fork' 
  | 'pin' 
  | 'skewer' 
  | 'discovered-attack' 
  | 'back-rank' 
  | 'deflection' 
  | 'overloaded-piece' 
  | 'hanging-piece' 
  | 'mate-in-1' 
  | 'mate-in-2' 
  | 'endgame-tactic';

export interface ChessPuzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  ratingDeviation?: number;
  themes: TacticalTheme[];
  openingFamily?: string;
  description: string;
  solutionSan: string[];
  playerTurn: 'white' | 'black';
}
