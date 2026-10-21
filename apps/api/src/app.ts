import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import { z } from "zod";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { ApiError } from "./lib/api-error.js";
import { query } from "./db/pool.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { runsRouter } from "./routes/runs.js";
import { leaderboardRouter } from "./routes/leaderboard.js";

export function createApp() {
  const app = express();

  if (env.isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || env.corsOrigins.includes(origin));
      },
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86_400,
    }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (request) => request.url === "/api/health",
      },
    }),
  );

  const globalLimiter = rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Muitas requisições. Aguarde um instante.",
        },
      });
    },
  });

  const authLimiter = rateLimit({
    windowMs: 10 * 60_000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Muitas tentativas de acesso. Aguarde alguns minutos.",
        },
      });
    },
  });

  const answerLimiter = rateLimit({
    windowMs: 60_000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Muitas respostas em pouco tempo. Respire.",
        },
      });
    },
  });

  app.use("/api", globalLimiter);

  app.get("/api/health", async (_request, response) => {
    try {
      await query("SELECT 1");
      response.json({
        status: "ok",
        database: "up",
        timestamp: new Date().toISOString(),
      });
    } catch {
      response.status(503).json({
        status: "degraded",
        database: "down",
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/runs", answerLimiter, runsRouter);
  app.use("/api/leaderboard", leaderboardRouter);

  app.use((request, _response, next) => {
    next(
      ApiError.notFound(`A rota ${request.method} ${request.originalUrl} não existe.`),
    );
  });

  app.use(
    (
      error: unknown,
      request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof ApiError) {
        response.status(error.status).json({
          error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        });
        return;
      }

      if (error instanceof z.ZodError) {
        response.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Os dados enviados são inválidos.",
            details: z.prettifyError(error),
          },
        });
        return;
      }

      logger.error(
        { err: error, method: request.method, url: request.originalUrl },
        "Erro não tratado",
      );

      response.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "O sistema falhou. Tente novamente.",
        },
      });
    },
  );

  return app;
}
