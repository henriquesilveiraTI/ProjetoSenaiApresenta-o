import { Router } from "express";
import { z } from "zod";
import { getPlayerId, requireAuth } from "../middleware/auth.js";
import {
  abandonRun,
  createRun,
  getActiveRun,
  getRunDetails,
  submitAnswer,
} from "../services/runs.js";

const runIdSchema = z.string().uuid("Identificador de partida inválido.");

const answerBodySchema = z.object({
  phaseId: z.string().min(1).max(80),
  phaseIndex: z.number().int().min(0).max(100),
  answer: z.unknown(),
  durationMs: z.number().int().min(0).max(600_000),
});

export const runsRouter = Router();

runsRouter.use(requireAuth);

runsRouter.post("/", async (request, response) => {
  const playerId = getPlayerId(request);
  const result = await createRun(playerId);
  response.status(201).json(result);
});

runsRouter.get("/active", async (request, response) => {
  const playerId = getPlayerId(request);
  const run = await getActiveRun(playerId);
  response.json({ run });
});

runsRouter.get("/:id", async (request, response) => {
  const playerId = getPlayerId(request);
  const runId = runIdSchema.parse(request.params.id);
  const details = await getRunDetails(playerId, runId);
  response.json(details);
});

runsRouter.post("/:id/answers", async (request, response) => {
  const playerId = getPlayerId(request);
  const runId = runIdSchema.parse(request.params.id);
  const body = answerBodySchema.parse(request.body);
  const result = await submitAnswer(playerId, runId, body);
  response.json(result);
});

runsRouter.post("/:id/abandon", async (request, response) => {
  const playerId = getPlayerId(request);
  const runId = runIdSchema.parse(request.params.id);
  const run = await abandonRun(playerId, runId);
  response.json({ run });
});
