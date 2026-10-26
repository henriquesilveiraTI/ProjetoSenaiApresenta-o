import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { closePool } from "./db/pool.js";

const app = createApp();
const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `ERROR API ouvindo em http://localhost:${env.PORT}`,
  );
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "Encerrando servidor...");

  const forceExit = setTimeout(() => {
    logger.error("Encerramento forçado após 10 segundos.");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async (error) => {
    if (error) {
      logger.error({ err: error }, "Erro ao fechar o servidor HTTP");
      process.exitCode = 1;
    }

    try {
      await closePool();
    } catch (poolError) {
      logger.error({ err: poolError }, "Erro ao fechar o pool do banco");
      process.exitCode = 1;
    }

    clearTimeout(forceExit);
    process.exit();
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Promise rejeitada sem tratamento");
});

// A Vercel usa o app exportado como handler da função serverless.
export default app;
