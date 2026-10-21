import { Router } from "express";
import { z } from "zod";
import { getLeaderboard } from "../services/leaderboard.js";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (request, response) => {
  const { limit } = querySchema.parse(request.query);
  const entries = await getLeaderboard(limit);
  response.json({ entries });
});
