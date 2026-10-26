export interface ChessTitleInfo {
  code: string;
  name: string;
  ratingThreshold: number;
  normsRequired: string;
  badgeColor: string;
  badgeBg: string;
  description: string;
  notableHolders: string[];
}

export const CHESS_TITLES: Record<string, ChessTitleInfo> = {
  GM: {
    code: 'GM',
    name: 'Grandmaster',
    ratingThreshold: 2500,
    normsRequired: '3 Grandmaster norms across 27+ rated tournament games',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    description: 'The highest honor in competitive chess awarded by FIDE, held for life.',
    notableHolders: ['Magnus Carlsen', 'Garry Kasparov', 'Hikaru Nakamura', 'Bobby Fischer'],
  },
  WGM: {
    code: 'WGM',
    name: 'Woman Grandmaster',
    ratingThreshold: 2300,
    normsRequired: '3 WGM norms across international rated competition',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    description: 'Premier women-specific title awarded by the International Chess Federation.',
    notableHolders: ['Hou Yifan', 'Ju Wenjun', 'Humpy Koneru', 'Alexandra Kosteniuk'],
  },
  IM: {
    code: 'IM',
    name: 'International Master',
    ratingThreshold: 2400,
    normsRequired: '3 IM norms across 27+ international games',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.18)',
    description: 'Prestigious master title ranking directly below Grandmaster.',
    notableHolders: ['Levy Rozman (GothamChess)', 'Marc Esserman', 'Greg Shahade'],
  },
  WIM: {
    code: 'WIM',
    name: 'Woman International Master',
    ratingThreshold: 2200,
    normsRequired: '3 WIM norms across rated tournament play',
    badgeColor: '#d946ef',
    badgeBg: 'rgba(217, 70, 239, 0.18)',
    description: 'International master designation for women players.',
    notableHolders: ['Anna Cramling', 'Botez sisters', 'Dinara Wagner'],
  },
  FM: {
    code: 'FM',
    name: 'FIDE Master',
    ratingThreshold: 2300,
    normsRequired: 'Direct rating threshold without norm requirements',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    description: 'Awarded immediately upon officially achieving a 2300 FIDE rating.',
    notableHolders: ['James Canty III', 'Mike Klein (FunMasterMike)'],
  },
  WFM: {
    code: 'WFM',
    name: 'Woman FIDE Master',
    ratingThreshold: 2100,
    normsRequired: 'Direct rating threshold without norm requirements',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.18)',
    description: 'Awarded immediately upon crossing the 2100 FIDE rating threshold.',
    notableHolders: ['Alexandra Botez', 'Nemo Zhou'],
  },
  CM: {
    code: 'CM',
    name: 'Candidate Master',
    ratingThreshold: 2200,
    normsRequired: 'Direct rating threshold without norm requirements',
    badgeColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.18)',
    description: 'Awarded upon reaching a 2200 Elo rating in official FIDE competition.',
    notableHolders: ['Andrea Botez', 'Eric Rosen (formerly)'],
  },
  WCM: {
    code: 'WCM',
    name: 'Woman Candidate Master',
    ratingThreshold: 2000,
    normsRequired: 'Direct rating threshold without norm requirements',
    badgeColor: '#14b8a6',
    badgeBg: 'rgba(20, 184, 166, 0.18)',
    description: 'First official international title milestone for competitive women players.',
    notableHolders: ['Veronika Exler', 'Fiona Steil-Antoni'],
  },
};

export function getTitleDetails(titleCode?: string): ChessTitleInfo | undefined {
  if (!titleCode) return undefined;
  return CHESS_TITLES[titleCode.toUpperCase()];
}
