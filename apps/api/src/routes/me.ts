import { Router } from "express";
import { z } from "zod";
import { MAX_NICKNAME_LENGTH, MIN_NICKNAME_LENGTH } from "@error/shared";
import { getPlayerId, requireAuth } from "../middleware/auth.js";
import {
  findPlayerById,
  getPlayerStats,
  updateNickname,
} from "../services/players.js";
import { ApiError } from "../lib/api-error.js";

const nicknameSchema = z
  .string()
  .trim()
  .min(MIN_NICKNAME_LENGTH)
  .max(MAX_NICKNAME_LENGTH)
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u);

const updateMeSchema = z.object({ nickname: nicknameSchema });

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/", async (request, response) => {
  const playerId = getPlayerId(request);
  const player = await findPlayerById(playerId);

  if (!player) {
    throw ApiError.unauthorized("Jogador não encontrado.");
  }

  response.json({ player });
});

meRouter.patch("/", async (request, response) => {
  const playerId = getPlayerId(request);
  const { nickname } = updateMeSchema.parse(request.body);
  const player = await updateNickname(playerId, nickname);
  response.json({ player });
});

meRouter.get("/stats", async (request, response) => {
  const playerId = getPlayerId(request);
  const stats = await getPlayerStats(playerId);
  response.json({ stats });
});
