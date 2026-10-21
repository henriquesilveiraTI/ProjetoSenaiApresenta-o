import { Router } from "express";
import { z } from "zod";
import {
  MAX_NICKNAME_LENGTH,
  MIN_NICKNAME_LENGTH,
  type GuestAuthResponse,
} from "@error/shared";
import { upsertGuestPlayer } from "../services/players.js";
import { createAccessToken } from "../lib/token.js";

const nicknameSchema = z
  .string()
  .trim()
  .min(MIN_NICKNAME_LENGTH, "O apelido precisa ter pelo menos 2 caracteres.")
  .max(MAX_NICKNAME_LENGTH, "O apelido pode ter no máximo 20 caracteres.")
  .regex(
    /^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u,
    "Use letras, números, espaço, ponto, hífen ou sublinhado.",
  );

const guestSchema = z.object({
  deviceId: z.string().uuid("Identificador de dispositivo inválido."),
  nickname: nicknameSchema,
});

export const authRouter = Router();

authRouter.post("/guest", async (request, response) => {
  const { deviceId, nickname } = guestSchema.parse(request.body);
  const player = await upsertGuestPlayer(deviceId, nickname);
  const token = createAccessToken(player.id);

  const body: GuestAuthResponse = { token, player };
  response.status(200).json(body);
});
