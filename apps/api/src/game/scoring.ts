export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 40;
export const SPEED_PENALTY_PER_SECOND = 4;
export const STREAK_BONUS_STEP = 25;
export const MAX_STREAK_BONUS = 75;

/**
 * Pontuação de uma resposta correta.
 *
 * - 100 pontos base
 * - até 40 de bônus por velocidade
 * - até 75 de bônus por sequência de acertos (3 acertos ou mais)
 */
export function calculatePoints(
  correct: boolean,
  durationMs: number,
  newStreak: number,
): number {
  if (!correct) return 0;

  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  const speedBonus = Math.max(
    0,
    MAX_SPEED_BONUS - seconds * SPEED_PENALTY_PER_SECOND,
  );
  const streakBonus = Math.min(
    Math.max(newStreak - 1, 0) * STREAK_BONUS_STEP,
    MAX_STREAK_BONUS,
  );

  return BASE_POINTS + speedBonus + streakBonus;
}

export function feedbackFor(correct: boolean): string {
  return correct ? "RESPOSTA CERTA" : "RESPOSTA ERRADA";
}
