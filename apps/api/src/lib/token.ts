import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(playerId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: playerId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "error-api",
    audience: "error-web",
  });
}
