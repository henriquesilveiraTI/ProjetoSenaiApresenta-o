import type { LeaderboardEntry } from "@error/shared";
import { query } from "../db/pool.js";

interface LeaderboardRow {
  rank: number;
  player_id: string;
  nickname: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  total_phases: number;
  best_streak: number;
  status: LeaderboardEntry["status"];
  duration_ms: number | null;
  finished_at: Date;
}

export async function getLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const result = await query<LeaderboardRow>(
    `WITH best_runs AS (
       SELECT DISTINCT ON (r.player_id)
         r.player_id,
         r.score,
         r.correct_count,
         r.wrong_count,
         r.total_phases,
         r.best_streak,
         r.status,
         r.duration_ms,
         r.finished_at,
         p.nickname
       FROM runs r
       INNER JOIN players p ON p.id = r.player_id
       WHERE r.status IN ('completed', 'failed')
       ORDER BY
         r.player_id,
         r.score DESC,
         r.correct_count DESC,
         r.duration_ms ASC NULLS LAST,
         r.finished_at ASC
     )
     SELECT
       ROW_NUMBER() OVER (
         ORDER BY score DESC, correct_count DESC, duration_ms ASC NULLS LAST, finished_at ASC
       )::int AS rank,
       player_id,
       nickname,
       score,
       correct_count,
       wrong_count,
       total_phases,
       best_streak,
       status,
       duration_ms,
       finished_at
     FROM best_runs
     ORDER BY rank ASC
     LIMIT $1`,
    [limit],
  );

  return result.rows.map((row) => ({
    rank: row.rank,
    playerId: row.player_id,
    nickname: row.nickname,
    score: row.score,
    cleared: row.correct_count,
    totalPhases: row.total_phases,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    bestStreak: row.best_streak,
    status: row.status,
    durationMs: row.duration_ms,
    finishedAt: row.finished_at.toISOString(),
  }));
}
