import { ChessGame } from '@/types/chess';

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPgn(game: ChessGame) {
  const filename = `${game.white.username}_vs_${game.black.username}_${game.date}.pgn`;
  downloadFile(filename, game.pgn, 'application/x-chess-pgn');
}

export function downloadFen(game: ChessGame) {
  const filename = `position_${game.id}.fen`;
  downloadFile(filename, game.fen, 'text/plain');
}

export function generateGameSummaryMarkdown(game: ChessGame): string {
  return `# Chess Match Summary
White: ${game.white.username} (${game.white.rating})
Black: ${game.black.username} (${game.black.rating})
Result: ${game.result} (${game.winReason || 'Standard'})
Opening: [${game.eco || 'A00'}] ${game.openingName || 'Standard Game'}
Time Control: ${game.timeControl} (${game.timeClass})
Date: ${game.date}

## Accuracy Breakdown
White Accuracy: ${game.accuracy?.white || '—'}%
Black Accuracy: ${game.accuracy?.black || '—'}%

## PGN
\`\`\`pgn
${game.pgn}
\`\`\`
`;
}
