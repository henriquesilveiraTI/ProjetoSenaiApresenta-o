import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { pool, closePool } from "./pool.js";
import { logger } from "../lib/logger.js";

const migrationsDir = fileURLToPath(new URL("../../db/migrations", import.meta.url));

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const filename of files) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE filename = $1",
      [filename],
    );

    if (alreadyApplied.rowCount && alreadyApplied.rowCount > 0) {
      logger.info({ filename }, "Migration já aplicada");
      continue;
    }

    const sql = await readFile(path.join(migrationsDir, filename), "utf8");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [filename],
      );
      await client.query("COMMIT");
      logger.info({ filename }, "Migration aplicada");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

const isMain =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
  runMigrations()
    .then(async () => {
      logger.info("Banco de dados atualizado.");
      await closePool();
    })
    .catch(async (error: unknown) => {
      logger.error({ err: error }, "Falha ao aplicar migrations");
      await closePool();
      process.exitCode = 1;
    });
}
