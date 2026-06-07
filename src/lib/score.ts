// src/lib/score.ts
export function calculateScore(
  answers: string[],
  correctAnswers: string[]
): number {
  return answers.reduce((score, answer, i) => {
    return score + (answer === correctAnswers[i] ? 1 : 0);
  }, 0);
}