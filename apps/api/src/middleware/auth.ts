import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../lib/api-error.js";

declare global {
  namespace Express {
    interface Request {
      playerId?: string;
    }
  }
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(ApiError.unauthorized("Envie o token de acesso no cabeçalho Authorization."));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error("Token sem identificação de jogador.");
    }

    request.playerId = payload.sub;
    next();
  } catch {
    next(ApiError.unauthorized());
  }
}

export function getPlayerId(request: Request): string {
  if (!request.playerId) {
    throw ApiError.unauthorized();
  }

  return request.playerId;
}
