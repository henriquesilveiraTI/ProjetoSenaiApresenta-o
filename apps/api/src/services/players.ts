import type { PlayerProfile, PlayerStats, RunSummary } from "@error/shared";
import { query } from "../db/pool.js";

interface PlayerRow {
  id: string;
  nickname: string;
  created_at: Date;
}

interface StatsRow {
  games: number;
  completed: number;
  failed: number;
  best_score: number;
  total_correct: number;
  total_answers: number;
  best_streak: number;
  total_time_ms: string | number;
}

interface RecentRunRow {
  id: string;
  status: RunSummary["status"];
  score: number;
  correct_count: number;
  total_phases: number;
  wrong_count: number;
  best_streak: number;
  duration_ms: number | null;
  started_at: Date;
  finished_at: Date | null;
}

function toProfile(row: PlayerRow): PlayerProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    createdAt: row.created_at.toISOString(),
  };
}

export async function upsertGuestPlayer(
  deviceId: string,
  nickname: string,
): Promise<PlayerProfile> {
  const result = await query<PlayerRow>(
    `INSERT INTO players (device_id, nickname)
     VALUES ($1, $2)
     ON CONFLICT (device_id)
     DO UPDATE SET nickname = EXCLUDED.nickname
     RETURNING id, nickname, created_at`,
    [deviceId, nickname],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Não foi possível criar o jogador.");
  }

  return toProfile(row);
}

export async function findPlayerById(
  playerId: string,
): Promise<PlayerProfile | null> {
  const result = await query<PlayerRow>(
    "SELECT id, nickname, created_at FROM players WHERE id = $1",
    [playerId],
  );

  const row = result.rows[0];
  return row ? toProfile(row) : null;
}

export async function updateNickname(
  playerId: string,
  nickname: string,
): Promise<PlayerProfile> {
  const result = await query<PlayerRow>(
    `UPDATE players
     SET nickname = $2
     WHERE id = $1
     RETURNING id, nickname, created_at`,
    [playerId, nickname],
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Jogador não encontrado.");
  }

  return toProfile(row);
}

export async function getPlayerStats(playerId: string): Promise<PlayerStats> {
  const [statsResult, recentResult] = await Promise.all([
    query<StatsRow>(
      `SELECT
         COUNT(*)::int AS games,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
         COALESCE(MAX(score), 0)::int AS best_score,
         COALESCE(SUM(correct_count), 0)::int AS total_correct,
         COALESCE(SUM(correct_count + wrong_count), 0)::int AS total_answers,
         COALESCE(MAX(best_streak), 0)::int AS best_streak,
         COALESCE(SUM(duration_ms), 0) AS total_time_ms
       FROM runs
       WHERE player_id = $1 AND status IN ('completed', 'failed')`,
      [playerId],
    ),
    query<RecentRunRow>(
      `SELECT id, status, score, correct_count, total_phases, wrong_count,
              best_streak, duration_ms, started_at, finished_at
       FROM runs
       WHERE player_id = $1
       ORDER BY started_at DESC
       LIMIT 6`,
      [playerId],
    ),
  ]);

  const stats = statsResult.rows[0];
  const games = stats?.games ?? 0;
  const totalAnswers = stats?.total_answers ?? 0;

  return {
    games,
    completed: stats?.completed ?? 0,
    failed: stats?.failed ?? 0,
    bestScore: stats?.best_score ?? 0,
    totalCorrect: stats?.total_correct ?? 0,
    totalAnswers,
    accuracy:
      totalAnswers > 0
        ? Math.round(((stats?.total_correct ?? 0) / totalAnswers) * 100)
        : 0,
    bestStreak: stats?.best_streak ?? 0,
    totalTimeMs: Number(stats?.total_time_ms ?? 0),
    recentRuns: recentResult.rows.map((row) => ({
      id: row.id,
      status: row.status,
      score: row.score,
      cleared: row.correct_count,
      totalPhases: row.total_phases,
      correctCount: row.correct_count,
      wrongCount: row.wrong_count,
      bestStreak: row.best_streak,
      durationMs: row.duration_ms,
      startedAt: row.started_at.toISOString(),
      finishedAt: row.finished_at?.toISOString() ?? null,
    })),
  };
}
