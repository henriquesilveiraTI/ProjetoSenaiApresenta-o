import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.isProduction ? 20 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  application_name: "error-api",
});

pool.on("error", (error) => {
  logger.error({ err: error }, "Erro inesperado no pool do PostgreSQL");
});

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, values);
}

export async function withTransaction<T>(
  handler: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
