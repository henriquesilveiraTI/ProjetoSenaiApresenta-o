import type {
  AnswerLog,
  AnswerResult,
  CreateRunResponse,
  PhaseAnswer,
  PublicPhase,
  RunDetails,
  RunState,
  RunStatus,
} from "@error/shared";
import { MAX_LIVES } from "@error/shared";
import type { PoolClient } from "pg";
import { query, withTransaction } from "../db/pool.js";
import { ApiError } from "../lib/api-error.js";
import { findPhaseByPublicId, getPhase, TOTAL_PHASES } from "../game/phases.js";
import { calculatePoints, feedbackFor } from "../game/scoring.js";
import { parsePhaseAnswer } from "../game/answer-schema.js";

interface RunRow {
  id: string;
  player_id: string;
  status: RunStatus;
  score: number;
  lives: number;
  streak: number;
  best_streak: number;
  current_phase: number;
  total_phases: number;
  correct_count: number;
  wrong_count: number;
  started_at: Date;
  phase_started_at: Date;
  finished_at: Date | null;
  duration_ms: number | null;
}

interface AnswerRow {
  phase_id: string;
  phase_index: number;
  correct: boolean;
  points: number;
  duration_ms: number;
}

export interface SubmitAnswerInput {
  phaseId: string;
  phaseIndex: number;
  answer: unknown;
  durationMs: number;
}

function serializeRun(row: RunRow): RunState {
  const phase: PublicPhase | null =
    row.status === "active" ? getPhase(row.current_phase)?.public ?? null : null;

  return {
    id: row.id,
    status: row.status,
    score: row.score,
    lives: row.lives,
    maxLives: MAX_LIVES,
    streak: row.streak,
    bestStreak: row.best_streak,
    currentPhaseIndex: row.current_phase,
    cleared: row.correct_count,
    totalPhases: row.total_phases,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    startedAt: row.started_at.toISOString(),
    phaseStartedAt: row.phase_started_at.toISOString(),
    finishedAt: row.finished_at?.toISOString() ?? null,
    durationMs: row.duration_ms,
    phase,
  };
}

