import { pool, closePool } from "./pool.js";
import { runMigrations } from "./migrate.js";
import { logger } from "../lib/logger.js";

async function reset(): Promise<void> {
  logger.warn("Apagando todas as tabelas do schema public...");
  await pool.query(`
    DROP TABLE IF EXISTS answers CASCADE;
    DROP TABLE IF EXISTS runs CASCADE;
    DROP TABLE IF EXISTS players CASCADE;
    DROP TABLE IF EXISTS schema_migrations CASCADE;
    DROP TYPE IF EXISTS run_status CASCADE;
  `);
  await runMigrations();
  logger.info("Banco de dados recriado e migrations aplicadas.");
}

reset()
  .then(async () => {
    await closePool();
  })
  .catch(async (error: unknown) => {
    logger.error({ err: error }, "Falha ao resetar o banco");
    await closePool();
    process.exitCode = 1;
  });
