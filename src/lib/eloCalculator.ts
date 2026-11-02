export function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  const exponent = (opponentRating - playerRating) / 400;
  const expected = 1 / (1 + Math.pow(10, exponent));
  return Math.round(expected * 1000) / 1000;
}

export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  actualScore: 1 | 0.5 | 0,
  kFactor: number = 20
): { delta: number; newRating: number; expectedScore: number } {
  const expectedScore = calculateExpectedScore(playerRating, opponentRating);
  const rawDelta = kFactor * (actualScore - expectedScore);
  const delta = Math.round(rawDelta * 10) / 10;
  const newRating = Math.round(playerRating + delta);

  return {
    delta,
    newRating,
    expectedScore,
  };
}

export function calculateTournamentPerformanceRating(
  opponentRatings: number[],
  totalScore: number
): number {
  if (!opponentRatings || opponentRatings.length === 0) return 0;
  const avgOpponent = opponentRatings.reduce((sum, r) => sum + r, 0) / opponentRatings.length;
  const percentage = totalScore / opponentRatings.length;
  const clamped = Math.max(0.01, Math.min(0.99, percentage));
  const dp = -400 * Math.log10(1 / clamped - 1);
  return Math.round(avgOpponent + dp);
}