export async function createRun(playerId: string): Promise<CreateRunResponse> {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE runs
       SET status = 'abandoned',
           finished_at = now(),
           duration_ms = GREATEST(
             0,
             FLOOR(EXTRACT(EPOCH FROM (now() - started_at)) * 1000)::int
           )
       WHERE player_id = $1 AND status = 'active'`,
      [playerId],
    );

    const result = await client.query<RunRow>(
      `INSERT INTO runs (player_id, total_phases)
       VALUES ($1, $2)
       RETURNING *`,
      [playerId, TOTAL_PHASES],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("Não foi possível iniciar a partida.");
    }

    return { run: serializeRun(row), resumed: false };
  });
}

export async function getActiveRun(playerId: string): Promise<RunState | null> {
  const result = await query<RunRow>(
    `SELECT * FROM runs
     WHERE player_id = $1 AND status = 'active'
     ORDER BY started_at DESC
     LIMIT 1`,
    [playerId],
  );

  const row = result.rows[0];
  return row ? serializeRun(row) : null;
}

export async function getRunDetails(
  playerId: string,
  runId: string,
): Promise<RunDetails> {
  const runResult = await query<RunRow>(
    "SELECT * FROM runs WHERE id = $1 AND player_id = $2",
    [runId, playerId],
  );

  const row = runResult.rows[0];
  if (!row) {
    throw ApiError.notFound("Partida não encontrada.");
  }

  const answersResult = await query<AnswerRow>(
    `SELECT phase_id, phase_index, correct, points, duration_ms
     FROM answers
     WHERE run_id = $1
     ORDER BY phase_index ASC`,
    [runId],
  );

  const answers: AnswerLog[] = answersResult.rows.map((answer) => {
    const phase = findPhaseByPublicId(answer.phase_id);
    return {
      phaseIndex: answer.phase_index,
      phaseId: answer.phase_id,
      phaseTitle: phase
        ? `FASE ${phase.public.number} — ${phase.public.eyebrow}`
        : `FASE ${answer.phase_index + 1}`,
      correct: answer.correct,
      points: answer.points,
      durationMs: answer.duration_ms,
    };
  });

  return { run: serializeRun(row), answers };
}

export async function submitAnswer(
  playerId: string,
  runId: string,
  input: SubmitAnswerInput,
): Promise<AnswerResult> {
  const answer = parsePhaseAnswer(input.answer);
  const durationMs = Math.min(
    Math.max(Math.round(input.durationMs), 0),
    600_000,
  );

  return withTransaction(async (client: PoolClient) => {
    const runResult = await client.query<RunRow>(
      `SELECT * FROM runs
       WHERE id = $1 AND player_id = $2
       FOR UPDATE`,
      [runId, playerId],
    );

    const run = runResult.rows[0];
    if (!run) {
      throw ApiError.notFound("Partida não encontrada.");
    }

    if (run.status !== "active") {
      throw ApiError.conflict(
        "RUN_FINISHED",
        "Esta partida já foi encerrada.",
      );
    }

    if (input.phaseIndex !== run.current_phase) {
      throw ApiError.conflict(
        "PHASE_MISMATCH",
        "A fase enviada não é a fase atual da partida.",
      );
    }

    const phase = getPhase(run.current_phase);
    if (!phase) {
      throw ApiError.conflict(
        "PHASE_NOT_FOUND",
        "A próxima fase não existe. Inicie uma nova partida.",
      );
    }

    if (input.phaseId !== phase.public.id) {
      throw ApiError.conflict(
        "PHASE_MISMATCH",
        "A fase enviada não corresponde à fase atual.",
      );
    }

    if (answer.kind !== phase.public.kind) {
      throw ApiError.badRequest(
        "ANSWER_KIND_MISMATCH",
        "O tipo da resposta não corresponde ao tipo da fase.",
      );
    }

    const correct = phase.validate(answer as PhaseAnswer);
    const streak = correct ? run.streak + 1 : 0;
    const bestStreak = Math.max(run.best_streak, streak);
    const points = calculatePoints(correct, durationMs, streak);
    const lives = correct ? run.lives : Math.max(run.lives - 1, 0);
    const isLastPhase = run.current_phase >= run.total_phases - 1;

    let status: RunStatus = "active";
    if (lives === 0) {
      status = "failed";
    } else if (isLastPhase) {
      status = correct ? "completed" : "failed";
    }

    const finishedAt = status === "active" ? null : new Date();
    const totalDuration =
      finishedAt !== null
        ? Math.max(0, finishedAt.getTime() - run.started_at.getTime())
        : null;
    const nextPhaseIndex =
      status === "active" ? run.current_phase + 1 : run.current_phase;

    await client.query(
      `INSERT INTO answers
         (run_id, phase_id, phase_index, answer, correct, points, duration_ms)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
      [
        run.id,
        phase.public.id,
        run.current_phase,
        JSON.stringify(answer),
        correct,
        points,
        durationMs,
      ],
    );

    const updateResult = await client.query<RunRow>(
      `UPDATE runs
       SET status = $2,
           score = score + $3,
           lives = $4,
           streak = $5,
           best_streak = $6,
           current_phase = $7,
           correct_count = correct_count + $8,
           wrong_count = wrong_count + $9,
           finished_at = $10,
           duration_ms = $11,
           phase_started_at = CASE WHEN $2::run_status = 'active' THEN now() ELSE phase_started_at END
       WHERE id = $1
       RETURNING *`,
      [
        run.id,
        status,
        points,
        lives,
        streak,
        bestStreak,
        nextPhaseIndex,
        correct ? 1 : 0,
        correct ? 0 : 1,
        finishedAt,
        totalDuration,
      ],
    );

    const updated = updateResult.rows[0];
    if (!updated) {
      throw new Error("Falha ao atualizar a partida.");
    }

    return {
      correct,
      points,
      feedback: feedbackFor(correct),
      explanation: phase.explanation,
      run: serializeRun(updated),
    };
  });
}

export async function abandonRun(
  playerId: string,
  runId: string,
): Promise<RunState> {
  const result = await query<RunRow>(
    `UPDATE runs
     SET status = 'abandoned',
         finished_at = now(),
         duration_ms = GREATEST(
           0,
           FLOOR(EXTRACT(EPOCH FROM (now() - started_at)) * 1000)::int
         )
     WHERE id = $1 AND player_id = $2 AND status = 'active'
     RETURNING *`,
    [runId, playerId],
  );

  const row = result.rows[0];
  if (!row) {
    throw ApiError.conflict(
      "RUN_NOT_ACTIVE",
      "A partida não existe ou já foi encerrada.",
    );
  }

  return serializeRun(row);
}
