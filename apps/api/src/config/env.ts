import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL é obrigatória.")
    .default("postgresql://error:error@localhost:5433/error"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET precisa ter pelo menos 32 caracteres."),
  JWT_EXPIRES_IN: z.string().default("30d"),
  WEB_ORIGIN: z
    .string()
    .default("http://localhost:5173,http://localhost:4173"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuração de ambiente inválida:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  isProduction: data.NODE_ENV === "production",
  isTest: data.NODE_ENV === "test",
  corsOrigins: data.WEB_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
