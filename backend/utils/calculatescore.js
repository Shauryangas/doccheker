export function calculateVisionScore(findings) {
  const weights = { low: 0.05, medium: 0.15, high: 0.25 };
  let score = 0;
  for (const f of findings) {
    score += weights[f.severity];
  }

  return Math.min(score, 0.9);
}
